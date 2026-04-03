import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Notification {
  id: number;
  type: "success" | "error";
  message: string;
}

interface NotificationListProps {
  notifications: Notification[];
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
}) => (
  <div className="fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
    <AnimatePresence>
      {notifications.map((notif) => (
        <motion.div
          key={notif.id}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-bold shadow-2xl backdrop-blur-md pointer-events-auto ${notif.type === "success" ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-red-500/20 border-red-500/40 text-red-400"}`}
        >
          {notif.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {notif.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
