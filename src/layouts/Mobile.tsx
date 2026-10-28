import { Link } from "@tanstack/react-router";
import { ChartPie, House, LayoutGrid, Plus, ReceiptText } from "lucide-react";

const itemClass =
  "flex flex-1 flex-col items-center justify-center gap-1 min-w-[54px] text-muted-foreground transition-colors hover:text-primary";
const activeClass = "text-primary font-semibold";

function Mobile() {
  return (
    <nav className='fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]'>
      <div className='mx-auto flex h-16 w-full max-w-[480px] items-center justify-around rounded-t-2xl border-t border-border/60 bg-surface-container-lowest/90 px-2 shadow-[0_-4px_20px_-2px_rgba(15,23,42,0.08)] backdrop-blur-xl'>
        <Link
          to='/'
          className={itemClass}
          activeProps={{ className: activeClass }}
          activeOptions={{ exact: true }}
        >
          <House size={24} />
          <span className='text-[10px] leading-tight'>Beranda</span>
        </Link>
        <Link
          to='/transaksi'
          className={itemClass}
          activeProps={{ className: activeClass }}
        >
          <ReceiptText size={24} />
          <span className='text-[10px] leading-tight'>Transaksi</span>
        </Link>
        <div className='relative -top-5 flex min-w-[54px] flex-1 items-center justify-center'>
          <Link
            to='/tambah-transaksi'
            aria-label='Catat Transaksi'
            className='flex size-14 items-center justify-center rounded-full bg-primary-container text-primary-foreground shadow-[0_10px_25px_-5px_rgba(79,70,229,0.45)] transition-transform active:scale-95'
          >
            <Plus size={28} />
          </Link>
        </div>
        <Link
          to='/anggaran'
          className={itemClass}
          activeProps={{ className: activeClass }}
        >
          <ChartPie size={24} />
          <span className='text-[10px] leading-tight'>Anggaran</span>
        </Link>
        <Link
          to='/lainnya'
          className={itemClass}
          activeProps={{ className: activeClass }}
        >
          <LayoutGrid size={24} />
          <span className='text-[10px] leading-tight'>Lainnya</span>
        </Link>
      </div>
    </nav>
  );
}

export default Mobile;
