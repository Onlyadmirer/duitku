import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MONTHS_SHORT, formatMonth, monthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MonthPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (month: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => monthYear(value));
  const selectedYear = monthYear(value);
  const selectedMonth = Number(value.slice(5, 7));

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) setYear(monthYear(value));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type='button'
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-surface-container-high px-3 text-xs font-semibold text-foreground shadow-xs transition-all hover:bg-surface-container active:scale-95",
              className,
            )}
            aria-label='Pilih bulan'
          />
        }
      >
        <CalendarDays size={14} className='text-primary' />
        {formatMonth(value)}
        <ChevronDown size={14} className='text-muted-foreground' />
      </DialogTrigger>
      <DialogContent className='max-w-xs gap-5'>
        <DialogHeader>
          <DialogTitle className='text-base font-bold'>Pilih Bulan</DialogTitle>
          <DialogDescription>
            Pilih periode untuk melihat ringkasan keuangan.
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center justify-between'>
          <button
            type='button'
            onClick={() => setYear((current) => current - 1)}
            className='flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container'
            aria-label='Tahun sebelumnya'
          >
            <ChevronLeft size={18} />
          </button>
          <span className='text-sm font-bold tabular-nums'>{year}</span>
          <button
            type='button'
            onClick={() => setYear((current) => current + 1)}
            className='flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container'
            aria-label='Tahun berikutnya'
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          {MONTHS_SHORT.map((month, index) => {
            const monthValue = `${year}-${String(index + 1).padStart(2, "0")}`;
            const active = year === selectedYear && index + 1 === selectedMonth;
            return (
              <button
                key={month}
                type='button'
                onClick={() => {
                  onChange(monthValue);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-xl py-2.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface-container-low text-foreground hover:bg-surface-container",
                )}
                aria-pressed={active}
              >
                {month}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
