import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  asset: string;
  amount: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  portfolio: Record<string, number>;
  loading: boolean;
  handleTrade: (type: 'buy' | 'sell', asset: any, amountUSD: number) => Promise<{ success: boolean; message: string }>;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Sync internal balance with profile balance when it loads
  useEffect(() => {
    if (profile) {
      setBalance(Number(profile.balance));
    }
  }, [profile]);

  // --- Load data from Supabase on mount ---
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Transactions and Portfolio are still managed here
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (txData) {
          setTransactions(txData.map((tx: any) => ({
            id: tx.id,
            type: tx.type,
            asset: tx.asset_symbol,
            amount: Number(tx.amount),
            price: Number(tx.price),
            total: Number(tx.total),
            timestamp: tx.created_at,
            status: tx.status,
          })));
        }

        const { data: portData } = await supabase
          .from('portfolio')
          .select('asset_symbol, units')
          .eq('user_id', user.id);

        if (portData) {
          const portMap: Record<string, number> = {};
          portData.forEach((p: any) => { portMap[p.asset_symbol] = Number(p.units); });
          setPortfolio(portMap);
        }
      } catch (err) {
        console.error('Failed to load wallet data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // --- Trade Handler ---
  const handleTrade = async (type: 'buy' | 'sell', asset: any, amountUSD: number): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Not authenticated' };
    
    // Use the latest balance from state (synced with profile)
    if (type === 'buy' && amountUSD > balance) return { success: false, message: 'Insufficient balance' };
    
    const units = amountUSD / asset.price;

    try {
      if (type === 'buy') {
        const newBalance = balance - amountUSD;
        const newUnits = (portfolio[asset.symbol] || 0) + units;

        await supabase.from('profiles').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', user.id);
        
        const { data: txData } = await supabase.from('transactions').insert({
          user_id: user.id, type: 'buy', asset_symbol: asset.symbol,
          amount: units, price: asset.price, total: amountUSD, status: 'success',
        }).select().single();

        await supabase.from('portfolio').upsert({
          user_id: user.id, asset_symbol: asset.symbol, units: newUnits, updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,asset_symbol' });

        setBalance(newBalance);
        setPortfolio(prev => ({ ...prev, [asset.symbol]: newUnits }));
        if (txData) {
          setTransactions(prev => [{
            id: txData.id, type: 'buy', asset: asset.symbol,
            amount: units, price: asset.price, total: amountUSD,
            timestamp: txData.created_at, status: 'success',
          }, ...prev]);
        }
        await refreshProfile(); // Sync global profile
        return { success: true, message: `Bought ${units.toFixed(4)} ${asset.symbol}` };

      } else {
        const held = portfolio[asset.symbol] || 0;
        if (units > held) return { success: false, message: 'Insufficient assets' };

        const newBalance = balance + amountUSD;
        const newUnits = held - units;

        await supabase.from('profiles').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', user.id);

        const { data: txData } = await supabase.from('transactions').insert({
          user_id: user.id, type: 'sell', asset_symbol: asset.symbol,
          amount: units, price: asset.price, total: amountUSD, status: 'success',
        }).select().single();

        await supabase.from('portfolio').upsert({
          user_id: user.id, asset_symbol: asset.symbol, units: newUnits, updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,asset_symbol' });

        setBalance(newBalance);
        setPortfolio(prev => ({ ...prev, [asset.symbol]: newUnits }));
        if (txData) {
          setTransactions(prev => [{
            id: txData.id, type: 'sell', asset: asset.symbol,
            amount: units, price: asset.price, total: amountUSD,
            timestamp: txData.created_at, status: 'success',
          }, ...prev]);
        }
        await refreshProfile(); // Sync global profile
        return { success: true, message: `Sold ${units.toFixed(4)} ${asset.symbol}` };
      }
    } catch (err) {
      console.error('Trade execution failed:', err);
      return { success: false, message: 'Transaction failed' };
    }
  };

  // --- Deposit ---
  const deposit = async (amount: number) => {
    if (!user) return;
    const newBalance = balance + amount;
    await supabase.from('profiles').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', user.id);
    await supabase.from('transactions').insert({
      user_id: user.id, type: 'deposit', asset_symbol: 'USD',
      amount: amount, price: 1, total: amount, status: 'success',
    });
    setBalance(newBalance);
    setTransactions(prev => [{
      id: Math.random().toString(36).slice(2), type: 'deposit', asset: 'USD',
      amount, price: 1, total: amount, timestamp: new Date().toISOString(), status: 'success',
    }, ...prev]);
    await refreshProfile();
  };

  // --- Withdraw ---
  const withdraw = async (amount: number): Promise<boolean> => {
    if (!user || amount > balance) return false;
    const newBalance = balance - amount;
    await supabase.from('profiles').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', user.id);
    await supabase.from('transactions').insert({
      user_id: user.id, type: 'withdraw', asset_symbol: 'USD',
      amount: amount, price: 1, total: amount, status: 'success',
    });
    setBalance(newBalance);
    setTransactions(prev => [{
      id: Math.random().toString(36).slice(2), type: 'withdraw', asset: 'USD',
      amount, price: 1, total: amount, timestamp: new Date().toISOString(), status: 'success',
    }, ...prev]);
    await refreshProfile();
    return true;
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, portfolio, loading, handleTrade, deposit, withdraw }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
