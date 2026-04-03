import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MarketTableProps {
  stocks: any[];
  t: (key: string) => string;
}

export const MarketTable: React.FC<MarketTableProps> = ({ stocks, t }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden p-0"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{t("home")}</h3>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg capitalize">
            Crypto
          </span>
          <span className="px-3 py-1 bg-white/5 text-slate-400 text-xs font-bold rounded-lg capitalize">
            Stocks
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">{t("latestPrice")}</th>
              <th className="px-6 py-4 font-bold text-right">
                {t("latestPrice")}
              </th>
              <th className="px-6 py-4 font-bold text-right">
                {t("change24h")}
              </th>
              <th className="px-6 py-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {stocks.map((stock) => (
              <tr
                key={stock.id}
                onClick={() =>
                  navigate("/trade", { state: { symbol: stock.symbol } })
                }
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden object-contain border border-white/5 flex-shrink-0">
                      {stock.icon}
                    </div>
                    <div>
                      <p className="text-white font-bold group-hover:text-primary transition-colors">
                        {stock.name}
                      </p>
                      <p className="text-slate-500 text-xs">{stock.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-right font-mono font-bold text-white">
                  $
                  {stock.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td
                  className={`px-6 py-5 text-right font-bold text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  <span className="flex items-center justify-end gap-1">
                    {stock.change >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {Math.abs(stock.change)}%
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    TRADE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
