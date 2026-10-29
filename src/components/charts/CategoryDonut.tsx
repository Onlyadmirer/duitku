import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { EmptyState } from "@/components/app/common";
import { formatRupiah, percentage } from "@/lib/format";
import type { CategoryReportItem } from "@/types/api";

export function CategoryDonut({
  items,
  total,
}: {
  items: CategoryReportItem[];
  total: number;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={PieIcon}
        title='Belum ada pengeluaran'
        description='Pengeluaran per kategori akan tampil di sini setelah kamu mencatat transaksi.'
      />
    );
  }

  return (
    <>
      <div className='relative h-48 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={items}
              dataKey='total'
              nameKey='name'
              innerRadius={62}
              outerRadius={84}
              paddingAngle={2}
              stroke='none'
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {items.map((item) => (
                <Cell key={item.categoryId} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 11,
                color: "var(--popover-foreground)",
              }}
              formatter={(value) => formatRupiah(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-[10px] font-semibold tracking-wide text-muted-foreground uppercase'>
            Total
          </span>
          <span className='max-w-[120px] truncate text-sm font-bold tabular-nums'>
            {formatRupiah(total)}
          </span>
          <span className='text-[10px] text-muted-foreground'>{items.length} kategori</span>
        </div>
      </div>

      <div className='flex flex-col gap-2'>
        {items.map((item) => (
          <div key={item.categoryId} className='flex items-center gap-2.5'>
            <span
              className='size-2.5 shrink-0 rounded-full'
              style={{ backgroundColor: item.color }}
            />
            <span className='min-w-0 flex-1 truncate text-xs font-medium'>{item.name}</span>
            <span className='shrink-0 text-[10px] text-muted-foreground tabular-nums'>
              {percentage(item.total, total)}%
            </span>
            <span className='w-24 shrink-0 text-right text-xs font-semibold tabular-nums'>
              {formatRupiah(item.total)}
            </span>
          </div>
        ))}
      </div>

      <details className='border-t border-border/40 pt-2 text-[11px] text-muted-foreground'>
        <summary className='cursor-pointer font-semibold text-primary'>
          Lihat tabel kategori
        </summary>
        <table className='mt-2 w-full border-collapse text-left'>
          <caption className='sr-only'>Pengeluaran per kategori</caption>
          <thead>
            <tr className='border-b border-border/50'>
              <th scope='col' className='py-1.5 pr-2 font-semibold'>Kategori</th>
              <th scope='col' className='py-1.5 pr-2 text-right font-semibold'>Total</th>
              <th scope='col' className='py-1.5 text-right font-semibold'>Porsi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.categoryId} className='border-b border-border/30 last:border-0'>
                <td className='py-1.5 pr-2'>{item.name}</td>
                <td className='py-1.5 pr-2 text-right tabular-nums'>
                  {formatRupiah(item.total)}
                </td>
                <td className='py-1.5 text-right tabular-nums'>
                  {percentage(item.total, total)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}
