import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useWallet } from "../contexts/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet as WalletIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Zap,
  X,
} from "lucide-react";
import { DepositModal } from "../components/wallet/DepositModal";
import { WithdrawModal } from "../components/wallet/WithdrawModal";
import { assets } from "../data/marketData";

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
  const [activeTab, setActiveTab] = useState<"all" | "trades" | "wallets">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

      <div className="grid grid-cols-1">
        {/* Unified Activity Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-0 overflow-hidden border-white/5 flex flex-col"
        >
          {/* Ledger Header */}
          <div className="p-6 border-b border-white/5 space-y-6 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Clock size={22} className="text-primary" />
                  {t("activityLedger")}
                </h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">
                  {t("trackActivityDesc")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-900/80 border border-white/10 text-white text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                >
                  <option value="all">{t("allAssets")}</option>
                  <option value="crypto">{t("crypto")}</option>
                  <option value="commodity">{t("commodity")}</option>
                  <option value="stock">{t("stock")}</option>
                </select>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex gap-1 p-1 bg-black/20 rounded-2xl w-full md:w-fit self-start border border-white/5">
              {[
                { id: "all", label: t("all") },
                { id: "trades", label: t("trades") },
                { id: "wallets", label: t("wallets") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex-1 md:flex-none px-3 md:px-6 py-2 text-[10px] md:text-xs font-black uppercase tracking-wider transition-all rounded-xl ${activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg shadow-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Content with Overflow Control (Vertical Only) */}
          <div className="w-full group/ledger">
            <div className="w-full max-h-[600px] overflow-y-auto custom-scrollbar p-2">
              <AnimatePresence mode="popLayout">
                {transactions
                  .filter((tx) => {
                    if (activeTab === "trades") return tx.type === "buy" || tx.type === "sell";
                    if (activeTab === "wallets") return tx.type === "deposit" || tx.type === "withdraw";
                    return true;
                  })
                  .filter((tx) => {
                    if (categoryFilter === "all") return true;
                    if (!tx.asset) return categoryFilter === "wallets"; // or similar logic
                    return getAssetCategory(tx.asset) === categoryFilter;
                  })
                  .map((tx, idx) => {
                    const isExpanded = expandedId === tx.id;
                    const assetInfo = tx.asset ? assets.find((a) => a.symbol === tx.asset) : null;

                    return (
                      <motion.div
                        layout
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                        className={`group flex flex-col p-4 rounded-2xl transition-all cursor-pointer border border-transparent hover:bg-white/[0.03] hover:border-white/5 mb-1 ${isExpanded ? "bg-white/[0.04] border-white/10 shadow-2xl" : ""
                          }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {/* Visual Icon (Squircle Arrow or Logo) */}
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center relative flex-shrink-0 shadow-lg ${tx.type === "deposit" || tx.type === "buy"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                                }`}
                            >
                              {tx.asset && assetInfo?.iconUrl ? (
                                <div className="w-full h-full p-0.5">
                                  <img src={assetInfo.iconUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-slate-900 rounded-full ${tx.type === "buy" ? "bg-green-500" : "bg-red-500"}`} />
                                </div>
                              ) : (
                                <>
                                  {tx.type === "deposit" || tx.type === "buy" ? (
                                    <ArrowUpRight size={22} strokeWidth={2.5} />
                                  ) : (
                                    <ArrowDownLeft size={22} strokeWidth={2.5} />
                                  )}
                                </>
                              )}
                            </div>

                            <div>
                              <p className="text-white font-black flex items-center gap-2 group-hover:text-primary transition-colors text-sm sm:text-base">
                                <span className="capitalize">{tx.type}</span>
                                {tx.asset && (
                                  <span className="text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-widest font-bold">
                                    {tx.asset}
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                {new Date(tx.timestamp).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-base sm:text-lg font-black tabular-nums ${tx.type === "buy" || tx.type === "withdraw" ? "text-red-500" : "text-green-500"
                                }`}
                            >
                              {tx.type === "buy" || tx.type === "withdraw" ? "-" : "+"} $
                              {tx.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${tx.status === "success" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>

                        {/* Expandable Details Row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-5 mt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2">
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t("transactionId")}</p>
                                  <p className="text-xs text-white font-mono break-all group-active:select-all">#{tx.id.slice(0, 16)}...</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t("type") || "Type"}</p>
                                  <p className="text-xs text-white font-bold capitalize">{tx.type} {tx.asset ? "Market" : "Account"}</p>
                                </div>
                                {tx.price && (
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t("executionPrice")}</p>
                                    <p className="text-xs text-white font-mono">${tx.price.toLocaleString()}</p>
                                  </div>
                                )}
                                {tx.amount && (
                                  <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t("quantity")}</p>
                                    <p className="text-xs text-white font-mono">{tx.amount.toFixed(6)} {tx.asset}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                {/* Empty State */}
                {transactions.filter((tx) => {
                  if (activeTab === "trades") return tx.type === "buy" || tx.type === "sell";
                  if (activeTab === "wallets") return tx.type === "deposit" || tx.type === "withdraw";
                  return true;
                }).length === 0 && (
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-white/5">
                        <Clock size={24} className="text-slate-700" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{t("noRecordsFound")}</p>
                        <p className="text-slate-500 text-xs">{t("noActivityInCat") || "There is no activity in this category yet."}</p>
                      </div>
                    </div>
                  )}
              </AnimatePresence>
            </div>
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
