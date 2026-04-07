import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownLeft,
  History as HistoryIcon,
  X,
  Clock,
  DollarSign
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import type { Transaction } from "../../types";

interface TradingPanelProps {
  balance: number;
  amount: string;
  setAmount: (val: string) => void;
  orderType: "buy" | "sell";
  setOrderType: (val: "buy" | "sell") => void;
  onTrade: () => void;
  tradeLoading: boolean;
  selectedAsset: { symbol: string };
  livePrice: number;
  transactions: Transaction[];
}

export const TradingPanel: React.FC<TradingPanelProps> = ({
  balance,
  amount,
  setAmount,
  orderType,
  setOrderType,
  onTrade,
  tradeLoading,
  selectedAsset,
  livePrice,
  transactions,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showAmountModal, setShowAmountModal] = useState(false);
  const [tempAmount, setTempAmount] = useState(amount);
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer logic for Amount Modal
  useEffect(() => {
    let timer: any;
    if (showAmountModal && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && showAmountModal) {
      setShowAmountModal(false);
    }
    return () => clearInterval(timer);
  }, [showAmountModal, timeLeft]);

  const presetAmounts = [1, 5, 10, 50, 100, 500];

  const handleConfirmAmount = (amt: string) => {
    setAmount(amt);
    setShowAmountModal(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card"
      >
        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl mb-6">
          <button
            onClick={() => setOrderType("buy")}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
              orderType === "buy"
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {t("buy")}
          </button>
          <button
            onClick={() => setOrderType("sell")}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
              orderType === "sell"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {t("sell")}
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">
              Amount (USD)
            </label>
            <div 
              className="relative group cursor-pointer"
              onClick={() => {
                setTempAmount(amount);
                setTimeLeft(30);
                setShowAmountModal(true);
              }}
            >
              <div
                className="w-full bg-slate-900 border border-white/5 hover:border-primary/30 rounded-xl py-4 px-4 text-2xl font-black text-white transition-all flex items-center"
              >
                {amount || "0.00"}
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold pointer-events-none">
                USD
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-500 px-1">
            <div className="flex flex-col gap-0.5">
              <span>
                Balance: $
                {balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-primary/70 italic">Minimum: $1.00</span>
            </div>
            <span
              onClick={() => setAmount(balance.toString())}
              className="text-primary cursor-pointer hover:underline self-end"
            >
              MAX
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Est. {selectedAsset.symbol}</span>
              <span className="text-white font-mono">
                {(Number(amount) / livePrice || 0).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Fee (0.1%)</span>
              <span className="text-white font-mono">
                ${(Number(amount) * 0.001 || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onTrade}
            disabled={tradeLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 ${
              orderType === "buy"
                ? "bg-green-500 shadow-green-500/20"
                : "bg-red-500 shadow-red-500/20"
            }`}
          >
            {orderType === "buy" ? (
              <ArrowUpRight size={20} />
            ) : (
              <ArrowDownLeft size={20} />
            )}
            {orderType === "buy"
              ? `${t("buy")} ${selectedAsset.symbol}`
              : `${t("sell")} ${selectedAsset.symbol}`}
          </button>
        </div>
      </motion.div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HistoryIcon size={16} className="text-primary" />
            {t("recentTransactions")}
          </h3>
          <button
            onClick={() => navigate("/history")}
            className="text-xs text-slate-500 hover:text-primary transition-colors"
          >
            View All
          </button>
        </div>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {transactions
            .filter((t_tx) => t_tx.asset === selectedAsset.symbol)
            .map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:translate-x-1 transition-transform cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center relative flex-shrink-0 shadow-sm ${tx.type === "buy" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {tx.type === "buy" ? (
                      <ArrowUpRight size={16} strokeWidth={2.5} />
                    ) : (
                      <ArrowDownLeft size={16} strokeWidth={2.5} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase group-hover:text-primary transition-colors">
                      {tx.type} {tx.asset}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold ${
                      tx.type === "buy" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {tx.type === "buy" ? "-" : "+"}$
                    {tx.total.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">{tx.status}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Custom Amount Selection Modal */}
      <AnimatePresence>
        {showAmountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
            onClick={() => setShowAmountModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between relative bg-slate-900/50">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <DollarSign size={20} className="text-primary" /> Investment
                </h2>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tabular-nums transition-colors ${timeLeft <= 5 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-primary/20 text-primary'}`}>
                    <Clock size={12} />
                    00:{timeLeft.toString().padStart(2, '0')}
                  </div>
                  <button 
                    onClick={() => setShowAmountModal(false)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Balance View */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Available Balance</p>
                    <p className="text-xl font-bold text-white tabular-nums">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <button 
                    onClick={() => setTempAmount(balance.toString())}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black uppercase transition-colors"
                  >
                    Max
                  </button>
                </div>

                {/* Amount Output */}
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-500">$</span>
                  <input
                    type="number"
                    value={tempAmount}
                    onChange={(e) => setTempAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full bg-slate-900/80 border border-white/10 hover:border-primary/50 focus:border-primary rounded-2xl py-5 pl-10 pr-16 text-3xl font-black text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all tabular-nums"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">USD</span>
                </div>

                {/* 3x2 Preset Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTempAmount(preset.toString())}
                      className="py-3 rounded-xl bg-slate-800 border border-white/5 hover:border-white/20 hover:bg-slate-700 text-white font-bold text-lg transition-all active:scale-95"
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                
                {/* Submit Area */}
                <button
                  onClick={() => handleConfirmAmount(tempAmount)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-black text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center"
                >
                  Confirm Amount
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
