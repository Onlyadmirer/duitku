import { useMemo, useState } from "react";
import { CalendarDays, Sparkles } from "lucide-react";
import { MonthPicker } from "@/components/app/month-picker";
import { ErrorState } from "@/components/app/common";
import SaldoInfo from "./components/SaldoInfo";
import Arus from "./components/Arus";
import TrendChart from "./components/TrendChart";
import BudgetList, { type BudgetView } from "./components/BudgetList";
import RecentTransactions from "./components/RecentTransactions";
import {
  useBudgets,
  useCategories,
  useCategoryReport,
  useMe,
  useMonthlyTrend,
  useReportSummary,
  useTransactions,
  useWalletBalances,
} from "@/hooks/use-finance";
import {
  currentMonth,
  firstName,
  formatMonthLong,
  formatRupiah,
  formatSignedRupiah,
  monthYear,
} from "@/lib/format";
import type { Transaction } from "@/types/api";

function HomePage() {
  const [month, setMonth] = useState(currentMonth);
  const year = monthYear(month);

  const me = useMe();
  const summary = useReportSummary(month);
  const balances = useWalletBalances();
  const trend = useMonthlyTrend(year);
  const budgets = useBudgets(month);
  const byCategory = useCategoryReport(month);
  const categories = useCategories();
  const recent = useTransactions({ limit: 5 });

  const budgetViews = useMemo<BudgetView[]>(() => {
    const categoryList = categories.data ?? [];
    const spentByCategory = new Map(
      (byCategory.data?.items ?? []).map((item) => [item.categoryId, item.total]),
    );
    return (budgets.data ?? []).map((budget) => {
      const category =
        budget.category ?? categoryList.find((item) => item.id === budget.categoryId);
      return {
        id: budget.id,
        categoryId: budget.categoryId,
        name: category?.name ?? "Kategori",
        color: category?.color ?? "#64748B",
        spent: budget.spent ?? spentByCategory.get(budget.categoryId) ?? 0,
        limit: budget.limitAmount,
      };
    });
  }, [budgets.data, byCategory.data, categories.data]);

  const recentItems = useMemo<Transaction[]>(() => {
    const categoryById = new Map((categories.data ?? []).map((item) => [item.id, item]));
    const walletById = new Map(
      (balances.data?.items ?? []).map((item) => [item.walletId, item]),
    );
    return (recent.data?.items ?? []).map((transaction) => {
      const wallet = walletById.get(transaction.walletId);
      return {
        ...transaction,
        category: transaction.category ?? categoryById.get(transaction.categoryId) ?? null,
        wallet:
          transaction.wallet ??
          (wallet
            ? {
                id: wallet.walletId,
                name: wallet.name,
                initialBalance: wallet.initialBalance,
              }
            : null),
      };
    });
  }, [recent.data, categories.data, balances.data]);

  const error =
    summary.error ??
    balances.error ??
    trend.error ??
    budgets.error ??
    byCategory.error ??
    categories.error ??
    recent.error;
  const retry = () => {
    void summary.refetch();
    void balances.refetch();
    void trend.refetch();
    void budgets.refetch();
    void byCategory.refetch();
    void recent.refetch();
  };

  const net = summary.data?.net ?? 0;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between gap-3 pt-1'>
        <div className='flex min-w-0 flex-col'>
          <h1 className='flex items-center gap-1.5 truncate text-xl font-bold tracking-tight text-foreground'>
            Halo, {firstName(me.data?.name)}
            <Sparkles size={18} className='shrink-0 text-warning' aria-hidden='true' />
          </h1>
          <p className='truncate text-xs text-muted-foreground'>
            {summary.data
              ? net > 0
                ? `Arus kas bersih ${formatSignedRupiah(net)} bulan ini`
                : net < 0
                  ? `Pengeluaran lebih besar ${formatRupiah(Math.abs(net))} bulan ini`
                  : "Belum ada arus kas bulan ini"
              : "Keuanganmu terpantau rapi bulan ini"}
          </p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <div className='flex items-center gap-2 rounded-2xl bg-surface-container-low px-3.5 py-2.5 text-[11px] text-muted-foreground'>
        <CalendarDays size={14} className='shrink-0 text-primary' />
        <span>
          Menampilkan ringkasan <span className='font-semibold text-foreground'>{formatMonthLong(month)}</span>
        </span>
      </div>

      {error && (
        <ErrorState
          message={error instanceof Error ? error.message : "Sebagian data gagal dimuat."}
          onRetry={retry}
        />
      )}

      <SaldoInfo
        total={balances.data?.total ?? 0}
        wallets={balances.data?.items ?? []}
        loading={balances.isLoading}
      />

      <Arus
        income={summary.data?.income ?? 0}
        expense={summary.data?.expense ?? 0}
        transactionCount={summary.data?.transactionCount}
        loading={summary.isLoading}
      />

      <TrendChart data={trend.data ?? []} loading={trend.isLoading} />

      <BudgetList data={budgetViews} loading={budgets.isLoading} />

      <RecentTransactions data={recentItems} loading={recent.isLoading} />
    </div>
  );
}

export default HomePage;
