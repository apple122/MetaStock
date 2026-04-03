import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  th: {
    home: 'หน้าแรก',
    news: 'ข่าวสาร',
    trade: 'ซื้อ-ขาย',
    history: 'ประวัติ',
    wallet: 'กระเป๋าเงิน',
    settings: 'ตั้งค่า',
    gold: 'ทองคำ',
    latestPrice: 'ราคาล่าสุด',
    change24h: '24ชม.',
    buy: 'ซื้อ',
    sell: 'ขาย',
    deposit: 'ฝากเงิน',
    staking: 'Staking',
    withdraw: 'ถอนเงิน',
    myStaking: 'My Staking',
    recentTransactions: 'รายการล่าสุด',
    totalBalance: 'ยอดเงินทั้งหมด',
    verification: 'ยืนยันตัวตน',
    bankDetails: 'Bank Details',
    changePassword: 'เปลี่ยนรหัสผ่าน',
    login: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    username: 'ชื่อผู้ใช้',
    password: 'รหัสผ่าน',
    email: 'อีเมล',
    phone: 'เบอร์มือถือ',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    save: 'บันทึก',
    firstName: 'ชื่อ',
    lastName: 'นามสกุล',
    address: 'ที่อยู่',
    network: 'เครือข่าย',
    accountName: 'ชื่อบัญชี',
    accountAddress: 'ที่อยู่กระเป๋า/เลขบัญชี',
    historyDeposit: 'ประวัติการเติมเงิน',
    historyWithdraw: 'ประวัติการถอนเงิน',
    tradeHistory: 'ประวัติการซื้อ-ขาย (Trade History)',
    noTradeHistory: 'ไม่มีประวัติการซื้อขาย',
    actionBuy: 'ซื้อ (Buy)',
    actionSell: 'ขาย (Sell)',
    crypto: 'คริปโทฯ (Crypto)',
    commodity: 'สินค้าโภคภัณฑ์ (Commodity)',
    stock: 'หุ้น (Stock)',
    allCategories: 'ทุกหมวดหมู่ (All)',
    activityLedger: 'สมุดบัญชีธุรกรรม',
    all: 'ทั้งหมด',
    trades: 'การเทรด',
    wallets: 'รายการบัญชี',
    allAssets: 'สินทรัพย์ทั้งหมด',
    noRecordsFound: 'ไม่พบข้อมูลธุรกรรม',
    trackActivityDesc: 'ติดตามการเทรด, เงินฝาก และการโอนเงินของคุณได้ที่นี่',
    transactionId: 'รหัสธุรกรรม',
    executionPrice: 'ราคาที่ทำรายการ',
    quantity: 'จำนวน',
    type: 'ประเภท',
    noActivityInCat: 'ไม่มีรายการธุรกรรมในหมวดหมู่นี้',
  },
  en: {
    home: 'Home',
    news: 'News',
    trade: 'Trade',
    history: 'History',
    wallet: 'Wallet',
    settings: 'Settings',
    gold: 'Gold',
    latestPrice: 'Latest Price',
    change24h: '24h Change',
    buy: 'Buy',
    sell: 'Sell',
    deposit: 'Deposit',
    staking: 'Staking',
    withdraw: 'Withdraw',
    myStaking: 'My Staking',
    recentTransactions: 'Recent Transactions',
    totalBalance: 'Total Balance',
    verification: 'Identity Verification',
    bankDetails: 'Bank Details',
    changePassword: 'Change Password',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    phone: 'Phone Number',
    confirmPassword: 'Confirm Password',
    save: 'Save',
    firstName: 'First Name',
    lastName: 'Last Name',
    address: 'Address',
    network: 'Network',
    accountName: 'Account Name',
    accountAddress: 'Account Address',
    historyDeposit: 'Deposit History',
    historyWithdraw: 'Withdraw History',
    tradeHistory: 'Trade History',
    noTradeHistory: 'No trade history available.',
    actionBuy: 'Buy',
    actionSell: 'Sell',
    crypto: 'Crypto',
    commodity: 'Commodity',
    stock: 'Stock',
    allCategories: 'All Categories',
    activityLedger: 'Activity Ledger',
    all: 'All',
    trades: 'Trades',
    wallets: 'Wallets',
    allAssets: 'All Assets',
    noRecordsFound: 'No records found',
    trackActivityDesc: 'Track your trades, deposits, and transfers in one place',
    transactionId: 'Transaction ID',
    executionPrice: 'Execution Price',
    quantity: 'Quantity',
    type: 'Type',
    noActivityInCat: 'There is no activity in this category yet.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('appLanguage');
    return (saved === 'th' || saved === 'en') ? saved as Language : 'th';
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
