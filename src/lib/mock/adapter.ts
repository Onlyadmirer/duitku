import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import type {
  Budget,
  Category,
  CategoryReport,
  ReportSummary,
  Transaction,
  TransactionType,
  User,
  Wallet,
  WalletBalances,
} from "@/types/api";
import { currentMonth } from "@/lib/format";
import {
  createSeedDB,
  createUserData,
  loadMockDB,
  saveMockDB,
  type MockDB,
  type MockUser,
} from "./data";

class MockHttpError extends Error {
  status: number;
  code: string;
  fields?: { path: string; message: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: { path: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const publicUser = (user: MockUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const parseBody = (config: InternalAxiosRequestConfig): Record<string, unknown> => {
  if (!config.data) return {};
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return config.data as Record<string, unknown>;
};

const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const requireUser = (db: MockDB): MockUser => {
  const user = db.users.find((item) => item.id === db.sessionUserId);
  if (!user) {
    throw new MockHttpError(401, "TOKEN_NOT_FOUND", "Sesi tidak ditemukan. Silakan masuk kembali.");
  }
  return user;
};

const enrichTransaction = (db: MockDB, transaction: Transaction): Transaction => ({
  ...transaction,
  wallet: db.wallets.find((wallet) => wallet.id === transaction.walletId) ?? null,
  category: db.categories.find((category) => category.id === transaction.categoryId) ?? null,
});

const filterTransactions = (db: MockDB, userId: string) =>
  db.transactions
    .filter((transaction) => transaction.userId === userId)
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) return byDate;
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });

const monthTotals = (db: MockDB, userId: string, month: string) => {
  const transactions = filterTransactions(db, userId).filter((transaction) =>
    transaction.date.startsWith(month),
  );
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  return { income, expense, net: income - expense, transactionCount: transactions.length };
};

const categoryReport = (db: MockDB, userId: string, month: string): CategoryReport => {
  const expenses = filterTransactions(db, userId).filter(
    (transaction) => transaction.type === "expense" && transaction.date.startsWith(month),
  );
  const total = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
  const grouped = new Map<string, number>();
  for (const transaction of expenses) {
    grouped.set(transaction.categoryId, (grouped.get(transaction.categoryId) ?? 0) + transaction.amount);
  }
  const items = [...grouped.entries()]
    .map(([categoryId, amount]) => {
      const category = db.categories.find((item) => item.id === categoryId);
      return {
        categoryId,
        name: category?.name ?? "Lainnya",
        color: category?.color ?? "#64748B",
        total: amount,
        percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
  return { month, total, items };
};

const walletBalances = (db: MockDB, userId: string): WalletBalances => {
  const wallets = db.wallets.filter((wallet) => wallet.userId === userId);
  const transactions = filterTransactions(db, userId);
  const items = wallets.map((wallet) => {
    const related = transactions.filter((transaction) => transaction.walletId === wallet.id);
    const income = related
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expense = related
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    return {
      walletId: wallet.id,
      name: wallet.name,
      initialBalance: wallet.initialBalance,
      balance: wallet.initialBalance + income - expense,
    };
  });
  return { total: items.reduce((sum, item) => sum + item.balance, 0), items };
};

const budgetWithSpent = (db: MockDB, userId: string, budget: Budget): Budget => {
  const category = db.categories.find((item) => item.id === budget.categoryId) ?? null;
  const spent = filterTransactions(db, userId)
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.categoryId === budget.categoryId &&
        transaction.date.startsWith(budget.month),
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  return { ...budget, category, spent };
};

const withDelay = async () => {
  await new Promise((resolve) => setTimeout(resolve, 140 + Math.random() * 180));
};

const handle = async (
  config: InternalAxiosRequestConfig,
  db: MockDB,
): Promise<unknown> => {
  const method = (config.method ?? "get").toLowerCase();
  const url = (config.url ?? "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "");
  const path = url.split("?")[0] || "/";
  const params = (config.params ?? {}) as Record<string, unknown>;
  const body = parseBody(config);
  const segments = path.split("/").filter(Boolean);

  // Auth
  if (segments[0] === "auth") {
    if (segments[1] === "register" && method === "post") {
      const name = asString(body.name).trim();
      const email = asString(body.email).trim().toLowerCase();
      const password = asString(body.password);
      const fields: { path: string; message: string }[] = [];
      if (name.length < 2) fields.push({ path: "name", message: "Nama minimal 2 karakter" });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        fields.push({ path: "email", message: "Format email tidak valid" });
      if (password.length < 8)
        fields.push({ path: "password", message: "Password minimal 8 karakter" });
      if (fields.length) throw new MockHttpError(400, "VALIDATION_ERROR", "Input tidak valid", fields);
      if (db.users.some((user) => user.email === email))
        throw new MockHttpError(409, "EMAIL_TAKEN", "Email sudah terdaftar");

      const user: MockUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
      };
      const data = createUserData(user);
      db.users.push(user);
      db.categories.push(...data.categories);
      db.wallets.push(...data.wallets);
      db.transactions.push(...data.transactions);
      db.budgets.push(...data.budgets);
      db.sessionUserId = user.id;
      saveMockDB(db);
      return publicUser(user);
    }

    if (segments[1] === "login" && method === "post") {
      const email = asString(body.email).trim().toLowerCase();
      const password = asString(body.password);
      const user = db.users.find((item) => item.email === email && item.password === password);
      if (!user) {
        throw new MockHttpError(401, "INVALID_CREDENTIALS", "Email atau password salah");
      }
      db.sessionUserId = user.id;
      saveMockDB(db);
      return publicUser(user);
    }

    if (segments[1] === "refresh" && method === "post") {
      const user = db.users.find((item) => item.id === db.sessionUserId);
      if (!user) throw new MockHttpError(401, "TOKEN_INVALID", "Refresh token tidak valid");
      return publicUser(user);
    }

    if (segments[1] === "logout" && method === "post") {
      db.sessionUserId = null;
      saveMockDB(db);
      return null;
    }
  }

  if (segments[0] === "cronjob" && method === "get") {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  const user = requireUser(db);

  // Me
  if (segments[0] === "me" && method === "get") {
    return publicUser(user);
  }

  // Wallets
  if (segments[0] === "wallets") {
    if (method === "get" && segments.length === 1) {
      return db.wallets.filter((wallet) => wallet.userId === user.id);
    }
    if (method === "post" && segments.length === 1) {
      const name = asString(body.name).trim();
      if (!name) {
        throw new MockHttpError(400, "VALIDATION_ERROR", "Input tidak valid", [
          { path: "name", message: "Nama dompet wajib diisi" },
        ]);
      }
      const wallet: Wallet = {
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        initialBalance: asNumber(body.initialBalance),
        createdAt: new Date().toISOString(),
      } as Wallet;
      db.wallets.push(wallet);
      saveMockDB(db);
      return wallet;
    }
    const id = segments[1];
    const wallet = db.wallets.find((item) => item.id === id && item.userId === user.id);
    if (!wallet) throw new MockHttpError(404, "NOT_FOUND", "Dompet tidak ditemukan");
    if (method === "patch") {
      if (body.name !== undefined) wallet.name = asString(body.name).trim();
      if (body.initialBalance !== undefined) wallet.initialBalance = asNumber(body.initialBalance);
      wallet.updatedAt = new Date().toISOString();
      saveMockDB(db);
      return wallet;
    }
    if (method === "delete") {
      db.wallets = db.wallets.filter((item) => item.id !== wallet.id);
      db.transactions = db.transactions.filter((item) => item.walletId !== wallet.id);
      saveMockDB(db);
      return null;
    }
  }

  // Categories
  if (segments[0] === "categories") {
    if (method === "get" && segments.length === 1) {
      const type = params.type as TransactionType | undefined;
      return db.categories.filter(
        (category) => category.userId === user.id && (!type || category.type === type),
      );
    }
    if (method === "post" && segments.length === 1) {
      const name = asString(body.name).trim();
      const type = body.type === "income" ? "income" : "expense";
      const color = asString(body.color, "#64748B");
      const fields: { path: string; message: string }[] = [];
      if (!name) fields.push({ path: "name", message: "Nama kategori wajib diisi" });
      if (!/^#[0-9a-fA-F]{6}$/.test(color))
        fields.push({ path: "color", message: "Warna harus format #RRGGBB" });
      if (fields.length) throw new MockHttpError(400, "VALIDATION_ERROR", "Input tidak valid", fields);
      const category: Category = {
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        type,
        color,
        createdAt: new Date().toISOString(),
      } as Category;
      db.categories.push(category);
      saveMockDB(db);
      return category;
    }
    const id = segments[1];
    const category = db.categories.find((item) => item.id === id && item.userId === user.id);
    if (!category) throw new MockHttpError(404, "NOT_FOUND", "Kategori tidak ditemukan");
    if (method === "get") return category;
    if (method === "patch") {
      if (body.name !== undefined) category.name = asString(body.name).trim();
      if (body.color !== undefined) {
        const color = asString(body.color);
        if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
          throw new MockHttpError(400, "VALIDATION_ERROR", "Input tidak valid", [
            { path: "color", message: "Warna harus format #RRGGBB" },
          ]);
        }
        category.color = color;
      }
      category.updatedAt = new Date().toISOString();
      saveMockDB(db);
      return category;
    }
    if (method === "delete") {
      const used = db.transactions.some(
        (transaction) => transaction.userId === user.id && transaction.categoryId === category.id,
      );
      if (used) {
        throw new MockHttpError(
          409,
          "CATEGORY_IN_USE",
          "Kategori masih dipakai transaksi. Hapus atau pindahkan transaksinya dulu.",
        );
      }
      db.categories = db.categories.filter((item) => item.id !== category.id);
      db.budgets = db.budgets.filter((budget) => budget.categoryId !== category.id);
      saveMockDB(db);
      return null;
    }
  }

  // Transactions
  if (segments[0] === "transactions") {
    if (method === "get" && segments.length === 1) {
      const from = asString(params.from);
      const to = asString(params.to);
      const type = params.type as TransactionType | undefined;
      const walletId = asString(params.walletId);
      const categoryId = asString(params.categoryId);
      const search = asString(params.search).toLowerCase();
      const page = Math.max(1, asNumber(params.page, 1));
      const limit = Math.min(100, Math.max(1, asNumber(params.limit, 20)));

      const filtered = filterTransactions(db, user.id).filter((transaction) => {
        if (from && transaction.date < from) return false;
        if (to && transaction.date > to) return false;
        if (type && transaction.type !== type) return false;
        if (walletId && transaction.walletId !== walletId) return false;
        if (categoryId && transaction.categoryId !== categoryId) return false;
        if (search && !(transaction.note ?? "").toLowerCase().includes(search)) return false;
        return true;
      });
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const items = filtered
        .slice((page - 1) * limit, page * limit)
        .map((transaction) => enrichTransaction(db, transaction));
      return { items, page, limit, total, totalPages };
    }

    if (method === "post" && segments.length === 1) {
      const walletId = asString(body.walletId);
      const categoryId = asString(body.categoryId);
      const amount = asNumber(body.amount);
      const type = body.type === "income" ? "income" : "expense";
      const date = asString(body.date);
      const fields: { path: string; message: string }[] = [];
      if (!db.wallets.some((wallet) => wallet.id === walletId && wallet.userId === user.id))
        fields.push({ path: "walletId", message: "Dompet tidak ditemukan" });
      if (!db.categories.some((category) => category.id === categoryId && category.userId === user.id))
        fields.push({ path: "categoryId", message: "Kategori tidak ditemukan" });
      if (amount <= 0) fields.push({ path: "amount", message: "Nominal harus lebih dari 0" });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        fields.push({ path: "date", message: "Tanggal tidak valid" });
      if (fields.length) throw new MockHttpError(400, "VALIDATION_ERROR", "Input tidak valid", fields);

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        walletId,
        categoryId,
        amount,
        type,
        date,
        note: asString(body.note) || null,
        createdAt: new Date().toISOString(),
      } as Transaction;
      db.transactions.push(transaction);
      saveMockDB(db);
      return enrichTransaction(db, transaction);
    }

    const id = segments[1];
    const transaction = db.transactions.find(
      (item) => item.id === id && item.userId === user.id,
    );
    if (!transaction) throw new MockHttpError(404, "NOT_FOUND", "Transaksi tidak ditemukan");
    if (method === "get") return enrichTransaction(db, transaction);
    if (method === "patch") {
      if (body.walletId !== undefined) transaction.walletId = asString(body.walletId);
      if (body.categoryId !== undefined) transaction.categoryId = asString(body.categoryId);
      if (body.amount !== undefined) transaction.amount = asNumber(body.amount);
      if (body.type !== undefined) transaction.type = body.type === "income" ? "income" : "expense";
      if (body.date !== undefined) transaction.date = asString(body.date);
      if (body.note !== undefined) transaction.note = asString(body.note) || null;
      transaction.updatedAt = new Date().toISOString();
      saveMockDB(db);
      return enrichTransaction(db, transaction);
    }
    if (method === "delete") {
      db.transactions = db.transactions.filter((item) => item.id !== transaction.id);
      saveMockDB(db);
      return null;
    }
  }

  // Budgets
  if (segments[0] === "budgets") {
    if (method === "get" && segments.length === 1) {
      const month = asString(params.month, currentMonth());
      return db.budgets
        .filter((budget) => budget.userId === user.id && budget.month === month)
        .map((budget) => budgetWithSpent(db, user.id, budget));
    }
    if (method === "put" && segments.length === 1) {
      const categoryId = asString(body.categoryId);
      const month = asString(body.month, currentMonth());
      const limitAmount = asNumber(body.limitAmount);
      if (!db.categories.some((category) => category.id === categoryId && category.userId === user.id)) {
        throw new MockHttpError(400, "VALIDATION_ERROR", "Input tidak valid", [
          { path: "categoryId", message: "Kategori tidak ditemukan" },
        ]);
      }
      if (limitAmount <= 0) {
        throw new MockHttpError(400, "VALIDATION_ERROR", "Input tidak valid", [
          { path: "limitAmount", message: "Batas budget harus lebih dari 0" },
        ]);
      }
      let budget = db.budgets.find(
        (item) => item.userId === user.id && item.categoryId === categoryId && item.month === month,
      );
      if (budget) {
        budget.limitAmount = limitAmount;
        budget.updatedAt = new Date().toISOString();
      } else {
        budget = {
          id: crypto.randomUUID(),
          userId: user.id,
          categoryId,
          month,
          limitAmount,
          createdAt: new Date().toISOString(),
        } as Budget;
        db.budgets.push(budget);
      }
      saveMockDB(db);
      return budgetWithSpent(db, user.id, budget);
    }
    const id = segments[1];
    const budget = db.budgets.find((item) => item.id === id && item.userId === user.id);
    if (!budget) throw new MockHttpError(404, "NOT_FOUND", "Budget tidak ditemukan");
    if (method === "delete") {
      db.budgets = db.budgets.filter((item) => item.id !== budget.id);
      saveMockDB(db);
      return null;
    }
  }

  // Reports
  if (segments[0] === "reports") {
    const reportType = segments[1];
    if (reportType === "by-category" && method === "get") {
      return categoryReport(db, user.id, asString(params.month, currentMonth()));
    }
    if (reportType === "monthly-trend" && method === "get") {
      const year = asNumber(params.year, new Date().getFullYear());
      return Array.from({ length: 12 }, (_, index) => {
        const month = `${year}-${String(index + 1).padStart(2, "0")}`;
        return { month, ...monthTotals(db, user.id, month) };
      });
    }
    if (reportType === "wallet-balances" && method === "get") {
      return walletBalances(db, user.id);
    }
    if (!reportType && method === "get") {
      const month = asString(params.month, currentMonth());
      return { month, ...monthTotals(db, user.id, month) } as ReportSummary;
    }
  }

  throw new MockHttpError(404, "NOT_FOUND", "Rute tidak ditemukan");
};

const errorResponse = (config: InternalAxiosRequestConfig, error: MockHttpError) =>
  new AxiosError(
    error.message,
    error.code,
    config,
    null,
    {
      data: {
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      },
      status: error.status,
      statusText: error.code,
      headers: {},
      config,
    },
  );

export const mockAdapter: AxiosAdapter = async (config) => {
  await withDelay();
  const db = loadMockDB();
  try {
    const data = await handle(config, db);
    return {
      data: { success: true, data },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  } catch (error) {
    if (error instanceof MockHttpError) {
      throw errorResponse(config, error);
    }
    throw new AxiosError(
      "Terjadi kesalahan pada mock server",
      "INTERNAL_ERROR",
      config,
      null,
      {
        data: {
          error: {
            code: "INTERNAL_ERROR",
            message: "Terjadi kesalahan tak terduga di mock server",
          },
        },
        status: 500,
        statusText: "INTERNAL_ERROR",
        headers: {},
        config,
      },
    );
  }
};

export const mockDBInfo = () => {
  const db = loadMockDB();
  return { users: db.users.length, transactions: db.transactions.length };
};

export { createSeedDB };
