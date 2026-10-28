import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

function Arus() {
  return (
    <div className='flex flex-row justify-center gap-3'>
      <Card className='flex-1 gap-2.5 rounded-2xl border-0 bg-surface-container-lowest px-4 py-4 ring-1 ring-border/50'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <span className='flex size-9 items-center justify-center rounded-full bg-secondary/10 text-secondary'>
              <ArrowDown size={18} />
            </span>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground'>Pemasukan</span>
              <span className='w-fit rounded-full bg-secondary/10 px-1.5 text-[10px] font-bold text-secondary'>
                +12%
              </span>
            </div>
          </div>
        </div>
        <span className='text-lg font-bold text-secondary tabular-nums'>
          Rp 8.500.000
        </span>
      </Card>

      <Card className='flex-1 gap-2.5 rounded-2xl border-0 bg-surface-container-lowest px-4 py-4 ring-1 ring-border/50'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <span className='flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
              <ArrowUp size={18} />
            </span>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground'>Pengeluaran</span>
              <span className='w-fit rounded-full bg-destructive/10 px-1.5 text-[10px] font-bold text-destructive'>
                -8%
              </span>
            </div>
          </div>
        </div>
        <span className='text-lg font-bold text-destructive tabular-nums'>
          Rp 3.120.000
        </span>
      </Card>
    </div>
  );
}

export default Arus;
