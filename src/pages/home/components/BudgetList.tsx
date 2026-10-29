import { Link, useNavigate } from "@tanstack/react-router";
import { ChartPie, X } from "lucide-react";
import { EmptyState, SectionHeader } from "@/components/app/common";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah, percentage } from "@/lib/format";
import { statusTone } from "@/lib/maps";
import { cn } from "@/lib/utils";

export type BudgetView = {
  id: string;
  categoryId: string;
  name: string;
  color: string;
  spent: number;
  limit: number;
};

function BudgetList({
  data,
  loading,
}: {
  data: BudgetView[];
  loading?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <section className='flex flex-col gap-3'>
      <SectionHeader
        title='Anggaran Bulan Ini'
        actionLabel='Lihat Semua'
        actionTo='/anggaran'
      />

      {loading ? (
        <div className='flex flex-col gap-2.5'>
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className='flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'
            >
              <div className='flex items-center gap-3'>
                <Skeleton className='size-9 rounded-full' />
                <div className='flex flex-1 flex-col gap-2'>
                  <Skeleton className='h-3 w-1/2' />
                  <Skeleton className='h-2.5 w-2/3' />
                </div>
              </div>
              <Skeleton className='h-2 w-full rounded-full' />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={ChartPie}
          title='Belum ada anggaran'
          description='Atur batas pengeluaran per kategori supaya keuanganmu lebih terkendali.'
          actionLabel='Atur anggaran'
          onAction={() => {
            navigate({ to: "/anggaran" });
          }}
        />
      ) : (
        <div className='flex flex-col gap-2.5'>
          {data.map((budget) => {
            const ratio = budget.limit > 0 ? budget.spent / budget.limit : 0;
            const status = statusTone(ratio);
            const width = Math.min(100, percentage(budget.spent, budget.limit));
            return (
              <Link
                key={budget.id}
                to='/anggaran'
                className='flex flex-col gap-2.5 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50 transition-colors hover:bg-surface-container-low/50'
              >
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <span
                      className='flex size-9 shrink-0 items-center justify-center rounded-full'
                      style={{ backgroundColor: `${budget.color}18`, color: budget.color }}
                    >
                      <span className='size-2 rounded-full bg-current' />
                    </span>
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-semibold text-foreground'>
                        {budget.name}
                      </span>
                      <span className='truncate text-xs text-muted-foreground tabular-nums'>
                        {formatRupiah(budget.spent)} / {formatRupiah(budget.limit)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold",
                      status.bg,
                      status.text,
                    )}
                  >
                    {ratio >= 1 ? (
                      <X size={12} />
                    ) : (
                      <span className='size-1.5 rounded-full bg-current' />
                    )}
                    {status.label}
                  </span>
                </div>

                <div className='h-2 w-full overflow-hidden rounded-full bg-surface-container-high'>
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", status.bar)}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default BudgetList;
