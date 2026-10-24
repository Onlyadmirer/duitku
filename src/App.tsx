import { Outlet } from "@tanstack/react-router";
import Mobile from "./layouts/Mobile";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";

function App() {
  return (
    <>
      <header className='py-4 shadow-xs shadow-accent/20'>
        <nav className='flex flex-row items-center px-4 mx-auto justify-between max-w-7xl '>
          <div className='flex flex-row gap-2 justify-center items-center'>
            <img
              src='/image.png'
              alt='logo'
              className='w-12 h-12 bg-background p-2 rounded-2xl'
            />
            <span className='font-sans font-semibold text-2xl text-accent leading-loose'>
              Duitku
            </span>
          </div>
          <Avatar size='lg'>
            <AvatarImage
              src='https://github.com/shadcn.png'
              alt='@shadcn'
              className='grayscale'
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </nav>
      </header>

      <main className='mx-auto px-5 py-6 h-screen max-w-7xl'>
        <Outlet />
      </main>

      <section className='flex w-full bg-amber-400 justify-center px-4'>
        <Mobile />
      </section>
    </>
  );
}

export default App;
