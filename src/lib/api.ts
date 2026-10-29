import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type {
  ApiErrorBody,
  Budget,
  BudgetInput,
  Category,
  CategoryInput,
  CategoryReport,
  LoginInput,
  RegisterInput,
  ReportSummary,
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionList,
  TrendPoint,
  User,
  Wallet,
  WalletBalances,
  WalletInput,
} from "@/types/api";
import { currentMonth, MONTHS_LONG, MONTHS_SHORT } from "@/lib/format";
import { mockAdapter } from "@/lib/mock/adapter";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export class ApiError extends Error {
  code: string;
  status: number;
  fields?: { path: string; message: string }[];

  constructor(
    message: string,
    code = "INTERNAL_ERROR",
    status = 500,
    fields?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    return new ApiError(
      body?.error?.message ?? error.message ?? "Terjadi kesalahan",
      body?.error?.code ?? error.code ?? "INTERNAL_ERROR",
      error.response?.status ?? 500,
      body?.error?.fields,
    );
  }
  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError("Terjadi kesalahan tak terduga");
};

export const getErrorMessage = (error: unknown) => normalizeError(error).message;

export const getApiError = (error: unknown) => normalizeError(error);

const api = axios.create({
  baseURL,
  withCredentials: true,
  adapter: USE_MOCK ? mockAdapter : undefined,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  adapter: USE_MOCK ? mockAdapter : undefined,
});

let refreshPromise: Promise<unknown> | null = null;

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient.post("/auth/refresh").finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const redirectToLogin = () => {
  const path = window.location.pathname;
  if (path === "/masuk" || path === "/daftar") return;
  const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  window.location.assign(`/masuk?redirect=${redirect}`);
};

api.interceptors.response.use(
  (response) => {
    const payload = response.data as Record<string, unknown>;
    if (payload && typeof payload === "object" && "success" in payload) {
      return { ...response, data: payload.data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = config?.url ?? "";
    const isAuthPath = /\/auth\/(login|register|refresh|logout)/.test(url);
    if (error.response?.status === 401 && config && !config._retry && !isAuthPath) {
      config._retry = true;
      try {
        await refreshSession();
        return api.request(config);
      } catch {
        redirectToLogin();
        return Promise.reject(normalizeError(error));
      }
    }
    return Promise.reject(normalizeError(error));
  },
);

type TransactionListResponse = {
  items?: Transaction[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  meta?: Partial<TransactionList>;
};

const normalizeList = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const row = data as { items?: unknown; data?: unknown };
    if (Array.isArray(row.items)) return row.items as T[];
    if (Array.isArray(row.data)) return row.data as T[];
  }
  return [];
};

const normalizeUser = (data: unknown): User => {
  const row = (data ?? {}) as Record<string, unknown>;
  const nested = row.user;
  const user =
    nested && typeof nested === "object" ? (nested as Record<string, unknown>) : row;
  return {
    id: String(user.id ?? ""),
    name: String(user.name ?? "Pengguna"),
    email: String(user.email ?? ""),
    createdAt: user.createdAt ? String(user.createdAt) : undefined,
  };
};

const normalizeTransactionList = (
  data: TransactionList | Transaction[] | TransactionListResponse,
  filters: TransactionFilters,
): TransactionList => {
  if (Array.isArray(data)) {
    return {
      items: data,
      page: filters.page ?? 1,
      limit: filters.limit ?? data.length,
      total: data.length,
      totalPages: 1,
    };
  }
  const row = data as TransactionListResponse & { data?: Transaction[] };
  const items = Array.isArray(row.items)
    ? row.items
    : Array.isArray(row.data)
      ? row.data
      : null;
  if (items) {
    const page = Number(row.page ?? row.meta?.page ?? filters.page ?? 1);
    const limit = Number(row.limit ?? row.meta?.limit ?? filters.limit ?? 20);
    const total = Number(row.total ?? row.meta?.total ?? items.length);
    return {
      items,
      page,
      limit,
      total,
      totalPages: Number(
        row.totalPages ??
          row.meta?.totalPages ??
          Math.max(1, Math.ceil(total / limit)),
      ),
    };
  }
  return { items: [], page: 1, limit: filters.limit ?? 20, total: 0, totalPages: 1 };
};

const monthKey = (value: unknown, year: number) => {
  if (typeof value === "number" && value >= 1 && value <= 12) {
    return `${year}-${String(value).padStart(2, "0")}`;
  }
  const raw = String(value ?? "").trim();
  const iso = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(raw);
  if (iso) return `${iso[1]}-${iso[2]}`;
  const numeric = /^(\d{1,2})$/.exec(raw);
  if (numeric) {
    const index = Number(numeric[1]) - 1;
    if (index >= 0 && index < 12) {
      return `${year}-${String(index + 1).padStart(2, "0")}`;
    }
  }
  const named = /^([A-Za-z]+)(?:\s+(\d{4}))?$/.exec(raw);
  if (named) {
    const shortIndex = MONTHS_SHORT.findIndex(
      (month) => month.toLowerCase() === named[1].slice(0, 3).toLowerCase(),
    );
    const longIndex = MONTHS_LONG.findIndex(
      (month) => month.toLowerCase() === named[1].toLowerCase(),
    );
    const index = shortIndex >= 0 ? shortIndex : longIndex;
    if (index >= 0) {
      return `${named[2] ?? year}-${String(index + 1).padStart(2, "0")}`;
    }
  }
  return "";
};

const normalizeTrend = (data: unknown, year: number): TrendPoint[] => {
  const items = Array.isArray(data)
    ? data
    : data && typeof data === "object" && "items" in data && Array.isArray(data.items)
      ? data.items
      : [];
  return items.map((item, index) => {
    const point = item as Record<string, unknown>;
    const income = Number(point.income ?? point.totalIncome ?? 0);
    const expense = Number(point.expense ?? point.totalExpense ?? 0);
    return {
      month:
        monthKey(point.month ?? point.period ?? point.monthKey, year) ||
        `${year}-${String(index + 1).padStart(2, "0")}`,
      income,
      expense,
      net: Number(point.net ?? income - expense),
    };
  });
};

const normalizeCategoryReport = (data: unknown, month: string): CategoryReport => {
  const mapItem = (item: unknown) => {
    const entry = (item ?? {}) as Record<string, unknown>;
    const nested =
      entry.category && typeof entry.category === "object"
        ? (entry.category as Record<string, unknown>)
        : undefined;
    return {
      categoryId: String(entry.categoryId ?? nested?.id ?? entry.id ?? ""),
      name: String(entry.name ?? entry.categoryName ?? nested?.name ?? "Lainnya"),
      color: String(entry.color ?? nested?.color ?? "#64748B"),
      total: Number(entry.total ?? entry.amount ?? 0),
      percentage: Number(entry.percentage ?? 0),
    };
  };

  if (Array.isArray(data)) {
    const items = data.map(mapItem).sort((a, b) => b.total - a.total);
    const total = items.reduce((sum, item) => sum + item.total, 0);
    return { month, total, items };
  }
  const row = (data ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(row.items) ? row.items : [];
  const items = rawItems.map(mapItem).sort((a, b) => b.total - a.total);
  return {
    month: String(row.month ?? month),
    total: Number(row.total ?? items.reduce((sum, item) => sum + item.total, 0)),
    items,
  };
};

const normalizeWalletBalances = (data: unknown): WalletBalances => {
  const row = (data ?? {}) as Record<string, unknown>;
  const rawItems = Array.isArray(data) ? data : Array.isArray(row.items) ? row.items : [];
  const items = rawItems.map((item) => {
    const entry = (item ?? {}) as Record<string, unknown>;
    const nested =
      entry.wallet && typeof entry.wallet === "object"
        ? (entry.wallet as Record<string, unknown>)
        : undefined;
    return {
      walletId: String(entry.walletId ?? nested?.id ?? entry.id ?? ""),
      name: String(entry.name ?? nested?.name ?? "Dompet"),
      initialBalance: Number(entry.initialBalance ?? nested?.initialBalance ?? 0),
      balance: Number(entry.balance ?? entry.currentBalance ?? 0),
    };
  });
  return {
    total: Number(row.total ?? items.reduce((sum, item) => sum + item.balance, 0)),
    items,
  };
};

export const authApi = {
  me: () =>
    api.get<unknown>("/me").then((response) => normalizeUser(response.data)),
  login: (input: LoginInput) =>
    api.post<unknown>("/auth/login", input).then((response) => normalizeUser(response.data)),
  register: (input: RegisterInput) =>
    api
      .post<unknown>("/auth/register", input)
      .then((response) => normalizeUser(response.data)),
  logout: () => api.post<null>("/auth/logout").then((response) => response.data),
};

export const walletApi = {
  list: () =>
    api
      .get<unknown>("/wallets")
      .then((response) => normalizeList<Wallet>(response.data)),
  create: (input: WalletInput) =>
    api.post<Wallet>("/wallets", input).then((response) => response.data),
  update: (id: string, input: Partial<WalletInput>) =>
    api.patch<Wallet>(`/wallets/${id}`, input).then((response) => response.data),
  remove: (id: string) => api.delete<null>(`/wallets/${id}`).then((response) => response.data),
};

export const categoryApi = {
  list: (type?: "income" | "expense") =>
    api
      .get<unknown>("/categories", { params: type ? { type } : undefined })
      .then((response) => normalizeList<Category>(response.data)),
  get: (id: string) =>
    api.get<Category>(`/categories/${id}`).then((response) => response.data),
  create: (input: CategoryInput) =>
    api.post<Category>("/categories", input).then((response) => response.data),
  update: (id: string, input: Partial<Pick<CategoryInput, "name" | "color">>) =>
    api.patch<Category>(`/categories/${id}`, input).then((response) => response.data),
  remove: (id: string) =>
    api.delete<null>(`/categories/${id}`).then((response) => response.data),
};

export const transactionApi = {
  list: async (filters: TransactionFilters = {}) => {
    const response = await api.get<TransactionList | Transaction[] | TransactionListResponse>(
      "/transactions",
      { params: filters },
    );
    return normalizeTransactionList(response.data, filters);
  },
  get: (id: string) =>
    api.get<Transaction>(`/transactions/${id}`).then((response) => response.data),
  create: (input: TransactionInput) =>
    api.post<Transaction>("/transactions", input).then((response) => response.data),
  update: (id: string, input: Partial<TransactionInput>) =>
    api.patch<Transaction>(`/transactions/${id}`, input).then((response) => response.data),
  remove: (id: string) =>
    api.delete<null>(`/transactions/${id}`).then((response) => response.data),
};

export const budgetApi = {
  list: (month: string) =>
    api
      .get<unknown>("/budgets", { params: { month } })
      .then((response) => normalizeList<Budget>(response.data)),
  upsert: (input: BudgetInput) =>
    api.put<Budget>("/budgets", input).then((response) => response.data),
  remove: (id: string) =>
    api.delete<null>(`/budgets/${id}`).then((response) => response.data),
};

export const reportApi = {
  summary: (month = currentMonth()) =>
    api
      .get<ReportSummary | Record<string, unknown>>("/reports", { params: { month } })
      .then((response) => {
        const row = response.data as Record<string, unknown>;
        const income = Number(row.income ?? row.totalIncome ?? 0);
        const expense = Number(row.expense ?? row.totalExpense ?? 0);
        return {
          month: String(row.month ?? month),
          income,
          expense,
          net: Number(row.net ?? income - expense),
          transactionCount: Number(row.transactionCount ?? 0),
        } satisfies ReportSummary;
      }),
  byCategory: (month = currentMonth()) =>
    api
      .get<unknown>("/reports/by-category", { params: { month } })
      .then((response) => normalizeCategoryReport(response.data, month)),
  monthlyTrend: (year: number) =>
    api
      .get<unknown>("/reports/monthly-trend", { params: { year } })
      .then((response) => normalizeTrend(response.data, year)),
  walletBalances: () =>
    api
      .get<unknown>("/reports/wallet-balances")
      .then((response) => normalizeWalletBalances(response.data)),
};

export default api;
