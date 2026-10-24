import { Link } from "@tanstack/react-router";
import { ChartPie, House, LayoutGrid, Plus, ReceiptText } from "lucide-react";

function Mobile() {
  return (
    <div className='flex-row rounded-2xl flex fixed bottom-0 w-full bg-neutral-300 text-xs py-4 justify-between '>
      <Link to='/' className='flex flex-col justify-center flex-1 items-center'>
        <House size={24} />
        Beranda
      </Link>
      <Link
        to='/transaksi'
        className='flex flex-1 flex-col justify-center items-center'
      >
        <ReceiptText size={24} />
        Transaksi
      </Link>
      <div className='flex-1' />
      <Link
        to='/tambah-transaksi'
        className='flex flex-col flex-1 bg-foreground rounded-full w-16
         h-16 text-accent left-1/2 -translate-1/2 justify-center items-center absolute text-3xl'
      >
        <Plus size={24} />
      </Link>
      <Link
        to='/anggaran'
        className='flex flex-col flex-1 justify-center items-center'
      >
        <ChartPie size={24} />
        Anggaran
      </Link>
      <Link
        to='/lainnya'
        className='flex flex-1 flex-col justify-center items-center'
      >
        <LayoutGrid size={24} />
        Lainnya
      </Link>
    </div>
  );
}

export default Mobile;
