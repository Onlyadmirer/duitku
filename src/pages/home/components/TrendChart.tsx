import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/app/common";
import {
  formatMonth,
  formatMonthShort,
  formatRupiah,
} from "@/lib/format";
import type { TrendPoint } from "@/types/api";

export type { TrendPoint };

export function TrendChart({
  data,
  loading,
}: {
  data: TrendPoint[];
  loading?: boolean;
}) {
  const hasData = data.some((point) => point.income > 0 || point.expense > 0);

  return (
    <section className='rounded-2xl border border-border/50 bg-surface-container-lowest p-4 shadow-xs'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex flex-col'>
          <h2 className='text-base font-bold tracking-tight text-foreground'>
            Tren 12 Bulan
          </h2>
          <span className='text-[11px] text-muted-foreground'>
            {data.length > 0
              ? `${formatMonth(data[0].month)} - ${formatMonth(data[data.length - 1].month)}`
              : "Belum ada periode"}
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

      {loading ? (
        <div className='mt-4 h-40 animate-pulse rounded-xl bg-surface-container' />
      ) : hasData ? (
        <>
          <div className='mt-4 h-40 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid
                  vertical={false}
                  stroke='var(--border)'
                  strokeDasharray='3 3'
                  opacity={0.6}
                />
                <XAxis
                  dataKey='month'
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  tickFormatter={(value: string) => formatMonthShort(value)}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-container)", opacity: 0.6 }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 11,
                    color: "var(--popover-foreground)",
                    boxShadow: "0 8px 24px -12px rgba(15,23,42,.25)",
                  }}
                  labelFormatter={(label) => formatMonth(String(label))}
                  formatter={(value, name) => [
                    formatRupiah(Number(value)),
                    name === "income" ? "Masuk" : "Keluar",
                  ]}
                />
                <Bar
                  dataKey='income'
                  name='income'
                  fill='var(--secondary)'
                  radius={[4, 4, 0, 0]}
                  maxBarSize={9}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey='expense'
                  name='expense'
                  fill='var(--destructive)'
                  radius={[4, 4, 0, 0]}
                  maxBarSize={9}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <details className='mt-3 border-t border-border/40 pt-2 text-[11px] text-muted-foreground'>
            <summary className='cursor-pointer font-semibold text-primary'>
              Lihat data tren
            </summary>
            <div className='mt-2 overflow-x-auto'>
              <table className='w-full border-collapse text-left'>
                <caption className='sr-only'>
                  Data pemasukan dan pengeluaran 12 bulan
                </caption>
                <thead>
                  <tr className='border-b border-border/50'>
                    <th scope='col' className='py-1.5 pr-2 font-semibold'>Bulan</th>
                    <th scope='col' className='py-1.5 pr-2 text-right font-semibold'>Masuk</th>
                    <th scope='col' className='py-1.5 text-right font-semibold'>Keluar</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((point) => (
                    <tr key={point.month} className='border-b border-border/30 last:border-0'>
                      <td className='py-1.5 pr-2'>{formatMonth(point.month)}</td>
                      <td className='py-1.5 pr-2 text-right tabular-nums'>
                        {formatRupiah(point.income)}
                      </td>
                      <td className='py-1.5 text-right tabular-nums'>
                        {formatRupiah(point.expense)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <div className='mt-4'>
          <EmptyState
            icon={BarChart3}
            title='Belum ada data tren'
            description='Catat transaksi pertamamu untuk melihat grafik pemasukan dan pengeluaran.'
          />
        </div>
      )}
    </section>
  );
}

export default TrendChart;
