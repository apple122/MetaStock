import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Globe, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/Logo-url.png";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("--");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, first_name, last_name")
        .eq("id", user.id)
        .single();

      if (data) {
        const full =
          data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`
            : data.username || user.email?.split("@")[0] || "User";

        setDisplayName(full);

        // Build initials (up to 2 chars)
        const parts = full.trim().split(" ");
        const ini =
          parts.length >= 2
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : full.slice(0, 2).toUpperCase();
        setInitials(ini);
      } else {
        // Fallback to email prefix
        const fallback = user.email?.split("@")[0] || "User";
        setDisplayName(fallback);
        setInitials(fallback.slice(0, 2).toUpperCase());
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 py-4 px-6 md:px-12 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
            <img
              src={logoImg}
              alt="MetaStock Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">
            MetaStock
          </span>
        </motion.div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/news")}
            className="flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 transition-colors border border-white/10 group"
          >
            <Newspaper
              size={14}
              className="group-hover:rotate-180 transition-transform duration-700"
            />
            <span>{t("news")}</span>
          </button>
          <button
            onClick={() => setLanguage(language === "th" ? "en" : "th")}
            className="flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs font-medium hover:bg-white/10 transition-colors border border-white/10 group"
          >
            <Globe
              size={14}
              className="group-hover:rotate-180 transition-transform duration-700"
            />
            <span>{language === "th" ? "EN" : "ไทย"}</span>
          </button>

          {/* User avatar & name */}
          <div className="hidden md:flex items-center gap-2">
            <motion.div
              key={initials}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-[10px] font-black border-2 border-white/20"
            >
              {initials}
            </motion.div>
            <motion.span
              key={displayName}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-medium text-slate-300 max-w-[120px] truncate"
            >
              {displayName}
            </motion.span>
          </div>
        </div>
      </div>
    </nav>
  );
};
