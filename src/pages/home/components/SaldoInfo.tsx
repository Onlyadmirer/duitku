import { Card } from "@/components/ui/card";
import { Banknote, Eye, Landmark, Wallet } from "lucide-react";

const wallets = [
  { icon: Banknote, name: "Tunai", amount: "Rp 850.000" },
  { icon: Landmark, name: "BCA", amount: "Rp 9.250.000" },
  { icon: Wallet, name: "GoPay", amount: "Rp 1.500.000" },
];

function SaldoInfo() {
  return (
    <Card className='relative gap-4 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-primary via-primary to-primary-container px-5 py-5 text-primary-foreground ring-0 shadow-[0_12px_28px_-6px_rgba(79,70,229,0.35)]'>
      <div className='pointer-events-none absolute -top-8 -right-8 size-40 rounded-full bg-primary-foreground/15 blur-2xl' />
      <div className='pointer-events-none absolute -bottom-10 -left-10 size-36 rounded-full bg-secondary/20 blur-xl' />

      <div className='relative z-10 flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <span className='text-[10px] font-bold tracking-widest text-primary-foreground/80 uppercase'>
            Total Saldo Aktif
          </span>
          <button
            type='button'
            aria-label='Tampilkan saldo'
            className='flex size-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20'
          >
            <Eye size={18} />
          </button>
        </div>

        <p className='text-[28px] leading-9 font-bold tracking-tight tabular-nums'>
          Rp 11.600.000
        </p>

        <div className='grid grid-cols-3 gap-2 border-t border-primary-foreground/15 pt-3.5'>
          {wallets.map(({ icon: Icon, name, amount }) => (
            <div
              key={name}
              className='flex min-w-0 flex-col gap-0.5 rounded-xl bg-primary-foreground/10 p-2.5 backdrop-blur-sm'
            >
              <div className='flex items-center gap-1 text-primary-foreground/80'>
                <Icon size={14} className='shrink-0' />
                <span className='truncate text-[10px] font-bold tracking-wide'>
                  {name}
                </span>
              </div>
              <span className='truncate text-xs font-semibold tabular-nums'>
                {amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default SaldoInfo;
