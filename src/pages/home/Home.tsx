import SaldoInfo from "./components/SaldoInfo";
import Arus from "./components/Arus";
import { TrendChart } from "./components/TrendChart";

function home() {
  return (
    <div className='flex flex-col h-999 gap-4'>
      <div>
        <h1 className='font-semibold text-accent font-sans text-2xl'>
          Halo, Akmal
        </h1>
        <p className='font-sans text-sm text-muted-foreground'>
          Keuanganmu terpantau rapi bulan ini
        </p>
      </div>
      <SaldoInfo />
      <Arus />
      <TrendChart />
    </div>
  );
}

export default home;
