import { Outlet } from "@tanstack/react-router";

function AuthLayout() {
  return (
    <div className='relative flex min-h-dvh flex-col overflow-hidden bg-background'>
      <div className='pointer-events-none absolute -top-28 -left-24 size-72 rounded-full bg-primary/15 blur-3xl' />
      <div className='pointer-events-none absolute top-24 -right-24 size-72 rounded-full bg-secondary/10 blur-3xl' />

      <main className='relative z-10 mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 pt-8 pb-10'>
        <div className='mb-8 flex items-center gap-3'>
          <img
            src='/image.png'
            alt='Logo Duitku'
            className='size-11 rounded-2xl object-contain ring-1 ring-border/50'
          />
          <div className='flex flex-col'>
            <span className='text-lg leading-tight font-bold tracking-tight text-primary'>
              Duitku
            </span>
            <span className='text-[11px] leading-tight font-medium text-muted-foreground'>
              Catat uangmu, tenang hidupmu
            </span>
          </div>
        </div>

        <div className='flex flex-1 flex-col justify-center'>
          <Outlet />
        </div>

        <p className='mt-8 text-center text-[11px] leading-relaxed text-muted-foreground'>
          Data keuanganmu tersimpan aman dan hanya bisa diakses olehmu.
        </p>
      </main>
    </div>
  );
}

export default AuthLayout;
