import { Link, Outlet } from "@tanstack/react-router";

function App() {
  return (
    <>
      <header className='py-4 border-b border-neutral-400'>
        <nav className='flex flex-row mx-auto space-x-6 max-w-7xl '>
          <Link to='/'>Home</Link>
          <Link to='/about'>About</Link>
        </nav>
      </header>

      <main className='mx-auto max-w-7xl'>
        <Outlet />
      </main>
    </>
  );
}

export default App;
