import { Link } from "@tanstack/react-router";

function Mobile() {
  return (
    <div className='flex-col sticky bg-amber-400 justify-between'>
      <Link to='/'>Beranda</Link>
      <Link to='/transaksi'>Transaksi</Link>
      <Link to='/tambah-transaksi'>+</Link>
      <Link to='/anggaran'>Anggaran</Link>
      <Link to='/lainnya'>Lainnya</Link>
    </div>
  );
}

export default Mobile;
