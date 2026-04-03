import React from "react";
import { ChevronRight } from "lucide-react";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
      active
        ? "bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/10"
        : "text-slate-400 hover:text-slate-200"
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </div>
    <ChevronRight
      size={14}
      className={`transition-transform duration-300 ${active ? "rotate-90" : ""}`}
    />
  </button>
);
