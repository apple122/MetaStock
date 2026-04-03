import { ShoppingBasket } from "lucide-react";

// Asset Icons
import goldIcon from "../assets/icon/Gold.png";
import bitcoinIcon from "../assets/icon/Bitcoin.png";
import ethereumIcon from "../assets/icon/Ethereum.png";
import tetherIcon from "../assets/icon/Tether.png";
import bnbIcon from "../assets/icon/BNB.png";
import solanaIcon from "../assets/icon/Solano.png";
import dogecoinIcon from "../assets/icon/Dogecion.png";
import nvidiaIcon from "../assets/icon/NVIDIA.png";
import appleIcon from "../assets/icon/Apple Inc.png";
import teslaIcon from "../assets/icon/Tesla.png";
import netflixIcon from "../assets/icon/Netflix.png";
import amazonIcon from "../assets/icon/Amazon.com.png";
import googleIcon from "../assets/icon/Google.png";
import metaIcon from "../assets/icon/Meta Platforms.png";
import microsoftIcon from "../assets/icon/Microsoft Corp.png";

export const mockStocks = [
  {
    id: 1,
    name: "Gold",
    symbol: "GOLD",
    price: 2315.4,
    change: 1.2,
    icon: (
      <img
        src={goldIcon}
        alt="Gold"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 2,
    name: "Bitcoin",
    symbol: "BTC",
    price: 65420.0,
    change: -0.5,
    icon: (
      <img
        src={bitcoinIcon}
        alt="Bitcoin"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 3,
    name: "Ethereum",
    symbol: "ETH",
    price: 3450.25,
    change: 2.1,
    icon: (
      <img
        src={ethereumIcon}
        alt="Ethereum"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 4,
    name: "Tether",
    symbol: "USDT",
    price: 1.0,
    change: 0.01,
    icon: (
      <img
        src={tetherIcon}
        alt="Tether"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 5,
    name: "BNB",
    symbol: "BNB",
    price: 580.45,
    change: 0.8,
    icon: (
      <img
        src={bnbIcon}
        alt="BNB"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 6,
    name: "Solana",
    symbol: "SOL",
    price: 145.2,
    change: 5.4,
    icon: (
      <img
        src={solanaIcon}
        alt="Solana"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 7,
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.18,
    change: -2.3,
    icon: (
      <img
        src={dogecoinIcon}
        alt="Dogecoin"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 8,
    name: "NVIDIA",
    symbol: "NVDA",
    price: 890.5,
    change: 3.2,
    icon: (
      <img
        src={nvidiaIcon}
        alt="NVIDIA"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 9,
    name: "Apple Inc",
    symbol: "AAPL",
    price: 175.4,
    change: -0.8,
    icon: (
      <img
        src={appleIcon}
        alt="Apple"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 10,
    name: "Tesla",
    symbol: "TSLA",
    price: 180.2,
    change: -1.5,
    icon: (
      <img
        src={teslaIcon}
        alt="Tesla"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 11,
    name: "Netflix",
    symbol: "NFLX",
    price: 620.1,
    change: 1.1,
    icon: (
      <img
        src={netflixIcon}
        alt="Netflix"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 12,
    name: "Amazon",
    symbol: "AMZN",
    price: 185.3,
    change: 0.5,
    icon: (
      <img
        src={amazonIcon}
        alt="Amazon"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 13,
    name: "Google",
    symbol: "GOOGL",
    price: 145.3,
    change: 1.5,
    icon: (
      <img
        src={googleIcon}
        alt="Google"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 14,
    name: "Meta Platforms",
    symbol: "META",
    price: 485.3,
    change: 2.1,
    icon: (
      <img
        src={metaIcon}
        alt="Meta"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 15,
    name: "Microsoft Corp",
    symbol: "MSFT",
    price: 415.3,
    change: 0.8,
    icon: (
      <img
        src={microsoftIcon}
        alt="Microsoft"
        className="w-full h-full object-contain p-1"
      />
    ),
  },
  {
    id: 16,
    name: "Instacart (Maplebear Inc.)",
    symbol: "CART",
    price: 32.45,
    change: 4.2,
    icon: <ShoppingBasket className="text-pink-500" />,
  },
];
