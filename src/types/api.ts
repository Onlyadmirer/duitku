export type TransactionType = "income" | "expense";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export type Wallet = {
  id: string;
  name: string;
  initialBalance: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Transaction = {
  id: string;
  walletId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string | null;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  wallet?: Wallet | null;
  category?: Category | null;
};

export type TransactionList = {
  items: Transaction[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TransactionFilters = {
  from?: string;
  to?: string;
  type?: TransactionType;
  walletId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type Budget = {
  id: string;
  categoryId: string;
  month: string;
  limitAmount: number;
  category?: Category | null;
  spent?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ReportSummary = {
  month: string;
  income: number;
  expense: number;
  net: number;
  transactionCount?: number;
};

export type CategoryReportItem = {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  percentage: number;
};

export type CategoryReport = {
  month: string;
  total: number;
  items: CategoryReportItem[];
};

export type TrendPoint = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

export type WalletBalance = {
  walletId: string;
  name: string;
  initialBalance: number;
  balance: number;
};

export type WalletBalances = {
  total: number;
  items: WalletBalance[];
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: { path: string; message: string }[];
  };
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type TransactionInput = {
  walletId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;
};

export type BudgetInput = {
  categoryId: string;
  month: string;
  limitAmount: number;
};

export type CategoryInput = {
  name: string;
  type: TransactionType;
  color: string;
};

export type WalletInput = {
  name: string;
  initialBalance?: number;
};
