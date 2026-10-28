import { Outlet } from "@tanstack/react-router";
import Mobile from "./layouts/Mobile";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";

function App() {
  return (
    <>
      <header className='sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl'>
        <nav className='mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2.5'>
            <img
              src='/image.png'
              alt='logo'
              className='size-10 rounded-xl object-contain'
            />
            <div className='flex flex-col'>
              <span className='text-base leading-tight font-semibold text-primary'>
                Duitku
              </span>
              <span className='text-[11px] leading-tight font-medium text-muted-foreground'>
                Beranda
              </span>
            </div>
          </div>
          <Avatar size='lg'>
            <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
        </nav>
      </header>

      <main className='mx-auto min-h-screen w-full max-w-[480px] px-4 pt-4 pb-28'>
        <Outlet />
      </main>

      <Mobile />
    </>
  );
}

export default App;
