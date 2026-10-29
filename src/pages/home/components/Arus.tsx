import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatRupiah } from "@/lib/format";

function Arus({
  income,
  expense,
  loading,
  transactionCount,
}: {
  income: number;
  expense: number;
  loading?: boolean;
  transactionCount?: number;
}) {
  return (
    <div className='flex flex-row justify-center gap-3'>
      <Card className='flex-1 gap-3 rounded-2xl border-0 bg-surface-container-lowest px-4 py-4 ring-1 ring-border/50'>
        <div className='flex items-center justify-between gap-2'>
          <span className='flex size-9 items-center justify-center rounded-full bg-income-soft text-income'>
            <ArrowDown size={20} />
          </span>
          <span className='truncate rounded-full bg-income-soft px-2 py-0.5 text-[10px] font-bold text-income'>
            Masuk
          </span>
        </div>
        <div className='flex min-w-0 flex-col'>
          <span className='text-xs text-muted-foreground'>Pemasukan</span>
          {loading ? (
            <Skeleton className='mt-1 h-5 w-24' />
          ) : (
            <span className='mt-0.5 truncate text-base font-bold text-income tabular-nums'>
              {formatRupiah(income)}
            </span>
          )}
        </div>
      </Card>

      <Card className='flex-1 gap-3 rounded-2xl border-0 bg-surface-container-lowest px-4 py-4 ring-1 ring-border/50'>
        <div className='flex items-center justify-between gap-2'>
          <span className='flex size-9 items-center justify-center rounded-full bg-expense-soft text-expense'>
            <ArrowUp size={20} />
          </span>
          <span className='truncate rounded-full bg-expense-soft px-2 py-0.5 text-[10px] font-bold text-expense'>
            {transactionCount ? `${transactionCount} transaksi` : "Keluar"}
          </span>
        </div>
        <div className='flex min-w-0 flex-col'>
          <span className='text-xs text-muted-foreground'>Pengeluaran</span>
          {loading ? (
            <Skeleton className='mt-1 h-5 w-24' />
          ) : (
            <span className='mt-0.5 truncate text-base font-bold text-expense tabular-nums'>
              {formatRupiah(expense)}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Arus;
