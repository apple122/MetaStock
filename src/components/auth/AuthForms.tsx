import React, { useState, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import logoImg from "../../assets/Logo-url.png";

// ── OTP Verification Modal ─────────────────────────────────────────────────────
const OtpModal: React.FC<{
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onClose: () => void;
  verifyError: string;
  verifyLoading: boolean;
}> = ({ email, onVerify, onResend, onClose, verifyError, verifyLoading }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleResend = async () => {
    setResending(true);
    await onResend();
    setResending(false);
    setResent(true);
    setOtp(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();
    setTimeout(() => setResent(false), 3000);
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        className="w-full max-w-sm relative"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 blur-3xl opacity-50 rounded-3xl" />

        <div className="glass-card relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden mb-2 shadow-xl shadow-primary/30">
                <img src={logoImg} alt="MetaStock" className="w-full h-full object-cover" />
              </div>
              <span className="text-base font-black text-white tracking-tight">MetaStock</span>
            </div>

            {/* Email icon bounce */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4"
            >
              <Mail size={28} className="text-primary" />
            </motion.div>

            <h2 className="text-xl font-black text-white mb-1">Enter Verification Code</h2>
            <p className="text-slate-400 text-sm mb-1">We sent a 6-digit code to</p>
            <p className="text-primary font-bold text-sm mb-5 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 break-all">
              {email}
            </p>

            {/* OTP Input Grid */}
            <div className="flex justify-center gap-2 mb-5" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-11 h-14 rounded-xl text-center text-2xl font-black transition-all outline-none
                    ${digit ? "bg-primary/20 border-2 border-primary text-white" : "bg-slate-900 border-2 border-white/10 text-white"}
                    focus:border-primary focus:bg-primary/15`}
                />
              ))}
            </div>

            {/* Error */}
            <AnimatePresence>
              {verifyError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-4"
                >
                  <AlertCircle size={14} />
                  {verifyError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verify Button */}
            <button
              onClick={() => onVerify(otp.join(""))}
              disabled={!isComplete || verifyLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-black text-sm shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-40 mb-3 flex items-center justify-center gap-2"
            >
              {verifyLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {verifyLoading ? "Verifying..." : "Verify Account"}
            </button>

            {/* Resend */}
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold mb-3 disabled:opacity-50"
            >
              {resent ? (
                <><CheckCircle2 size={13} className="text-green-400" /> Code Resent!</>
              ) : (
                <><RefreshCw size={13} className={resending ? "animate-spin" : ""} /> Resend Code</>
              )}
            </button>

            <button onClick={onClose} className="text-slate-500 text-xs hover:text-slate-300 transition-colors">
              ← Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main AuthForms ─────────────────────────────────────────────────────────────
export const AuthForms: React.FC = () => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // OTP modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { 
              username,
              password: password, // ส่งรหัสผ่านเข้า metadata เพื่อให้ SQL Trigger นำไปบันทึก
              balance: 0
            } 
          },
        });
        if (error) throw error;

        // Email OTP flow — show modal
        if (data?.user && !data?.session) {
          setRegisteredEmail(email);
          setShowOtpModal(true);
          return;
        }
      }
    } catch (err: any) {
      if (isLogin && err.message === "Email not confirmed") {
        try {
          await supabase.auth.resend({ type: 'signup', email });
          setRegisteredEmail(email);
          setShowOtpModal(true);
          return;
        } catch (resendErr: any) {
          setErrorMsg(resendErr.message || "Failed to resend confirmation email.");
          return;
        }
      }
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setVerifyError("");
    setVerifyLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: registeredEmail,
        token: otp,
        type: "signup",
      });
      if (error) throw error;
      // Success — AuthContext will pick up the session automatically
      setShowOtpModal(false);
    } catch (err: any) {
      setVerifyError(err.message || "Invalid code. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await supabase.auth.resend({ type: "signup", email: registeredEmail });
  };

  const handleModalClose = () => {
    setShowOtpModal(false);
    setVerifyError("");
    setIsLogin(true);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
  };

  return (
    <>
      <AnimatePresence>
        {showOtpModal && (
          <OtpModal
            email={registeredEmail}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onClose={handleModalClose}
            verifyError={verifyError}
            verifyLoading={verifyLoading}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" />

        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-2xl mx-auto shadow-xl shadow-primary/30 flex items-center justify-center mb-4 overflow-hidden"
            >
              <img src={logoImg} alt="MetaStock" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? t("login") : t("register")}
            </h1>
            <p className="text-slate-400 text-sm">
              {isLogin ? "Access your trading dashboard" : "Join the leading trading platform"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <AuthInput
                  icon={<User size={18} />}
                  placeholder={t("username")}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              )}

              <AuthInput
                icon={<Mail size={18} />}
                placeholder={t("email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Password */}
              <div className="relative">
                <AuthInput
                  icon={<Lock size={18} />}
                  placeholder={t("password")}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password — Register only */}
              {!isLogin && (
                <div className="relative">
                  <AuthInput
                    icon={<ShieldCheck size={18} />}
                    placeholder="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {confirmPassword.length > 0 && (
                    <div className={`absolute right-10 top-1/2 -translate-y-1/2 text-sm font-black ${
                      password === confirmPassword ? "text-green-500" : "text-red-500"
                    }`}>
                      {password === confirmPassword ? "✓" : "✗"}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full group overflow-hidden mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Processing..." : isLogin ? t("login") : t("register")}</span>
              {!loading && (
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? t("register") : t("login")}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

const AuthInput: React.FC<{
  icon: React.ReactNode;
  placeholder: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}> = ({ icon, placeholder, type, value, onChange, required }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-slate-600"
    />
  </div>
);
