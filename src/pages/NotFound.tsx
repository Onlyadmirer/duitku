import { Link } from "@tanstack/react-router";
import { Compass, Home } from "lucide-react";

function NotFoundPage() {
  return (
    <div className='flex min-h-[70dvh] flex-col items-center justify-center gap-5 px-6 text-center'>
      <span className='flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary'>
        <Compass size={30} />
      </span>
      <div className='flex flex-col gap-1.5'>
        <h1 className='text-xl font-bold tracking-tight'>Halaman tidak ditemukan</h1>
        <p className='max-w-xs text-xs leading-relaxed text-muted-foreground'>
          Tautan yang kamu buka mungkin sudah dipindahkan atau tidak pernah ada.
        </p>
      </div>
      <Link
        to='/'
        className='inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
      >
        <Home size={15} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export default NotFoundPage;
