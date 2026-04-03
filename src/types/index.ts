export interface Profile {
  id: string;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  balance: number;
  is_admin: boolean;
  code: string;
  email: string;
  password?: string;
  address?: string;
  kyc_status?: string;
  bank_network?: string;
  bank_account?: string;
  bank_name?: string;
}

export interface GlobalSettings {
  id?: string;
  contact_phone: string;
  contact_line: string;
  contact_telegram: string;
}

export interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw";
  asset: string;
  amount: number;
  price: number;
  total: number;
  timestamp: string;
  status: "success" | "pending" | "failed";
}
