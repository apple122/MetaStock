import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";
import { mockStocks } from "../data/mockStocks";
import { MarketTable } from "../components/home/MarketTable";

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState(mockStocks);
  const featuredCART =
    stocks.find((s) => s.symbol === "CART") || mockStocks[15];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => ({
          ...s,
          price: s.price + (Math.random() - 0.5) * (s.price * 0.001),
        })),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Section - Gold Price */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-orange-600/20 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
        <div className="glass-card border-yellow-500/30 flex flex-col md:flex-row items-center justify-between gap-6 p-8 relative">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 text-sm font-bold">
              <Star size={16} fill="currentColor" />
              LATEST GOLD PRICE
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight">
              $2,315.40
            </h2>
            <div className="flex items-center gap-2 text-green-500 font-bold">
              <TrendingUp size={20} />
              <span>+1.2% ($27.5) Today</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-48 h-48 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Featured - Instacart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card flex items-center justify-between group"
        >
          <div className="space-y-2">
            <span className="text-secondary text-xs font-bold tracking-widest uppercase">
              Featured Asset
            </span>
            <h3 className="text-2xl font-bold text-white">Instacart</h3>
            <p className="text-slate-400 text-sm">Maplebear Inc. (CART)</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              $
              {featuredCART.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-green-500 text-sm font-bold flex items-center gap-1 justify-end">
              <TrendingUp size={14} /> +{featuredCART.change}%
            </div>
          </div>
        </motion.div>

        <motion.div
          onClick={() => navigate("/trade")}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 flex items-center justify-between cursor-pointer group"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Start Trading Now</h3>
            <p className="text-slate-400 text-xs">
              Zero commissions on first trade
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-background flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRight size={20} />
          </div>
        </motion.div>
      </div>

      {/* Market Table */}
      <MarketTable stocks={stocks} t={t} />
    </div>
  );
};

