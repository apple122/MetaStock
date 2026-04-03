import React, { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import TradingChart from "../components/trade/TradingChart";
import { assets } from "../data/marketData";
import { TradingPanel } from "../components/trade/TradingPanel";
import { NotificationList } from "../components/trade/NotificationList";

export const Trade: React.FC = () => {
  const { balance, handleTrade, transactions } = useWallet();
  const location = useLocation();
  const targetSymbol = location.state?.symbol || "CART";

  const initialAsset =
    assets.find((a) => a.symbol === targetSymbol) || assets[15];
  const [selectedAsset] = useState(initialAsset);
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

  // Simulate real-time price fluctuations
  useEffect(() => {
    setLivePrice(selectedAsset.price);
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.random() - 0.5) * (selectedAsset.price * 0.001);
        return prev + delta;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [selectedAsset]);

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

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      <NotificationList notifications={notifications} />

      {/* Chart & Asset Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card flex flex-col md:flex-row items-center justify-between p-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-black text-xl">
                  {selectedAsset.symbol[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-3xl font-black text-white tracking-tight leading-tight truncate md:whitespace-normal">
                  {selectedAsset.name}
                </h2>
                <p className="text-xs md:text-sm text-slate-400 font-medium">
                  {selectedAsset.symbol} / USD
                </p>
              </div>
            </div>
            <div className="text-right mt-4 md:mt-0 flex-shrink-0">
              <div className="text-2xl md:text-4xl font-black text-white">
                $
                {livePrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={`flex items-center justify-end gap-1 font-bold ${
                  selectedAsset.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {selectedAsset.change >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {Math.abs(selectedAsset.change)}%
              </div>
            </div>
          </motion.div>
        </div>

        {/* Real Chart Area */}
        <div className="glass-card h-[500px] p-0 overflow-hidden relative">
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
