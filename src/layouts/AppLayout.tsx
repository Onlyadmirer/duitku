import { useEffect, useState } from "react";
import { Outlet, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Mobile from "./Mobile";
import { useLogout, useMe } from "@/hooks/use-finance";
import { initials } from "@/lib/format";

const pageTitles: { match: (path: string) => boolean; title: string }[] = [
  { match: (path) => path === "/", title: "Beranda" },
  { match: (path) => path === "/transaksi", title: "Transaksi" },
  { match: (path) => path === "/transaksi/baru", title: "Catat Transaksi" },
  { match: (path) => path.startsWith("/transaksi/"), title: "Edit Transaksi" },
  { match: (path) => path === "/anggaran", title: "Anggaran" },
  { match: (path) => path === "/laporan", title: "Laporan" },
  { match: (path) => path === "/dompet", title: "Dompet" },
  { match: (path) => path === "/kategori", title: "Kategori" },
  { match: (path) => path === "/lainnya", title: "Lainnya" },
];

const isMainPage = (path: string) =>
  ["/", "/transaksi", "/anggaran", "/lainnya"].includes(path);

function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const router = useRouter();
  const { data: user } = useMe();
  const logout = useLogout();
  const { resolvedTheme, setTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const pageTitle =
    pageTitles.find((item) => item.match(pathname))?.title ?? "Duitku";
  const showBack = !isMainPage(pathname);

  useEffect(() => {
    document.title = `${pageTitle} — Duitku`;
  }, [pageTitle]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout.mutateAsync();
      toast.success("Kamu sudah keluar.");
      navigate({ to: "/masuk", replace: true });
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className='sticky top-0 z-40 border-b border-border/60 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl'>
        <nav className='mx-auto flex w-full max-w-[480px] items-center justify-between gap-2 px-4 py-3'>
          <div className='flex min-w-0 items-center gap-2.5'>
            {showBack && (
              <button
                type='button'
                onClick={() => router.history.back()}
                className='flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container hover:text-foreground'
                aria-label='Kembali'
              >
                <ArrowLeft size={19} />
              </button>
            )}
            <img
              src='/image.png'
              alt='Logo Duitku'
              className='size-9 shrink-0 rounded-xl object-contain'
            />
            <div className='flex min-w-0 flex-col'>
              <span className='truncate text-base leading-tight font-bold tracking-tight text-primary'>
                Duitku
              </span>
              <span className='truncate text-[11px] leading-tight font-medium text-muted-foreground'>
                {pageTitle}
              </span>
            </div>
          </div>

          <div className='flex shrink-0 items-center gap-0.5'>
            <button
              type='button'
              aria-label='Notifikasi'
              onClick={() => toast.info("Belum ada notifikasi baru.")}
              className='flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container'
            >
              <Bell size={19} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type='button'
                    aria-label='Menu profil'
                    className='flex items-center gap-1 rounded-full p-0.5 transition-colors hover:bg-surface-container'
                  />
                }
              >
                <Avatar size='lg'>
                  <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary'>
                    {initials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown size={13} className='text-muted-foreground' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' sideOffset={8} className='w-56'>
                <div className='px-2 py-1.5 text-xs font-medium text-muted-foreground'>
                  Masuk sebagai
                </div>
                <div className='px-2 pb-2'>
                  <p className='truncate text-sm font-semibold'>{user?.name ?? "Pengguna"}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {user?.email ?? "-"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/lainnya" })}>
                  <UserRound size={16} />
                  Profil & pengaturan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  Mode {resolvedTheme === "dark" ? "terang" : "gelap"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant='destructive'
                  disabled={loggingOut}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  {loggingOut ? "Keluar..." : "Keluar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <main className='mx-auto min-h-[calc(100dvh-64px)] w-full max-w-[480px] px-4 pt-4 pb-28'>
        <Outlet />
      </main>

      <Mobile />
    </>
  );
}

export default AppLayout;
