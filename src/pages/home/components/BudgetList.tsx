import type { LucideIcon } from "lucide-react";
import {
  Car,
  Receipt,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { formatRupiah } from "@/lib/format";

type Budget = {
  id: string;
  name: string;
  icon: LucideIcon;
  spent: number;
  limit: number;
};

// Data contoh. Nanti ganti dengan data dari API lewat props.
const SAMPLE_BUDGETS: Budget[] = [
  {
    id: "makan",
    name: "Makan & Minum",
    icon: UtensilsCrossed,
    spent: 1580000,
    limit: 1500000,
  },
  {
    id: "transportasi",
    name: "Transportasi & Bensin",
    icon: Car,
    spent: 1420000,
    limit: 1500000,
  },
  {
    id: "belanja",
    name: "Belanja Bulanan",
    icon: ShoppingBag,
    spent: 950000,
    limit: 2000000,
  },
  {
    id: "tagihan",
    name: "Tagihan & Utilitas",
    icon: Receipt,
    spent: 650000,
    limit: 1200000,
  },
];

type StatusAnggaran = {
  label: string;
  pill: string;
  bar: string;
  icon: LucideIcon | null;
};

const statusAnggaran = (rasio: number): StatusAnggaran => {
  if (rasio >= 1) {
    return {
      label: "Melebihi",
      pill: "bg-destructive/10 text-destructive",
      bar: "bg-destructive",
      icon: X,
    };
  }

  if (rasio >= 0.85) {
    return {
      label: "Hampir habis",
      pill: "bg-warning/10 text-warning",
      bar: "bg-warning",
      icon: null,
    };
  }

  return {
    label: "Aman",
    pill: "bg-secondary/10 text-secondary",
    bar: "bg-secondary",
    icon: null,
  };
};

function BudgetList({ data = SAMPLE_BUDGETS }: { data?: Budget[] }) {
  return (
    <section className='flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h2 className='text-base font-bold tracking-tight text-foreground'>
            Anggaran Bulan Ini
          </h2>
          <span className='size-2 rounded-full bg-destructive' />
        </div>
        <button
          type='button'
          className='text-xs font-semibold text-primary hover:underline'
        >
          Lihat Semua
        </button>
      </div>

      <div className='flex flex-col gap-2.5'>
        {data.map((budget) => {
          const rasio = budget.limit > 0 ? budget.spent / budget.limit : 0;
          const status = statusAnggaran(rasio);
          const StatusIcon = status.icon;
          const lebar = Math.min(100, Math.round(rasio * 1000) / 10);
          const Icon = budget.icon;

          return (
            <div
              key={budget.id}
              className='flex flex-col gap-2.5 rounded-2xl bg-surface-container-lowest p-4 ring-1 ring-border/50'
            >
              <div className='flex items-center justify-between gap-2'>
                <div className='flex min-w-0 items-center gap-2.5'>
                  <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-foreground'>
                    <Icon size={18} />
                  </span>
                  <div className='flex min-w-0 flex-col'>
                    <span className='truncate text-sm font-semibold text-foreground'>
                      {budget.name}
                    </span>
                    <span className='truncate text-xs text-muted-foreground tabular-nums'>
                      {formatRupiah(budget.spent)} /{" "}
                      {formatRupiah(budget.limit)}
                    </span>
                  </div>
                </div>

                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.pill}`}
                >
                  {StatusIcon ? (
                    <StatusIcon size={12} />
                  ) : (
                    <span className='size-1.5 rounded-full bg-current' />
                  )}
                  {status.label}
                </span>
              </div>

              <div className='h-2 w-full overflow-hidden rounded-full bg-surface-container-high'>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                  style={{ width: `${lebar}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BudgetList;
export type { Budget };
