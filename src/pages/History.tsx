import React, { useState, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWallet } from '../contexts/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon
} from 'lucide-react';

// Date math helpers
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export const History: React.FC = () => {
  const { t } = useLanguage();
  const { transactions } = useWallet();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const tradeTransactions = transactions.filter(tx => tx.type === 'buy' || tx.type === 'sell');

  // Calendar setup
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Map dates that have transactions for indicators
  const transactionDates = useMemo(() => {
    const dates = new Set<string>();
    tradeTransactions.forEach(tx => {
      const d = new Date(tx.timestamp);
      dates.add(new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString());
    });
    return dates;
  }, [tradeTransactions]);

  // Filter transactions for the selected day
  const filteredTransactions = useMemo(() => {
    return tradeTransactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      return (
        txDate.getFullYear() === selectedDate.getFullYear() &&
        txDate.getMonth() === selectedDate.getMonth() &&
        txDate.getDate() === selectedDate.getDate()
      );
    });
  }, [tradeTransactions, selectedDate]);

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto space-y-8">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-l-4 border-primary pl-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CalendarIcon size={24} className="text-primary" />
            {t("history") || "History"}
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">Calendar View</p>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="glass-card bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Calendar Nav */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h2 className="text-xl font-black text-white tracking-tight">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="relative z-10">
          {/* Days of Week */}
          <div className="grid grid-cols-7 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-7 gap-y-4 gap-x-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentYear, currentMonth, day);
              const isSelected = 
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;
                
              const today = new Date();
              const isToday = 
                today.getDate() === day && 
                today.getMonth() === currentMonth && 
                today.getFullYear() === currentYear;

              const hasTransaction = transactionDates.has(dateObj.toDateString());

              return (
                <div key={day} className="flex justify-center">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(dateObj)}
                    className={`relative w-10 h-10 flex flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300
                      ${isSelected 
                        ? "bg-gradient-to-tr from-primary to-accent text-white shadow-lg shadow-primary/30" 
                        : isToday 
                          ? "bg-white/10 text-white border border-white/20" 
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    <span className="relative z-10">{day}</span>
                    
                    {/* Transaction Dot Indicator */}
                    {hasTransaction && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day View */}
      <div className="pt-4">
        <h3 className="text-lg font-black text-white mb-6 border-b border-white/5 pb-4">
          Transactions on {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </h3>

        <AnimatePresence mode="wait">
          {filteredTransactions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 space-y-4 text-center glass-card bg-slate-900/30"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                <ClipboardList size={32} />
              </div>
              <p className="text-slate-500 font-medium tracking-wide text-sm">
                No trading activity on this day.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredTransactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card bg-slate-900/60 hover:border-primary/30 transition-all flex items-center justify-between group p-4 rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${tx.type === 'buy' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {tx.type === 'buy' ? <ArrowUpRight size={20} className="stroke-[3]" /> : <ArrowDownLeft size={20} className="stroke-[3]" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white uppercase tracking-tight">{tx.type} {tx.asset}</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <p className={`text-base font-black ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'buy' ? '+' : '-'}${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 group-hover:text-slate-300 transition-colors">
                      {tx.amount.toFixed(6)} @ ${tx.price.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
