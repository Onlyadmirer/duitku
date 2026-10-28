import { CalendarDays, ChevronDown } from "lucide-react";
import SaldoInfo from "./components/SaldoInfo";
import Arus from "./components/Arus";
import TrendChart from "./components/TrendChart";
import BudgetList from "./components/BudgetList";
import RecentTransactions from "./components/RecentTransactions";

function home() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between gap-3 pt-1'>
        <div className='flex min-w-0 flex-col'>
          <h1 className='flex items-center gap-1.5 truncate text-xl font-bold tracking-tight text-foreground'>
            Halo, Akmal
            <span className='text-lg select-none'>👋</span>
          </h1>
          <p className='truncate text-xs text-muted-foreground'>
            Keuanganmu terpantau rapi bulan ini
          </p>
        </div>

        <button
          type='button'
          className='flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all hover:bg-surface-container active:scale-95'
        >
          <CalendarDays size={14} className='text-primary' />
          Okt 2026
          <ChevronDown size={14} className='text-muted-foreground' />
        </button>
      </div>

      <SaldoInfo />
      <Arus />
      <TrendChart />
      <BudgetList />
      <RecentTransactions />
    </div>
  );
}

export default home;
