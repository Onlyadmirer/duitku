import type { TransactionFilters, TransactionType } from "@/types/api";

export const qk = {
  me: ["me"] as const,
  wallets: ["wallets"] as const,
  categories: (type?: TransactionType) => ["categories", type ?? "all"] as const,
  transactions: (filters: TransactionFilters = {}) => ["transactions", filters] as const,
  transaction: (id: string) => ["transaction", id] as const,
  budgets: (month: string) => ["budgets", month] as const,
  reportSummary: (month: string) => ["report", "summary", month] as const,
  reportByCategory: (month: string) => ["report", "by-category", month] as const,
  reportTrend: (year: number) => ["report", "trend", year] as const,
  reportWalletBalances: ["report", "wallet-balances"] as const,
};
