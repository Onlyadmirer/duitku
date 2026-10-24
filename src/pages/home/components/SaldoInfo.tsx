import { Card } from "@/components/ui/card";
import { Banknote, Eye, Landmark, Wallet } from "lucide-react";

function SaldoInfo() {
  return (
    <Card className='bg-background/20'>
      <div className='flex flex-row text-primary-foreground justify-between'>
        <p className='uppercase'>total saldo aktif</p>
        <Eye />
      </div>
      <p className='text-3xl text-primary-foreground font-semibold'>
        Rp 11.000.000
      </p>
      <hr />
      <div className='flex flex-row gap-2 overflow-x-auto scrollbar-hidden'>
        <Card className='bg-card/30 shrink-0 w-28 text-accent/90 p-3 gap-2 flex flex-col justify-center '>
          <div className='flex flex-row gap-1 items-center'>
            <Banknote size={18} />
            Tunai
          </div>
          <span className='truncate'>Rp 850.000</span>
        </Card>
        <Card className='bg-card/30 shrink-0 w-28 text-accent/90 p-3 flex gap-2 flex-col justify-center '>
          <div className='flex flex-row gap-1 items-center'>
            <Landmark size={18} />
            BCA
          </div>
          <span className='truncate'>Rp 9.250.000</span>
        </Card>
        <Card className='bg-card/30 shrink-0 w-28 text-accent/90 p-3 flex gap-2 flex-col justify-center '>
          <div className='flex flex-row gap-1 items-center'>
            <Wallet size={18} />
            GoPay
          </div>
          <span className='truncate'>Rp 1.500.000</span>
        </Card>
      </div>
    </Card>
  );
}

export default SaldoInfo;
