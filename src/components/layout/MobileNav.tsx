import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Home, BarChart2, User, Wallet, Settings, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export const MobileNav: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { icon: <Home size={26} />, label: t("home"), path: "/" },
    { icon: <BarChart2 size={26} />, label: t("trade"), path: "/trade" },
    {
      icon: (
        <div className="relative">
          <div className="w-14 h-14 -mt-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-background group-active:scale-90 transition-transform">
            <Plus size={26} className="text-white" />
          </div>
          <User
            size={20}
            className="absolute -bottom-1 -right-1 text-slate-400 bg-background rounded-full p-0.5 border border-white/10"
          />
        </div>
      ),
      label: t("history"),
      path: "/history",
      customIcon: true,
    },
    { icon: <Wallet size={26} />, label: t("wallet"), path: "/wallet" },
    { icon: <Settings size={26} />, label: t("settings"), path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 px-4 pb-safe pt-3 pb-3 backdrop-blur-3xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 py-1 transition-all duration-300 ${
                isActive && !item.customIcon
                  ? "text-primary"
                  : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className={isActive && !item.customIcon ? "scale-110" : ""}
                >
                  {item.icon}
                </motion.div>
                {!item.customIcon && (
                  <span
                    className={`text-xs font-semibold ${isActive ? "text-primary" : "text-slate-500"}`}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
