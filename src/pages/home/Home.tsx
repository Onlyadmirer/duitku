import SaldoInfo from "./components/SaldoInfo";
import Arus from "./components/Arus";
import { TrendChart } from "./components/TrendChart";

function home() {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between gap-3 pt-1'>
        <div className='flex min-w-0 flex-col'>
          <h1 className='truncate text-xl font-bold tracking-tight text-foreground'>
            Halo, Akmal 👋
          </h1>
          <p className='truncate text-xs text-muted-foreground'>
            Keuanganmu terpantau rapi bulan ini
          </p>
        </div>
        <button
          type='button'
          className='flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-colors hover:bg-surface-container active:scale-95'
        >
          <span className='size-1.5 rounded-full bg-primary' />
          Okt 2026
        </button>
      </div>

      <SaldoInfo />
      <Arus />
      <TrendChart />

      <div>
        <h2 className='text-base font-bold tracking-tight text-foreground'>
          Anggaran Bulan Ini
        </h2>
      </div>
    </div>
  );
}

export default home;
