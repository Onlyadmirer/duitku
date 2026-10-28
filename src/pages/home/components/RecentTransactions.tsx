import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Coffee,
  Fuel,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { formatSignedRupiah } from "@/lib/format";

type Transaction = {
  id: string;
  name: string;
  meta: string;
  amount: number;
  icon: LucideIcon;
};

// Data contoh. Nanti ganti dengan data dari API lewat props.
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "gaji",
    name: "Gaji PT Maju Bersama",
    meta: "Transfer BCA • 21 Okt 2026",
    amount: 8500000,
    icon: Banknote,
  },
  {
    id: "supermarket",
    name: "Supermarket Grand Lucky",
    meta: "Belanja • 21 Okt 2026",
    amount: -540000,
    icon: ShoppingCart,
  },
  {
    id: "kopi",
    name: "Kopi Janji Jiwa Senopati",
    meta: "Makan & Minum • 20 Okt 2026",
    amount: -35000,
    icon: Coffee,
  },
  {
    id: "pln",
    name: "Token Listrik PLN",
    meta: "Tagihan • 19 Okt 2026",
    amount: -250000,
    icon: Zap,
  },
  {
    id: "bensin",
    name: "Isi Bensin Shell",
    meta: "Transportasi • 18 Okt 2026",
    amount: -180000,
    icon: Fuel,
  },
];

function RecentTransactions({
  data = SAMPLE_TRANSACTIONS,
}: {
  data?: Transaction[];
}) {
  return (
    <section className='flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-base font-bold tracking-tight text-foreground'>
          Transaksi Terbaru
        </h2>
        <button
          type='button'
          className='text-xs font-semibold text-primary hover:underline'
        >
          Lihat Semua
        </button>
      </div>

      <div className='overflow-hidden rounded-2xl bg-surface-container-lowest ring-1 ring-border/50'>
        <div className='divide-y divide-border/40'>
          {data.map((transaction) => {
            const isIncome = transaction.amount >= 0;
            const Icon = transaction.icon;

            return (
              <div
                key={transaction.id}
                className='flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-surface-container-low'
              >
                <div className='flex min-w-0 items-center gap-3'>
                  <span
                    className={
                      isIncome
                        ? 'flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary'
                        : 'flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive'
                    }
                  >
                    <Icon size={20} />
                  </span>
                  <div className='flex min-w-0 flex-col'>
                    <span className='truncate text-sm font-semibold text-foreground'>
                      {transaction.name}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {transaction.meta}
                    </span>
                  </div>
                </div>

                <span
                  className={
                    isIncome
                      ? 'ml-2 shrink-0 text-sm font-bold whitespace-nowrap text-secondary tabular-nums'
                      : 'ml-2 shrink-0 text-sm font-bold whitespace-nowrap text-destructive tabular-nums'
                  }
                >
                  {formatSignedRupiah(transaction.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default RecentTransactions;
export type { Transaction };
