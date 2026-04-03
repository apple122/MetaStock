import React, { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Search, X } from "lucide-react";
import TradingChart from "../components/trade/TradingChart";
import { assets } from "../data/marketData";
import { TradingPanel } from "../components/trade/TradingPanel";
import { NotificationList } from "../components/trade/NotificationList";

import { marketService } from "../services/marketService";

export const Trade: React.FC = () => {
  const { balance, handleTrade, transactions } = useWallet();
  const location = useLocation();

  // Determine initial symbol (Priority: Navigation State > LocalStorage > Default BTC)
  const getInitialSymbol = () => {
    if (location.state?.symbol) {
      localStorage.setItem("lastTradeSymbol", location.state.symbol);
      return location.state.symbol;
    }
    return localStorage.getItem("lastTradeSymbol") || "BTC";
  };

  const targetSymbol = getInitialSymbol();
  const initialAsset =
    assets.find((a) => a.symbol === targetSymbol) ||
    assets.find((a) => a.symbol === "BTC") ||
    assets[0];

  const [selectedAsset, setSelectedAsset] = useState<any>(initialAsset);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync to localStorage when selection changes
  useEffect(() => {
    if (selectedAsset.symbol) {
      localStorage.setItem("lastTradeSymbol", selectedAsset.symbol);
    }
  }, [selectedAsset.symbol]);
  const [livePrice, setLivePrice] = useState(initialAsset.price);
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [notifications, setNotifications] = useState<
    {
      id: number;
      type: "success" | "error";
      message: string;
    }[]
  >([]);
  const [tradeLoading, setTradeLoading] = useState(false);

  // Real-time price fetch from market API
  useEffect(() => {
    const fetchLatest = async () => {
      const result = await marketService.fetchSymbolPrice(selectedAsset.symbol);
      if (result && typeof result.price === "number") {
        const newPrice = result.price;
        setLivePrice(newPrice);
        setSelectedAsset((prev: any) => ({
          ...prev,
          ...result,
        }));
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 15000); // 15 seconds refresh for Trade page
    return () => clearInterval(interval);
  }, [selectedAsset.symbol]);

  const onTrade = async () => {
    const tradeAmount = Number(amount);

    if (tradeAmount < 1) {
      const errorNotif = {
        id: Date.now(),
        type: "error" as const,
        message: "Minimum trade amount is $1.00",
      };
      setNotifications((prev) => [errorNotif, ...prev]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== errorNotif.id));
      }, 3000);
      return;
    }

    setTradeLoading(true);
    const res = await handleTrade(
      orderType,
      { ...selectedAsset, price: livePrice },
      tradeAmount,
    );
    setTradeLoading(true); // Keep loading state until notification handled if desired, or set to false
    setTradeLoading(false);

    const newNotif = {
      id: Date.now(),
      type: res.success ? ("success" as const) : ("error" as const),
      message: res.message,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    if (res.success) setAmount("");
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
    }, 3000);
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      <NotificationList notifications={notifications} />

      {/* Chart & Asset Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="w-full relative z-30">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card relative"
          >
            {/* Background Accent Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="relative p-6 md:p-8 space-y-8 z-50">
              {/* Top Row: Identity & Price */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl relative flex-shrink-0 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {selectedAsset.iconUrl ? (
                      <img
                        src={selectedAsset.iconUrl}
                        alt={selectedAsset.name}
                        className="w-full h-full object-cover relative z-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          const fallback = (e.target as HTMLImageElement).parentElement?.querySelector(".fallback-letter");
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <span className={`fallback-letter text-white font-black text-2xl tracking-tighter relative z-10 ${selectedAsset.iconUrl ? "hidden" : ""}`}>
                      {selectedAsset.symbol[0]}
                    </span>
                    {/* Premium Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-accent opacity-20 blur-md rounded-2xl" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mb-1">
                        {selectedAsset.name}
                      </h2>
                      <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                      >
                        {showSearch ? <X size={18} /> : <Search size={18} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 tracking-wider">
                        {selectedAsset.symbol} / USD
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">
                          Live
                        </span>
                      </div>
                    </div>

                    {/* Asset Search Dropdown */}
                    <AnimatePresence>
                      {showSearch && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-4 w-72 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-4"
                        >
                          <div className="relative">
                            <Search
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                              size={14}
                            />
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search assets..."
                              className="w-full bg-slate-800 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                            {filteredAssets.map((asset) => (
                              <button
                                key={asset.id}
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setShowSearch(false);
                                  setSearchTerm("");
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedAsset.symbol === asset.symbol
                                    ? "bg-primary text-white"
                                    : "hover:bg-white/5 text-slate-300"
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                    <img
                                      src={asset.iconUrl}
                                      className="w-full h-full object-cover relative z-10"
                                      alt=""
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                        const fallback = (e.target as HTMLImageElement).parentElement?.querySelector(".dropdown-fallback");
                                        if (fallback) fallback.classList.remove("hidden");
                                      }}
                                    />
                                    <span className="dropdown-fallback hidden text-[10px] font-black text-white relative z-10 uppercase">
                                      {asset.symbol[0]}
                                    </span>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs font-bold">{asset.name}</p>
                                    <p className="text-[10px] opacity-60">{asset.symbol}</p>
                                  </div>
                                </div>
                                {selectedAsset.symbol === asset.symbol && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                )}
                              </button>
                            ))}
                            {filteredAssets.length === 0 && (
                              <p className="text-center py-4 text-xs text-slate-500">No assets found</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Main Price Display */}
                <div className="flex flex-col items-start md:items-end">
                  <div className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums leading-none">
                    ${livePrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className={`flex items-center gap-1.5 font-black text-sm mt-1.5 ${(selectedAsset.change ?? 0) >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                    {(selectedAsset.change ?? 0) >= 0 ? (
                      <TrendingUp size={16} strokeWidth={3} />
                    ) : (
                      <TrendingDown size={16} strokeWidth={3} />
                    )}
                    {Math.abs(selectedAsset.change ?? 0).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-5 rounded-2xl bg-white/5 border border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">24h High</p>
                  <p className="text-base font-bold text-white tabular-nums">
                    ${selectedAsset.high?.toLocaleString() || "---"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">24h Low</p>
                  <p className="text-base font-bold text-white tabular-nums">
                    ${selectedAsset.low?.toLocaleString() || "---"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">24h Vol</p>
                  <p className="text-base font-bold text-slate-300 tabular-nums">
                    {selectedAsset.volume ? `$${(selectedAsset.volume / 1000000).toFixed(2)}M` : "---"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sentiment</p>
                  <p className={`text-base font-bold capitalize tabular-nums ${(selectedAsset.change ?? 0) >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                    {(selectedAsset.change ?? 0) >= 0 ? "Bullish" : "Bearish"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart Area */}
        <div className="glass-card h-[500px] p-0 overflow-hidden relative z-0">
          <TradingChart symbol={selectedAsset.symbol} />
        </div>
      </div>

      {/* Trading Panel */}
      <TradingPanel
        balance={balance}
        amount={amount}
        setAmount={setAmount}
        orderType={orderType}
        setOrderType={setOrderType}
        onTrade={onTrade}
        tradeLoading={tradeLoading}
        selectedAsset={selectedAsset}
        livePrice={livePrice}
        transactions={(transactions as any[])}
      />
    </div>
  );
};
