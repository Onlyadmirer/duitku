import { Outlet } from "@tanstack/react-router";
import Mobile from "./layouts/Mobile";

function App() {
  return (
    <>
      <header className='py-4 border-b border-neutral-400'>
        <nav className='flex flex-row px-4 mx-auto space-x-6 max-w-7xl '>
          <div>Duitku</div>
        </nav>
      </header>

      <main className='mx-auto max-w-7xl'>
        <Outlet />
      </main>

      <section>
        <Mobile />
      </section>
    </>
  );
}

export default App;
