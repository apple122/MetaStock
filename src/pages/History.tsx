import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { motion } from 'framer-motion';
import { ClipboardList, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const History: React.FC = () => {
  const {} = useLanguage();
  const { transactions } = useWallet();

  const tradeTransactions = transactions.filter(tx => tx.type === 'buy' || tx.type === 'sell');

  return (
    <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-l-4 border-yellow-500 pl-4">
        <h1 className="text-2xl font-black text-white">รายการของคุณ</h1>
        <div className="text-yellow-500">
           <TrendingUp size={24} />
        </div>
      </div>

      {tradeTransactions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 space-y-6 text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
             <ClipboardList size={48} />
          </div>
          <p className="text-slate-500 font-medium tracking-wide">
            No trading history available.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
           {tradeTransactions.map((tx) => (
             <motion.div 
               key={tx.id}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-card hover:border-primary/30 transition-all flex items-center justify-between group"
             >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'buy' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-tight">{tx.type} {tx.asset}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">
                    ${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {tx.amount.toFixed(6)} Units @ ${tx.price.toLocaleString()}
                  </p>
                </div>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
};
