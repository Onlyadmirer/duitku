import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletIcon } from "@/components/app/common";
import { formatCompactRupiah, formatRupiah } from "@/lib/format";
import type { WalletBalance } from "@/types/api";

function SaldoInfo({
  total,
  wallets,
  loading,
}: {
  total: number;
  wallets: WalletBalance[];
  loading?: boolean;
}) {
  const [hidden, setHidden] = useState(false);

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
            onClick={() => setHidden((current) => !current)}
            aria-label={hidden ? "Tampilkan saldo" : "Sembunyikan saldo"}
            aria-pressed={hidden}
            className='flex size-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20'
          >
            {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {loading ? (
          <Skeleton className='h-9 w-48 bg-primary-foreground/20' />
        ) : (
          <p className='text-[28px] leading-9 font-bold tracking-tight tabular-nums'>
            {hidden ? "••••••••" : formatRupiah(total)}
          </p>
        )}

        <div className='border-t border-primary-foreground/15 pt-3.5'>
          {wallets.length === 0 && !loading ? (
            <p className='text-xs text-primary-foreground/80'>
              Belum ada dompet. Tambahkan dompet pertamamu di menu Lainnya.
            </p>
          ) : (
            <div className='scrollbar-hidden flex gap-2 overflow-x-auto pb-0.5'>
              {(loading ? Array.from({ length: 3 }, () => null) : wallets).map(
                (wallet, index) => (
                  <div
                    key={wallet?.walletId ?? index}
                    className='flex min-w-[96px] flex-1 flex-col gap-0.5 rounded-xl bg-primary-foreground/10 p-2.5 backdrop-blur-sm'
                  >
                    {wallet ? (
                      <>
                        <div className='flex items-center gap-1 text-primary-foreground/80'>
                          <WalletIcon
                            name={wallet.name}
                            size='sm'
                            className='size-4 bg-transparent text-primary-foreground/80'
                          />
                          <span className='truncate text-[10px] font-bold tracking-wide'>
                            {wallet.name}
                          </span>
                        </div>
                        <span className='truncate text-[11px] font-semibold tabular-nums'>
                          {hidden ? "••••••" : formatCompactRupiah(wallet.balance)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Skeleton className='h-2.5 w-14 bg-primary-foreground/20' />
                        <Skeleton className='mt-1 h-3 w-20 bg-primary-foreground/20' />
                      </>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default SaldoInfo;
