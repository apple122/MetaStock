import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useWallet } from "../contexts/WalletContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShieldCheck,
  CreditCard,
  History,
  Lock,
  Loader2,
  LogOut,
  Copy,
  Check,
} from "lucide-react";
import { TabButton } from "../components/settings/TabButton";
import { SettingsContent } from "../components/settings/SettingsContent";

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { balance, transactions } = useWallet();
  const { user, profile, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "bank" | "security" | "history"
  >("profile");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone_number: "",
    address: "",
    kyc_status: "unverified",
    bank_network: "",
    bank_account: "",
    bank_name: "",
    code: "",
    email: "",
  });

  // Sync with AuthContext profile
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        kyc_status: profile.kyc_status || "unverified",
        bank_network: profile.bank_network || "",
        bank_account: profile.bank_account || "",
        bank_name: profile.bank_name || "",
        code: profile.code || "",
        email: user?.email || "",
      });
    }
  }, [profile]);

  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    logout();
  };

  // Close modal when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabChange = (
    tab: "profile" | "bank" | "security" | "history",
  ) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="pt-24 pb-32 px-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Tabs */}
      <div className="md:w-64 space-y-4">
        {profile?.is_admin && (
          <button
            onClick={() => navigate('/admin')}
            className="w-full glass-card p-4 text-center text-primary font-black uppercase tracking-widest hover:bg-primary/10 transition-colors border border-primary/20 hover:border-primary/50"
          >
            Admin Dashboard
          </button>
        )}
        <div className="glass-card p-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
            Account Summary
          </h4>
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 w-fit group">
              <span className="text-sm font-bold text-white">
                {profileData.first_name} {profileData.last_name}
              </span>
              <span className="text-xl font-mono text-primary tracking-tight">
                {profileData.code || "---"}
              </span>
              <button
                onClick={() => handleCopyCode(profileData.code)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-white"
                title="Copy code"
              >
                {copied ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400">{t("totalBalance")}</p>
              <p className="text-xl font-black text-white">
                $
                {balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${profileData.kyc_status === "verified" ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20"}`}
            >
              <ShieldCheck
                size={14}
                className={
                  profileData.kyc_status === "verified"
                    ? "text-green-500"
                    : "text-amber-500"
                }
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${profileData.kyc_status === "verified" ? "text-green-500" : "text-amber-500"}`}
              >
                {profileData.kyc_status === "verified"
                  ? "KYC Verified"
                  : "KYC Pending"}
              </span>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 space-y-1">
          <TabButton
            active={activeTab === "profile"}
            onClick={() => handleTabChange("profile")}
            icon={<User size={18} />}
            label={t("verification")}
          />
          <TabButton
            active={activeTab === "bank"}
            onClick={() => handleTabChange("bank")}
            icon={<CreditCard size={18} />}
            label={t("bankDetails")}
          />
          <TabButton
            active={activeTab === "security"}
            onClick={() => handleTabChange("security")}
            icon={<Lock size={18} />}
            label={t("changePassword")}
          />
          <TabButton
            active={activeTab === "history"}
            onClick={() => handleTabChange("history")}
            icon={<History size={18} />}
            label={t("historyDeposit")}
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all duration-300 font-bold text-sm disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LogOut size={18} />
          )}
          {loggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>

      {/* Main Content Area (Desktop) */}
      <div className="flex-1 hidden md:block">
        <SettingsContent
          activeTab={activeTab}
          balance={balance}
          t={t}
          onClose={() => setIsModalOpen(false)}
          profileData={profileData}
          setProfileData={setProfileData}
          userId={user?.id}
          refreshProfile={refreshProfile}
          transactions={transactions}
        />
      </div>

      {/* Mobile Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm p-4 pt-10"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <SettingsContent
                activeTab={activeTab}
                balance={balance}
                t={t}
                onClose={() => setIsModalOpen(false)}
                isMobile
                profileData={profileData}
                setProfileData={setProfileData}
                userId={user?.id}
                refreshProfile={refreshProfile}
                transactions={transactions}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
