import { ReceiptText } from "lucide-react";
import {
  CategoryIcon,
  EmptyState,
  SectionHeader,
} from "@/components/app/common";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatSignedRupiah } from "@/lib/format";
import type { Transaction } from "@/types/api";

function RecentTransactions({
  data,
  loading,
}: {
  data: Transaction[];
  loading?: boolean;
}) {
  return (
    <section className='flex flex-col gap-3'>
      <SectionHeader
        title='Transaksi Terbaru'
        actionLabel='Lihat Semua'
        actionTo='/transaksi'
      />

      {loading ? (
        <div className='overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
          <div className='divide-y divide-border/40'>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className='flex items-center gap-3 px-4 py-3.5'>
                <Skeleton className='size-10 rounded-full' />
                <div className='flex flex-1 flex-col gap-2'>
                  <Skeleton className='h-3 w-2/3' />
                  <Skeleton className='h-2.5 w-1/3' />
                </div>
                <Skeleton className='h-3 w-20' />
              </div>
            ))}
          </div>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title='Belum ada transaksi'
          description='Transaksi yang kamu catat akan muncul di sini.'
        />
      ) : (
        <div className='overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
          <div className='divide-y divide-border/40'>
            {data.map((transaction) => {
              const isIncome = transaction.type === "income";
              const amount = isIncome ? transaction.amount : -transaction.amount;
              return (
                <div
                  key={transaction.id}
                  className='flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-surface-container-low'
                >
                  <div className='flex min-w-0 items-center gap-3'>
                    <CategoryIcon
                      name={transaction.category?.name}
                      color={transaction.category?.color}
                    />
                    <div className='flex min-w-0 flex-col'>
                      <span className='truncate text-sm font-semibold text-foreground'>
                        {transaction.note || transaction.category?.name || "Transaksi"}
                      </span>
                      <span className='truncate text-xs text-muted-foreground'>
                        {[transaction.category?.name, transaction.wallet?.name, formatDate(transaction.date)]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    </div>
                  </div>

                  <span
                    className={
                      isIncome
                        ? 'ml-2 shrink-0 text-sm font-bold whitespace-nowrap text-income tabular-nums'
                        : 'ml-2 shrink-0 text-sm font-bold whitespace-nowrap text-expense tabular-nums'
                    }
                  >
                    {formatSignedRupiah(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default RecentTransactions;
