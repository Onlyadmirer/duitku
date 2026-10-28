import { formatRupiah } from "@/lib/format";

// Bentuknya sama persis dengan item dari GET /reports/monthly-trend
export type TrendPoint = {
  month: string; // "2026-10"
  income: number;
  expense: number;
  net: number;
};

// Data contoh (hard-coded). Nanti ganti dengan data dari API lewat props.
const SAMPLE_DATA: TrendPoint[] = [
  { month: "2026-01", income: 8500000, expense: 5120000, net: 3380000 },
  { month: "2026-02", income: 8500000, expense: 4890000, net: 3610000 },
  { month: "2026-03", income: 9700000, expense: 5340000, net: 4360000 },
  { month: "2026-04", income: 8500000, expense: 6010000, net: 2490000 },
  { month: "2026-05", income: 8500000, expense: 4760000, net: 3740000 },
  { month: "2026-06", income: 8500000, expense: 5230000, net: 3270000 },
  { month: "2026-07", income: 10500000, expense: 5480000, net: 5020000 },
  { month: "2026-08", income: 8500000, expense: 4950000, net: 3550000 },
  { month: "2026-09", income: 8500000, expense: 5670000, net: 2830000 },
  { month: "2026-10", income: 8500000, expense: 3120000, net: 5380000 },
  { month: "2026-11", income: 0, expense: 0, net: 0 },
  { month: "2026-12", income: 0, expense: 0, net: 0 },
];

const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// "2026-10" -> "Okt"
const labelBulan = (month: string) =>
  BULAN[Number(month.slice(5, 7)) - 1] ?? month;

// "2026-10" -> "Okt 2026"
const labelPeriode = (month: string) =>
  `${labelBulan(month)} ${month.slice(0, 4)}`;

const bulanSekarang = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const tinggiBar = (value: number, max: number) => {
  if (value <= 0) return 0;
  return Math.max(4, Math.round((value / max) * 100));
};

export function TrendChart({ data = SAMPLE_DATA }: { data?: TrendPoint[] }) {
  if (data.length === 0) return null;

  const max = Math.max(
    1,
    ...data.flatMap((point) => [point.income, point.expense]),
  );
  const aktif = bulanSekarang();
  const periode = `${labelPeriode(data[0].month)} - ${labelPeriode(
    data[data.length - 1].month,
  )}`;

  return (
    <section className='rounded-2xl border border-border/50 bg-surface-container-lowest p-4 shadow-xs'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex flex-col'>
          <h2 className='text-base font-bold tracking-tight text-foreground'>
            Tren 12 Bulan
          </h2>
          <span className='text-[11px] text-muted-foreground'>
            Periode {periode}
          </span>
        </div>
        <div className='flex shrink-0 items-center gap-2.5 text-[10px] font-semibold text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <span className='size-2.5 rounded-full bg-secondary' />
            Masuk
          </span>
          <span className='flex items-center gap-1'>
            <span className='size-2.5 rounded-full bg-destructive' />
            Keluar
          </span>
        </div>
      </div>

      <div className='mt-4 flex h-32 items-end justify-between gap-1'>
        {data.map((point) => {
          const isActive = point.month === aktif;
          const tooltip = `${labelPeriode(point.month)} — Masuk ${formatRupiah(
            point.income,
          )}, Keluar ${formatRupiah(point.expense)}`;

          return (
            <div
              key={point.month}
              title={tooltip}
              aria-label={tooltip}
              className={
                isActive
                  ? 'flex h-full flex-1 flex-col items-center justify-end rounded-xl bg-surface-container/70 px-0.5 py-1'
                  : 'flex h-full flex-1 flex-col items-center justify-end'
              }
            >
              {isActive && (
                <span className='mb-1 text-[10px] leading-none font-bold text-primary'>
                  Kini
                </span>
              )}

              <div
                className={
                  isActive
                    ? 'flex h-20 w-full items-end justify-center gap-1'
                    : 'flex h-24 w-full items-end justify-center gap-0.5'
                }
              >
                <div
                  className={
                    isActive
                      ? 'w-2 rounded-t-sm bg-secondary shadow-sm'
                      : 'w-1.5 rounded-t-sm bg-secondary/75'
                  }
                  style={{ height: `${tinggiBar(point.income, max)}%` }}
                />
                <div
                  className={
                    isActive
                      ? 'w-2 rounded-t-sm bg-destructive shadow-sm'
                      : 'w-1.5 rounded-t-sm bg-destructive/75'
                  }
                  style={{ height: `${tinggiBar(point.expense, max)}%` }}
                />
              </div>

              <span
                className={
                  isActive
                    ? 'mt-1.5 text-[10px] leading-none font-bold text-primary'
                    : 'mt-2 text-[10px] leading-none text-muted-foreground'
                }
              >
                {labelBulan(point.month)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Contoh pemakaian di halaman: <TrendChart />
export default TrendChart;
