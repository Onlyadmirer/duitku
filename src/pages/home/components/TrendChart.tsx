import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

// 1500000 -> "Rp 1.500.000"
const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

// 8500000 -> "8,5 jt" (untuk sumbu Y supaya tidak memakan lebar)
const singkat = (n: number) =>
  new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n);

const COLOR_INCOME = "var(--chart-2)";
const COLOR_EXPENSE = "var(--chart-3)";

type TooltipProps = {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number; color?: string }[];
};

function ChartTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className='rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md'>
      <p className='mb-1 font-medium'>{label ? labelBulan(label) : ""}</p>
      {payload.map((p) => (
        <p key={p.name} className='flex items-center gap-2'>
          <span
            className='inline-block size-2 rounded-full'
            style={{ backgroundColor: p.color }}
          />
          <span className='text-muted-foreground'>{p.name}</span>
          <span className='ml-auto pl-4 font-medium tabular-nums'>
            {rupiah(p.value ?? 0)}
          </span>
        </p>
      ))}
    </div>
  );
}

export function TrendChart({ data = SAMPLE_DATA }: { data?: TrendPoint[] }) {
  return (
    <section className='rounded-2xl border border-border/60 bg-surface-container-lowest p-4'>
      <h2 className='mb-3 text-base font-bold tracking-tight text-foreground'>
        Tren 12 bulan
      </h2>

      {/* Di layar sempit, grafik digeser horizontal, bukan dipadatkan */}
      <div className='overflow-x-auto scrollbar-hidden'>
        <div className='min-w-[520px]' style={{ height: 260 }}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              barGap={2}
            >
              <CartesianGrid
                vertical={false}
                stroke='var(--border)'
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey='month'
                tickFormatter={labelBulan}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
              />
              <YAxis
                tickFormatter={singkat}
                width={44}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "var(--foreground)", fillOpacity: 0.05 }}
              />
              <Legend
                iconType='circle'
                iconSize={8}
                wrapperStyle={{
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                }}
              />
              <Bar
                dataKey='income'
                name='Pemasukan'
                fill={COLOR_INCOME}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
              <Bar
                dataKey='expense'
                name='Pengeluaran'
                fill={COLOR_EXPENSE}
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// Contoh pemakaian di halaman: <TrendChart />
export default TrendChart;
