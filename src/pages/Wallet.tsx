import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useWallet } from "../contexts/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet as WalletIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart,
  Clock,
  Zap,
  X,
} from "lucide-react";
import { DepositModal } from "../components/wallet/DepositModal";
import { WithdrawModal } from "../components/wallet/WithdrawModal";

type ModalType = "deposit" | "withdraw" | "staking" | null;

const getAssetCategory = (symbol: string) => {
  if (["BTC", "ETH", "USDT", "BNB", "SOL", "DOGE"].includes(symbol))
    return "crypto";
  if (symbol === "GOLD") return "commodity";
  return "stock";
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export const Wallet: React.FC = () => {
  const { t } = useLanguage();
  const { balance, transactions } = useWallet();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const closeModal = () => setActiveModal(null);

  const actions = [
    {
      key: "deposit" as ModalType,
      label: t("deposit"),
      icon: <ArrowDownCircle size={24} className="text-green-500" />,
      color: "from-green-500/20 to-emerald-600/20",
    },
    {
      key: "staking" as ModalType,
      label: t("staking"),
      icon: <Zap size={24} className="text-yellow-500" />,
      color: "from-yellow-500/20 to-orange-600/20",
    },
    {
      key: "withdraw" as ModalType,
      label: t("withdraw"),
      icon: <ArrowUpCircle size={24} className="text-red-500" />,
      color: "from-red-500/20 to-rose-600/20",
    },
  ];

  return (
    <div className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-8">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group h-full"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent blur-3xl opacity-20 pointer-events-none" />
        <div className="glass-card bg-gradient-to-br from-slate-900 to-slate-800 p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between border-primary/20">
          <div className="space-y-6 relative z-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-slate-400">
              <WalletIcon size={20} />
              <span className="text-sm font-bold tracking-widest uppercase">
                {t("totalBalance")}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight break-words">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>

          <div className="mt-8 md:mt-0 grid grid-cols-2 gap-4 relative z-10">
            {actions.map((action, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveModal(action.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-3 p-6 ${i === 2 ? "col-span-2" : ""} rounded-2xl bg-gradient-to-tr ${action.color} border border-white/5 shadow-2xl transition-all cursor-pointer hover:border-white/20`}
              >
                {action.icon}
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        {/* Trade History (Buy / Sell) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-0 overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <PieChart size={20} className="text-accent" />
              {t("tradeHistory")}
            </h3>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="all">{t("allCategories")}</option>
              <option value="crypto">{t("crypto")}</option>
              <option value="commodity">{t("commodity")}</option>
              <option value="stock">{t("stock")}</option>
            </select>
          </div>
          <div className="p-6 space-y-4">
            {transactions
              .filter((t) => t.type === "buy" || t.type === "sell")
              .filter(
                (t) =>
                  categoryFilter === "all" ||
                  getAssetCategory(t.asset) === categoryFilter,
              ).length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-4">
                {t("noTradeHistory")}
              </p>
            ) : (
              transactions
                .filter((t) => t.type === "buy" || t.type === "sell")
                .filter(
                  (t) =>
                    categoryFilter === "all" ||
                    getAssetCategory(t.asset) === categoryFilter,
                )
                .map((trade) => (
                  <div
                    key={trade.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 gap-4 sm:gap-0"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white ${trade.type === "buy"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                          }`}
                      >
                        {trade.type === "buy" ? "B" : "S"}
                      </div>
                      <div>
                        <p className="text-white font-bold flex items-center gap-2">
                          <span>{trade.asset}</span>
                          <span className="text-[9px] text-slate-400 border border-slate-600 rounded px-1.5 py-0.5">
                            {t(getAssetCategory(trade.asset))}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${trade.type === "buy"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                              }`}
                          >
                            {trade.type === "buy"
                              ? t("actionBuy")
                              : t("actionSell")}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-wider mt-0.5">
                          {new Date(trade.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex sm:block justify-between items-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 mt-2 sm:mt-0">
                      <div>
                        <p className="text-white font-mono text-sm">
                          $
                          {trade.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-mono">
                          {trade.amount.toLocaleString(undefined, {
                            maximumFractionDigits: 6,
                          })}{" "}
                          @ $
                          {trade.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-0 overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Clock size={20} className="text-slate-400" />
              {t("recentTransactions")}
            </h3>
            <button className="text-xs text-slate-500 font-bold hover:text-primary">
              View All
            </button>
          </div>
          <div className="p-2 space-y-1">
            {transactions.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-8">
                No transactions yet.
              </p>
            )}
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "buy" || tx.type === "withdraw" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}
                  >
                    {tx.type === "buy" || tx.type === "withdraw" ? (
                      <ArrowUpCircle size={20} />
                    ) : (
                      <ArrowDownCircle size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold group-hover:text-primary transition-colors capitalize">
                      {tx.type} {tx.asset}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${tx.type === "buy" || tx.type === "withdraw" ? "text-red-500" : "text-green-500"}`}
                  >
                    {tx.type === "buy" || tx.type === "withdraw" ? "-" : "+"}$
                    {tx.total.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md relative flex flex-col max-h-[95vh] overflow-y-auto custom-scrollbar my-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-30" />
              <div className="relative z-10">
                {activeModal === "deposit" && (
                  <DepositModal onClose={closeModal} />
                )}
                {activeModal === "withdraw" && (
                  <WithdrawModal balance={balance} onClose={closeModal} />
                )}
                {activeModal === "staking" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                          <Zap size={22} className="text-yellow-500" /> Staking
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Earn passive income on your assets
                        </p>
                      </div>
                      <button
                        onClick={closeModal}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center space-y-3 mb-4">
                      <Zap size={40} className="text-yellow-400 mx-auto" />
                      <p className="text-white font-black text-lg">
                        Coming Soon
                      </p>
                      <p className="text-yellow-400/80 text-sm">
                        Staking pools will launch soon. Earn up to 12% APY on
                        BTC, ETH, and more.
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
