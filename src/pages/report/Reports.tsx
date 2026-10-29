import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Scale, WalletCards } from "lucide-react";
import { MonthPicker } from "@/components/app/month-picker";
import {
  ErrorState,
  ListSkeleton,
  WalletIcon,
} from "@/components/app/common";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { TrendChart } from "@/pages/home/components/TrendChart";
import {
  useCategoryReport,
  useMonthlyTrend,
  useReportSummary,
  useWalletBalances,
} from "@/hooks/use-finance";
import {
  currentMonth,
  formatMonthLong,
  formatRupiah,
  monthYear,
} from "@/lib/format";
import { cn } from "@/lib/utils";

function ReportsPage() {
  const [month, setMonth] = useState(currentMonth);
  const year = monthYear(month);
  const summary = useReportSummary(month);
  const byCategory = useCategoryReport(month);
  const trend = useMonthlyTrend(year);
  const balances = useWalletBalances();

  const income = summary.data?.income ?? 0;
  const expense = summary.data?.expense ?? 0;
  const net = summary.data?.net ?? 0;
  const biggest = byCategory.data?.items[0];
  const error = summary.error ?? byCategory.error ?? trend.error ?? balances.error;

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex flex-col'>
          <h1 className='text-xl font-bold tracking-tight'>Laporan</h1>
          <p className='text-xs text-muted-foreground'>Ringkasan keuanganmu</p>
        </div>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      <div className='rounded-2xl bg-primary/5 px-4 py-3 text-[11px] text-muted-foreground ring-1 ring-primary/10'>
        Laporan periode{" "}
        <span className='font-semibold text-foreground'>{formatMonthLong(month)}</span>. Angka
        dihitung otomatis dari seluruh transaksi.
      </div>

      {error && (
        <ErrorState
          message='Sebagian laporan gagal dimuat.'
          onRetry={() => {
            void summary.refetch();
            void byCategory.refetch();
            void trend.refetch();
            void balances.refetch();
          }}
        />
      )}

      <section className='grid grid-cols-2 gap-3'>
        <ReportStat
          label='Pemasukan'
          value={formatRupiah(income)}
          tone='income'
          icon={ArrowDownLeft}
          loading={summary.isLoading}
        />
        <ReportStat
          label='Pengeluaran'
          value={formatRupiah(expense)}
          tone='expense'
          icon={ArrowUpRight}
          loading={summary.isLoading}
        />
        <ReportStat
          label='Arus kas bersih'
          value={formatRupiah(net)}
          tone={net >= 0 ? "income" : "expense"}
          icon={Scale}
          loading={summary.isLoading}
          wide
        />
        <div className='col-span-2 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'>
          <div className='flex items-center justify-between gap-3'>
            <span className='text-xs text-muted-foreground'>Rasio pengeluaran</span>
            <span className='text-xs font-bold tabular-nums'>
              {income > 0 ? Math.round((expense / income) * 1000) / 10 : 0}%
            </span>
          </div>
          <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-container-high'>
            <div
              className={cn(
                "h-full rounded-full",
                expense > income ? "bg-expense" : "bg-secondary",
              )}
              style={{
                width: `${Math.min(100, income > 0 ? (expense / income) * 100 : 0)}%`,
              }}
            />
          </div>
          <p className='mt-2 text-[10px] text-muted-foreground'>
            {biggest
              ? `Pengeluaran terbesar: ${biggest.name} (${formatRupiah(biggest.total)}).`
              : "Belum ada pengeluaran pada periode ini."}
          </p>
        </div>
      </section>

      <section className='flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'>
        <div className='flex items-center justify-between'>
          <h2 className='text-base font-bold tracking-tight'>Pengeluaran per Kategori</h2>
          <span className='text-[10px] font-semibold text-muted-foreground'>
            {formatMonthLong(month)}
          </span>
        </div>
        {byCategory.isLoading ? (
          <div className='h-48 animate-pulse rounded-xl bg-surface-container' />
        ) : (
          <CategoryDonut
            items={byCategory.data?.items ?? []}
            total={byCategory.data?.total ?? 0}
          />
        )}
      </section>

      <TrendChart data={trend.data ?? []} loading={trend.isLoading} />

      <section className='flex flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-bold tracking-tight'>Saldo Dompet</h2>
          <WalletCards size={15} className='text-muted-foreground' />
        </div>
        {balances.isLoading ? (
          <ListSkeleton rows={3} />
        ) : (balances.data?.items ?? []).length === 0 ? (
          <p className='rounded-2xl bg-surface-container-lowest p-4 text-xs text-muted-foreground ring-1 ring-border/50'>
            Belum ada dompet.
          </p>
        ) : (
          <div className='overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
            <div className='divide-y divide-border/40'>
              {(balances.data?.items ?? []).map((wallet) => (
                <div
                  key={wallet.walletId}
                  className='flex items-center justify-between gap-3 px-4 py-3.5'
                >
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <WalletIcon name={wallet.name} size='sm' />
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-semibold'>{wallet.name}</span>
                      <span className='text-[10px] text-muted-foreground tabular-nums'>
                        Saldo awal {formatRupiah(wallet.initialBalance)}
                      </span>
                    </div>
                  </div>
                  <span className='shrink-0 text-sm font-bold tabular-nums'>
                    {formatRupiah(wallet.balance)}
                  </span>
                </div>
              ))}
            </div>
            <div className='flex items-center justify-between border-t border-border/50 bg-surface-container-low px-4 py-3'>
              <span className='text-xs font-semibold'>Total saldo</span>
              <span className='text-sm font-bold text-primary tabular-nums'>
                {formatRupiah(balances.data?.total ?? 0)}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ReportStat({
  label,
  value,
  tone,
  icon: Icon,
  loading,
  wide,
}: {
  label: string;
  value: string;
  tone: "income" | "expense";
  icon: typeof ArrowDownLeft;
  loading?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50",
        wide && "col-span-2",
      )}
    >
      <div className='flex items-center justify-between'>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full",
            tone === "income" ? "bg-income-soft text-income" : "bg-expense-soft text-expense",
          )}
        >
          <Icon size={16} />
        </span>
        <span className='text-[10px] font-bold tracking-wide text-muted-foreground uppercase'>
          {label}
        </span>
      </div>
      {loading ? (
        <div className='h-5 w-24 animate-pulse rounded bg-surface-container' />
      ) : (
        <span
          className={cn(
            "truncate text-base font-bold tabular-nums",
            tone === "income" ? "text-income" : "text-expense",
          )}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default ReportsPage;
