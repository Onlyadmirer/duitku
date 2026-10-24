import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

function Arus() {
  return (
    <div className='flex flex-row justify-center gap-4'>
      <Card className='px-4 flex-1 flex flex-col gap-2 justify-center bg-background/10'>
        <div className='flex flex-row gap-1 justify-between'>
          <div className='flex flex-row gap-2'>
            <ArrowUp size={34} className='p-2 rounded-full bg-green-400' />
            <div className='flex flex-col'>
              <span className='text-accent/80'>Pemasukan</span>
              <span className='text-green-500 text-xs'>+12%</span>
            </div>
          </div>
        </div>
        <span className='text-lg font-semibold text-green-500'>Rp 850.000</span>
      </Card>
      <Card className='px-4 flex-1 bg-background/10 flex flex-col gap-2 justify-center'>
        <div className='flex flex-row gap-1 justify-between'>
          <div className='flex flex-row gap-2'>
            <ArrowDown size={34} className='p-2 rounded-full bg-red-400' />
            <div className='flex flex-col'>
              <span className='text-accent/80'>Pengeluaran</span>
              <span className='text-red-500 text-xs'>+12%</span>
            </div>
          </div>
        </div>
        <span className='text-lg font-semibold text-green-500'>
          Rp 9.500.000
        </span>
      </Card>
    </div>
  );
}

export default Arus;
