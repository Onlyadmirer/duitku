import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BriefcaseBusiness,
  Car,
  CreditCard,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Landmark,
  PiggyBank,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  Wallet,
  Zap,
} from "lucide-react";

const categoryIconRules: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["makan", "minum", "kopi", "resto", "food"], icon: UtensilsCrossed },
  { keywords: ["transport", "bensin", "ojek", "taksi", "parkir"], icon: Car },
  { keywords: ["belanja", "shopping", "supermarket"], icon: ShoppingBag },
  { keywords: ["tagihan", "listrik", "air", "internet", "pulsa"], icon: Zap },
  { keywords: ["kesehatan", "obat", "dokter"], icon: HeartPulse },
  { keywords: ["pendidikan", "sekolah", "kursus", "buku"], icon: GraduationCap },
  { keywords: ["hiburan", "film", "game", "musik"], icon: Gamepad2 },
  { keywords: ["olahraga", "gym", "sport"], icon: Dumbbell },
  { keywords: ["asuransi", "proteksi"], icon: ShieldCheck },
  { keywords: ["tabungan", "investasi", "saham", "deposito"], icon: PiggyBank },
  { keywords: ["gaji", "bonus", "pendapatan", "salary"], icon: Banknote },
  { keywords: ["usaha", "bisnis", "freelance"], icon: BriefcaseBusiness },
  { keywords: ["tagihan", "receipt", "utilitas"], icon: Receipt },
];

export const categoryIcon = (name?: string): LucideIcon => {
  const normalized = name?.toLowerCase() ?? "";
  return (
    categoryIconRules.find((rule) =>
      rule.keywords.some((keyword) => normalized.includes(keyword)),
    )?.icon ?? Tag
  );
};

export const walletIcon = (name?: string): LucideIcon => {
  const normalized = name?.toLowerCase() ?? "";
  if (/(tunai|cash|dompet)/.test(normalized)) return Banknote;
  if (/(bca|bri|bni|mandiri|bank|jago|seabank)/.test(normalized)) return Landmark;
  if (/(gopay|ovo|dana|shopeepay|e-?wallet)/.test(normalized)) return Wallet;
  return CreditCard;
};

export const CATEGORY_COLORS = [
  "#3525CD",
  "#4F46E5",
  "#0284C7",
  "#006C49",
  "#059669",
  "#B45309",
  "#EA580C",
  "#DC2626",
  "#DB2777",
  "#7C3AED",
  "#64748B",
  "#0F766E",
];

export const statusTone = (ratio: number) => {
  if (ratio >= 1) {
    return {
      label: "Melebihi",
      text: "text-destructive",
      bg: "bg-destructive/10",
      bar: "bg-destructive",
    };
  }
  if (ratio >= 0.85) {
    return {
      label: "Hampir habis",
      text: "text-warning",
      bg: "bg-warning/10",
      bar: "bg-warning",
    };
  }
  return {
    label: "Aman",
    text: "text-secondary",
    bg: "bg-secondary/10",
    bar: "bg-secondary",
  };
};
