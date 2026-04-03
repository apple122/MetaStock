import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Loader2,
  Save,
  Landmark,
  History,
  ShieldCheck,
  KeyRound,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { SettingsInput } from "./SettingsInput";

interface SettingsContentProps {
  activeTab: "profile" | "bank" | "security" | "history";
  balance: number;
  t: (key: string) => string;
  onClose: () => void;
  isMobile?: boolean;
  profileData: any;
  setProfileData: any;
  userId?: string;
  refreshProfile: () => Promise<void>;
  transactions?: any[];
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  activeTab,
  t,
  onClose,
  isMobile,
  profileData,
  setProfileData,
  userId,
  refreshProfile,
  transactions = [],
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // OTP States
  const [isOtpFlow, setIsOtpFlow] = useState(false);
  const [otpStep, setOtpStep] = useState<"request" | "verify" | "new_password">("request");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    setSaveMessage("");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          username: profileData.username,
          phone_number: profileData.phone_number,
          address: profileData.address,
          bank_network: profileData.bank_network,
          bank_account: profileData.bank_account,
          bank_name: profileData.bank_name,
        })
        .eq("id", userId);

      if (error) throw error;

      await refreshProfile();
      setSaveMessage("Saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage("Error saving data");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNormalPasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setSaveMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setSaveMessage("Password must be at least 6 characters");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      // Re-authenticate user to verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileData.email, 
        password: currentPassword,
      });

      if (signInError) throw new Error("Current password incorrect");

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSaveMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err: any) {
      setSaveMessage(err.message || "Error updating password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOtp = async () => {
    if (!profileData.email) {
      setOtpError("Email not found. Please refresh the page.");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: profileData.email,
        options: {
          shouldCreateUser: false,
        },
      });
      if (error) throw error;
      setOtpStep("verify");
    } catch (err: any) {
      setOtpError(err.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: profileData.email || "",
        token: otpCode,
        type: "email",
      });
      if (error) throw error;
      setOtpStep("new_password");
    } catch (err: any) {
      setOtpError(err.message || "Invalid or expired OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpPasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setOtpError("Passwords do not match");
      return;
    }
    setOtpLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setSaveMessage("Password reset successfully!");
      setIsOtpFlow(false);
      setOtpStep("request");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setOtpError(err.message || "Error resetting password");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {activeTab === "profile" && (
        <motion.div
          key="profile"
          initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isMobile ? 0 : -20 }}
          className="glass-card space-y-8 relative"
        >
          {isMobile && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"
            >
              <ChevronRight className="rotate-180" size={24} />
            </button>
          )}
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-primary/20">
              {profileData.first_name && profileData.last_name
                ? `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase()
                : (profileData.username || "AC").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {t("verification")}
              </h2>
              <p className="text-slate-400 text-sm">
                Manage your personal information and KYC status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingsInput
              label={t("firstName")}
              placeholder="John"
              value={profileData.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
            />
            <SettingsInput
              label={t("lastName")}
              placeholder="Doe"
              value={profileData.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
            />
            <SettingsInput
              label={t("username")}
              placeholder="johndoe123"
              value={profileData.username}
              onChange={(e) => updateField("username", e.target.value)}
            />
            <SettingsInput
              label={t("phone")}
              placeholder="08x-xxx-xxxx"
              value={profileData.phone_number}
              onChange={(e) => updateField("phone_number", e.target.value)}
            />
            <div className="md:col-span-2">
              <SettingsInput
                label={t("address")}
                placeholder="123 Example St."
                value={profileData.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-white/5">
            <div className="text-sm font-bold text-green-500">
              {saveMessage}
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-6 py-2 rounded-xl bg-white/5 text-slate-400 font-bold text-sm hover:text-white transition-colors">
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {t("save")}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "bank" && (
        <motion.div
          key="bank"
          initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isMobile ? 0 : -20 }}
          className="glass-card space-y-8 relative"
        >
          {isMobile && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"
            >
              <ChevronRight className="rotate-180" size={24} />
            </button>
          )}
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <Landmark size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {t("bankDetails")}
              </h2>
              <p className="text-slate-400 text-sm">
                Your withdrawal destination details
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <SettingsInput
              label={t("network")}
              placeholder="e.g. ERC-20, BEP-20, Regional Bank"
              value={profileData.bank_network}
              onChange={(e) => updateField("bank_network", e.target.value)}
            />
            <SettingsInput
              label={t("accountAddress")}
              placeholder="Paste your wallet address or account number"
              value={profileData.bank_account}
              onChange={(e) => updateField("bank_account", e.target.value)}
            />
            <SettingsInput
              label={t("accountName")}
              placeholder="Full name on account"
              value={profileData.bank_name}
              onChange={(e) => updateField("bank_name", e.target.value)}
            />
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex gap-3">
            <ShieldCheck size={18} className="shrink-0" />
            <p>
              Please ensure all details are correct. Incorrect information may
              lead to permanent loss of funds during withdrawal.
            </p>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-white/5">
            <div className="text-sm font-bold text-green-500">
              {saveMessage}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {t("save")}
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === "security" && (
        <motion.div
          key="security"
          initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isMobile ? 0 : -20 }}
          className="glass-card max-w-lg relative"
        >
          {isMobile && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"
            >
              <ChevronRight className="rotate-180" size={24} />
            </button>
          )}

          {!isOtpFlow ? (
            <>
              <h2 className="text-2xl font-black text-white mb-2">
                {t("changePassword")}
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                Ensure your account is using a strong, unique password
              </p>

              <div className="space-y-4">
                <SettingsInput
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsOtpFlow(true)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <SettingsInput
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <SettingsInput
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {saveMessage && (
                <div className={`mt-4 p-3 rounded-lg text-xs font-bold ${saveMessage.includes("success") ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                  {saveMessage}
                </div>
              )}

              <button
                onClick={handleNormalPasswordUpdate}
                disabled={isSaving}
                className="btn-secondary w-full mt-8 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                Update Password
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => {
                    setIsOtpFlow(false);
                    setOtpStep("request");
                  }}
                  className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-white">Reset Password</h2>
              </div>

              {otpStep === "request" && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <Mail size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-bold">Request Password Reset</p>
                    <p className="text-sm text-slate-400 px-8">
                      We will send a 6-digit verification code to your registered email: 
                      <span className="text-primary block mt-1">{profileData.email}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Send Code"}
                  </button>
                </div>
              )}

              {otpStep === "verify" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-white font-bold">Enter Verification Code</p>
                    <p className="text-sm text-slate-400">
                      Check your inbox for the 6-digit code we sent to your email.
                    </p>
                  </div>
                  <SettingsInput
                    label="Verification Code"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                  />
                  {otpError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                      {otpError}
                    </div>
                  )}
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpCode.length < 6}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify Code"}
                  </button>
                  <button 
                    onClick={handleSendOtp}
                    className="w-full text-xs font-bold text-slate-500 hover:text-white"
                  >
                    Didn't get code? Resend
                  </button>
                </div>
              )}

              {otpStep === "new_password" && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-white font-bold">Set New Password</p>
                    <p className="text-sm text-slate-400">
                      Your code is verified. Please enter your new password below.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <SettingsInput
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <SettingsInput
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  {otpError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                      {otpError}
                    </div>
                  )}
                  <button
                    onClick={handleOtpPasswordUpdate}
                    disabled={otpLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Reset Password"}
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "history" && (
        <motion.div
          key="history"
          initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isMobile ? 0 : -20 }}
          className="glass-card max-w-lg relative"
        >
          {isMobile && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"
            >
              <ChevronRight className="rotate-180" size={24} />
            </button>
          )}
          <h2 className="text-2xl font-black text-white mb-2">
            {t("historyDeposit")}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            View your recent deposit transactions
          </p>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {transactions.filter((t) => t.type === "deposit").length === 0 ? (
              <div className="text-center py-8">
                <History
                  size={48}
                  className="mx-auto text-slate-600 mb-4 opacity-50"
                />
                <p className="text-slate-400 text-sm font-bold">
                  No deposit history found
                </p>
              </div>
            ) : (
              transactions
                .filter((t) => t.type === "deposit")
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-black">
                        +
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm uppercase">
                          {tx.asset || "Deposit"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold text-sm">
                        +$
                        {tx.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
