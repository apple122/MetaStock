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
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      console.log('[WalletContext] Loading data for user:', user.id);
      try {
        // Load transactions
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (txError) {
          console.error('[WalletContext] Error loading transactions:', txError.message, txError.details, txError.hint);
        } else {
          console.log('[WalletContext] Transactions loaded:', txData?.length ?? 0);
          setTransactions((txData ?? []).map((tx: any) => ({
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

        // Load portfolio
        const { data: portData, error: portError } = await supabase
          .from('portfolio')
          .select('asset_symbol, units')
          .eq('user_id', user.id);

        if (portError) {
          console.error('[WalletContext] Error loading portfolio:', portError.message, portError.details, portError.hint);
        } else {
          console.log('[WalletContext] Portfolio loaded:', portData?.length ?? 0, 'assets');
          const portMap: Record<string, number> = {};
          (portData ?? []).forEach((p: any) => { portMap[p.asset_symbol] = Number(p.units); });
          setPortfolio(portMap);
        }
      } catch (err) {
        console.error('[WalletContext] Unexpected error loading wallet data:', err);
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

    console.log(`[WalletContext] Executing ${type} trade:`, asset.symbol, 'amount:', amountUSD);
    try {
      if (type === 'buy') {
        const newBalance = balance - amountUSD;
        const newUnits = (portfolio[asset.symbol] || 0) + units;

        // 1. Update balance
        const { error: balErr } = await supabase
          .from('profiles')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        if (balErr) { console.error('[WalletContext] Balance update failed:', balErr); return { success: false, message: 'Failed to update balance: ' + balErr.message }; }

        // 2. Insert transaction
        const { data: txData, error: txErr } = await supabase
          .from('transactions')
          .insert({ user_id: user.id, type: 'buy', asset_symbol: asset.symbol, amount: units, price: asset.price, total: amountUSD, status: 'success' })
          .select()
          .single();
        if (txErr) { console.error('[WalletContext] Transaction insert failed:', txErr); return { success: false, message: 'Failed to save transaction: ' + txErr.message }; }

        // 3. Upsert portfolio
        const { error: portErr } = await supabase
          .from('portfolio')
          .upsert({ user_id: user.id, asset_symbol: asset.symbol, units: newUnits, updated_at: new Date().toISOString() }, { onConflict: 'user_id,asset_symbol' });
        if (portErr) { console.error('[WalletContext] Portfolio upsert failed:', portErr); }

        // 4. Update local state
        setBalance(newBalance);
        setPortfolio(prev => ({ ...prev, [asset.symbol]: newUnits }));
        if (txData) {
          setTransactions(prev => [{ id: txData.id, type: 'buy', asset: asset.symbol, amount: units, price: asset.price, total: amountUSD, timestamp: txData.created_at, status: 'success' }, ...prev]);
        }
        await refreshProfile();
        console.log('[WalletContext] Buy success:', units.toFixed(6), asset.symbol);
        return { success: true, message: `Bought ${units.toFixed(4)} ${asset.symbol}` };

      } else {
        const held = portfolio[asset.symbol] || 0;
        if (units > held) return { success: false, message: 'Insufficient assets' };

        const newBalance = balance + amountUSD;
        const newUnits = held - units;

        // 1. Update balance
        const { error: balErr } = await supabase
          .from('profiles')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        if (balErr) { console.error('[WalletContext] Balance update failed:', balErr); return { success: false, message: 'Failed to update balance: ' + balErr.message }; }

        // 2. Insert transaction
        const { data: txData, error: txErr } = await supabase
          .from('transactions')
          .insert({ user_id: user.id, type: 'sell', asset_symbol: asset.symbol, amount: units, price: asset.price, total: amountUSD, status: 'success' })
          .select()
          .single();
        if (txErr) { console.error('[WalletContext] Transaction insert failed:', txErr); return { success: false, message: 'Failed to save transaction: ' + txErr.message }; }

        // 3. Upsert portfolio
        const { error: portErr } = await supabase
          .from('portfolio')
          .upsert({ user_id: user.id, asset_symbol: asset.symbol, units: newUnits, updated_at: new Date().toISOString() }, { onConflict: 'user_id,asset_symbol' });
        if (portErr) { console.error('[WalletContext] Portfolio upsert failed:', portErr); }

        // 4. Update local state
        setBalance(newBalance);
        setPortfolio(prev => ({ ...prev, [asset.symbol]: newUnits }));
        if (txData) {
          setTransactions(prev => [{ id: txData.id, type: 'sell', asset: asset.symbol, amount: units, price: asset.price, total: amountUSD, timestamp: txData.created_at, status: 'success' }, ...prev]);
        }
        await refreshProfile();
        console.log('[WalletContext] Sell success:', units.toFixed(6), asset.symbol);
        return { success: true, message: `Sold ${units.toFixed(4)} ${asset.symbol}` };
      }
    } catch (err) {
      console.error('[WalletContext] Trade execution unexpected error:', err);
      return { success: false, message: 'Transaction failed unexpectedly' };
    }
  };

  // --- Deposit ---
  const deposit = async (amount: number) => {
    if (!user) return;
    const newBalance = balance + amount;
    const { error: balErr } = await supabase.from('profiles').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (balErr) { console.error('[WalletContext] Deposit balance update failed:', balErr); return; }
    const { data: txData, error: txErr } = await supabase.from('transactions').insert({
      user_id: user.id, type: 'deposit', asset_symbol: 'USD',
      amount: amount, price: 1, total: amount, status: 'success',
    }).select().single();
    if (txErr) { console.error('[WalletContext] Deposit transaction insert failed:', txErr); }
    setBalance(newBalance);
    setTransactions(prev => [{
      id: txData?.id ?? Math.random().toString(36).slice(2), type: 'deposit', asset: 'USD',
      amount, price: 1, total: amount, timestamp: txData?.created_at ?? new Date().toISOString(), status: 'success',
    }, ...prev]);
    await refreshProfile();
  };

  // --- Withdraw ---
  const withdraw = async (amount: number): Promise<boolean> => {
    if (!user || amount > balance) return false;
    const newBalance = balance - amount;
    const { error: balErr } = await supabase.from('profiles').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (balErr) { console.error('[WalletContext] Withdraw balance update failed:', balErr); return false; }
    const { data: txData, error: txErr } = await supabase.from('transactions').insert({
      user_id: user.id, type: 'withdraw', asset_symbol: 'USD',
      amount: amount, price: 1, total: amount, status: 'success',
    }).select().single();
    if (txErr) { console.error('[WalletContext] Withdraw transaction insert failed:', txErr); }
    setBalance(newBalance);
    setTransactions(prev => [{
      id: txData?.id ?? Math.random().toString(36).slice(2), type: 'withdraw', asset: 'USD',
      amount, price: 1, total: amount, timestamp: txData?.created_at ?? new Date().toISOString(), status: 'success',
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
