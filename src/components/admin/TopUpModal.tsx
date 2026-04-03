import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, X, Loader2, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { AdminInput } from "./AdminInput";
import type { Profile } from "../../types";

interface TopUpModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ onClose, onSuccess }) => {
  const [userCode, setUserCode] = useState("");
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSearchUser = async () => {
    if (!userCode.trim()) return;
    setError("");
    const { data, error: searchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("code", userCode.toUpperCase().trim())
      .single();

    if (searchError || !data) {
      setMatchedUser(null);
      setError("User not found for this code.");
    } else {
      setMatchedUser(data as Profile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedUser || topUpAmount <= 0) return;
    setIsSubmitting(true);
    setError("");

    try {
      // Direct sum in code: user.balance + amount
      const newBalance = matchedUser.balance + topUpAmount;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", matchedUser.id);

      if (updateError) throw updateError;

      // Log transaction record
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: matchedUser.id,
        type: "deposit",
        asset_symbol: "USD",
        amount: topUpAmount,
        price: 1,
        total: topUpAmount,
        status: "success",
      });

      if (txError) {
        console.error("Failed to insert deposit transaction:", txError);
      }

      alert(
        `เติมเงินสำเร็จจำนวน $${topUpAmount.toLocaleString()} ให้บัญชีคุณ ${matchedUser.first_name} เรียบร้อยแล้ว`,
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || "การเติมเงินล้มเหลว");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-card w-full max-w-lg relative z-10 p-5 md:p-8 max-h-[95vh] overflow-y-auto scrollbar-hide"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <TrendingUp className="text-accent" size={24} />
            เติมเงินให้ผู้ใช้งาน
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <div className="flex-1">
              <AdminInput
                label="ค้นหาด้วยรหัสส่วนตัว"
                value={userCode}
                onChange={(v) => setUserCode(v)}
                placeholder="USERCODE123"
              />
            </div>
            <button
              onClick={handleSearchUser}
              className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/5 text-sm"
            >
              ค้นหา
            </button>
          </div>

          {error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs md:text-sm font-bold rounded-xl">
              {error}
            </div>
          ) : matchedUser ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    ยืนยันตัวตนบัญชี
                  </p>
                  <p className="text-lg md:text-xl font-bold text-white">
                    {matchedUser.first_name} {matchedUser.last_name}
                  </p>
                  <p className="text-xs text-slate-300">
                    @{matchedUser.username}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    ยอดเงินคงเหลือ
                  </p>
                  <p className="text-lg md:text-xl font-black text-primary">
                    $
                    {matchedUser.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 pt-4 border-t border-white/5"
              >
                <AdminInput
                  label="จำนวนเงินที่ต้องการเติม ($)"
                  type="number"
                  step="0.01"
                  value={topUpAmount.toString()}
                  onChange={(v) => setTopUpAmount(parseFloat(v) || 0)}
                  placeholder="0.00"
                />

                <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-accent text-xs md:text-sm font-bold uppercase tracking-wider text-center italic">
                  ยอดเงินใหม่จะกลายเป็น: $
                  {(matchedUser.balance + topUpAmount).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMatchedUser(null)}
                    className="flex-1 px-6 py-4 rounded-xl bg-white/5 text-slate-400 font-bold hover:text-white transition-all text-sm"
                  >
                    ล้างข้อมูล
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || topUpAmount <= 0}
                    className="flex-[2] btn-primary bg-accent hover:bg-accent/90 border-accent/30 flex items-center justify-center gap-2 text-sm md:text-base font-bold"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Plus size={18} />
                    )}
                    ยืนยันการเติมเงิน
                  </button>
                </div>
              </form>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
