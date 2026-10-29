import type {
  Budget,
  Category,
  Transaction,
  TransactionType,
  User,
  Wallet,
} from "@/types/api";
import { currentMonth, shiftMonth } from "@/lib/format";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";

const STORAGE_KEY = "duitku.mock.v3";

export const DEMO_USER_ID = "demo-user-akmal";

export type MockUser = User & { password: string };

export type MockDB = {
  users: MockUser[];
  sessionUserId: string | null;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
};

const uid = () => crypto.randomUUID();

const DEFAULT_CATEGORY_TEMPLATES: {
  name: string;
  type: TransactionType;
  color: string;
}[] = [
  { name: "Gaji", type: "income", color: "#006C49" },
  { name: "Bonus", type: "income", color: "#0284C7" },
  { name: "Investasi", type: "income", color: "#7C3AED" },
  { name: "Makan & Minum", type: "expense", color: "#EA580C" },
  { name: "Transportasi", type: "expense", color: "#B45309" },
  { name: "Belanja", type: "expense", color: "#DB2777" },
  { name: "Tagihan", type: "expense", color: "#0284C7" },
  { name: "Kesehatan", type: "expense", color: "#DC2626" },
  { name: "Pendidikan", type: "expense", color: "#7C3AED" },
  { name: "Hiburan", type: "expense", color: "#F59E0B" },
  { name: "Olahraga", type: "expense", color: "#059669" },
  { name: "Lainnya", type: "expense", color: "#64748B" },
];

const WALLET_TEMPLATES = [
  { name: "Tunai", initialBalance: 850_000 },
  { name: "BCA", initialBalance: 9_250_000 },
  { name: "GoPay", initialBalance: 1_500_000 },
];

type ExpenseTemplate = {
  day: number;
  category: string;
  wallet: string;
  amount: number;
  note: string;
};

const EXPENSE_TEMPLATES: ExpenseTemplate[] = [
  { day: 3, category: "Makan & Minum", wallet: "GoPay", amount: 45_000, note: "Kopi Janji Jiwa" },
  { day: 5, category: "Transportasi", wallet: "GoPay", amount: 180_000, note: "Isi bensin Shell" },
  { day: 7, category: "Belanja", wallet: "BCA", amount: 540_000, note: "Supermarket Grand Lucky" },
  { day: 9, category: "Makan & Minum", wallet: "Tunai", amount: 38_000, note: "Nasi padang" },
  { day: 11, category: "Tagihan", wallet: "BCA", amount: 250_000, note: "Token listrik PLN" },
  { day: 13, category: "Transportasi", wallet: "GoPay", amount: 120_000, note: "Ojek online" },
  { day: 15, category: "Makan & Minum", wallet: "BCA", amount: 125_000, note: "Makan malam" },
  { day: 17, category: "Hiburan", wallet: "GoPay", amount: 89_000, note: "Langganan streaming" },
  { day: 19, category: "Makan & Minum", wallet: "Tunai", amount: 250_000, note: "Makan keluarga" },
  { day: 20, category: "Belanja", wallet: "BCA", amount: 410_000, note: "Belanja bulanan" },
  { day: 21, category: "Transportasi", wallet: "Tunai", amount: 700_000, note: "Servis motor" },
  { day: 22, category: "Tagihan", wallet: "BCA", amount: 400_000, note: "Internet IndiHome" },
  { day: 24, category: "Makan & Minum", wallet: "GoPay", amount: 650_000, note: "Makan malam keluarga" },
  { day: 26, category: "Makan & Minum", wallet: "Tunai", amount: 85_000, note: "Sarapan" },
  { day: 27, category: "Makan & Minum", wallet: "GoPay", amount: 220_000, note: "Kopi & snack kantor" },
  { day: 28, category: "Transportasi", wallet: "GoPay", amount: 420_000, note: "Bensin & tol" },
  { day: 28, category: "Lainnya", wallet: "Tunai", amount: 150_000, note: "Donasi" },
  { day: 28, category: "Makan & Minum", wallet: "Tunai", amount: 167_000, note: "Makan siang" },
];

const pad = (value: number) => String(value).padStart(2, "0");

const dateInMonth = (year: number, monthIndex: number, day: number) => {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return `${year}-${pad(monthIndex + 1)}-${pad(Math.min(Math.max(day, 1), lastDay))}`;
};

const makeCategories = (userId: string): Category[] =>
  DEFAULT_CATEGORY_TEMPLATES.map((template) => ({
    id: uid(),
    userId,
    ...template,
    createdAt: new Date().toISOString(),
  })) as Category[];

const makeWallets = (userId: string): Wallet[] =>
  WALLET_TEMPLATES.map((template) => ({
    id: uid(),
    userId,
    ...template,
    createdAt: new Date().toISOString(),
  })) as Wallet[];

const buildTransactions = (
  userId: string,
  categories: Category[],
  wallets: Wallet[],
): Transaction[] => {
  const categoryByName = new Map(categories.map((category) => [category.name, category]));
  const walletByName = new Map(wallets.map((wallet) => [wallet.name, wallet]));
  const today = new Date();
  const transactions: Transaction[] = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const isCurrent = offset === 0;
    const maxDay = isCurrent ? today.getDate() : new Date(year, monthIndex + 1, 0).getDate();
    const multiplier = 1 + ((offset % 4) * 0.04);

    const salaryDay = Math.min(25, maxDay);
    const salaryCategory = categoryByName.get("Gaji");
    const bankWallet = walletByName.get("BCA");
    const cashWallet = walletByName.get("Tunai");
    const eWallet = walletByName.get("GoPay");
    if (salaryCategory) {
      const salarySplits = [
        { wallet: bankWallet, amount: 5_200_000, note: "Gaji bulanan (rekening)" },
        { wallet: cashWallet, amount: 1_500_000, note: "Gaji bulanan (tunai)" },
        { wallet: eWallet, amount: 1_800_000, note: "Gaji bulanan (e-wallet)" },
      ];
      for (const split of salarySplits) {
        if (!split.wallet) continue;
        transactions.push({
          id: uid(),
          userId,
          walletId: split.wallet.id,
          categoryId: salaryCategory.id,
          amount: split.amount,
          type: "income",
          date: dateInMonth(year, monthIndex, salaryDay),
          note: split.note,
          createdAt: new Date(year, monthIndex, salaryDay, 9).toISOString(),
        } as Transaction);
      }
    }

    if ((monthIndex + 1) % 3 === 0) {
      const bonusCategory = categoryByName.get("Bonus");
      if (bonusCategory && bankWallet && 12 <= maxDay) {
        transactions.push({
          id: uid(),
          userId,
          walletId: bankWallet.id,
          categoryId: bonusCategory.id,
          amount: 1_750_000,
          type: "income",
          date: dateInMonth(year, monthIndex, 12),
          note: "Bonus proyek freelance",
          createdAt: new Date(year, monthIndex, 12, 14).toISOString(),
        } as Transaction);
      }
    }

    if (monthIndex % 6 === 0) {
      const investCategory = categoryByName.get("Investasi");
      if (investCategory && bankWallet && 18 <= maxDay) {
        transactions.push({
          id: uid(),
          userId,
          walletId: bankWallet.id,
          categoryId: investCategory.id,
          amount: 350_000,
          type: "income",
          date: dateInMonth(year, monthIndex, 18),
          note: "Dividen reksa dana",
          createdAt: new Date(year, monthIndex, 18, 10).toISOString(),
        } as Transaction);
      }
    }

    for (const template of EXPENSE_TEMPLATES) {
      if (template.day > maxDay) continue;
      const category = categoryByName.get(template.category);
      const wallet = walletByName.get(template.wallet);
      if (!category || !wallet) continue;
      transactions.push({
        id: uid(),
        userId,
        walletId: wallet.id,
        categoryId: category.id,
        amount: Math.round(template.amount * multiplier),
        type: "expense",
        date: dateInMonth(year, monthIndex, template.day),
        note: template.note,
        createdAt: new Date(year, monthIndex, template.day, 12).toISOString(),
      } as Transaction);
    }
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
};

const buildBudgets = (
  userId: string,
  categories: Category[],
): Budget[] => {
  const limits: Record<string, number> = {
    "Makan & Minum": 1_500_000,
    Transportasi: 1_500_000,
    Belanja: 2_000_000,
    Tagihan: 1_200_000,
    Hiburan: 800_000,
  };
  const categoryByName = new Map(categories.map((category) => [category.name, category]));
  const months = [currentMonth(), shiftMonth(currentMonth(), -1), shiftMonth(currentMonth(), -2)];
  const budgets: Budget[] = [];

  for (const month of months) {
    for (const [name, limitAmount] of Object.entries(limits)) {
      const category = categoryByName.get(name);
      if (!category) continue;
      budgets.push({
        id: uid(),
        userId,
        categoryId: category.id,
        month,
        limitAmount,
        createdAt: new Date().toISOString(),
      } as Budget);
    }
  }

  return budgets;
};

export const createSeedDB = (): MockDB => {
  const demoUser: MockUser = {
    id: DEMO_USER_ID,
    name: "Akmal Pratama",
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    createdAt: new Date().toISOString(),
  };
  const categories = makeCategories(DEMO_USER_ID);
  const wallets = makeWallets(DEMO_USER_ID);

  return {
    users: [demoUser],
    sessionUserId: DEMO_USER_ID,
    wallets,
    categories,
    transactions: buildTransactions(DEMO_USER_ID, categories, wallets),
    budgets: buildBudgets(DEMO_USER_ID, categories),
  };
};

export const loadMockDB = (): MockDB => {
  if (typeof window === "undefined") return createSeedDB();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDB;
  } catch {
    // Abaikan data rusak dan buat ulang.
  }
  const seed = createSeedDB();
  saveMockDB(seed);
  return seed;
};

export const saveMockDB = (db: MockDB) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const resetMockDB = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const createUserData = (user: MockUser) => {
  const categories = makeCategories(user.id);
  const wallets: Wallet[] = [
    {
      id: uid(),
      userId: user.id,
      name: "Dompet Utama",
      initialBalance: 0,
      createdAt: new Date().toISOString(),
    },
  ];
  return {
    user,
    categories,
    wallets,
    transactions: [] as Transaction[],
    budgets: [] as Budget[],
  };
};
