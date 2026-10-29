import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  isRedirect,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";
import { authApi } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { qk } from "@/lib/query-keys";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import NotFoundPage from "@/pages/NotFound";
import type { TransactionType } from "@/types/api";

const LoginPage = lazyRouteComponent(() => import("@/pages/auth/Login"));
const RegisterPage = lazyRouteComponent(() => import("@/pages/auth/Register"));
const HomePage = lazyRouteComponent(() => import("@/pages/home/Home"));
const TransactionsPage = lazyRouteComponent(() => import("@/pages/transaction/Transactions"));
const NewTransactionPage = lazyRouteComponent(() => import("@/pages/transaction/NewTransaction"));
const EditTransactionPage = lazyRouteComponent(() => import("@/pages/transaction/EditTransaction"));
const BudgetsPage = lazyRouteComponent(() => import("@/pages/budget/Budgets"));
const ReportsPage = lazyRouteComponent(() => import("@/pages/report/Reports"));
const WalletsPage = lazyRouteComponent(() => import("@/pages/wallet/Wallets"));
const CategoriesPage = lazyRouteComponent(() => import("@/pages/category/Categories"));
const MorePage = lazyRouteComponent(() => import("@/pages/more/More"));

type LoginSearch = { redirect?: string };
type TransactionSearch = {
  q?: string;
  type?: TransactionType;
  walletId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

const stringValue = (value: unknown) =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const parseLoginSearch = (search: Record<string, unknown>): LoginSearch => ({
  redirect: stringValue(search.redirect),
});

const parseTransactionSearch = (
  search: Record<string, unknown>,
): TransactionSearch => ({
  q: stringValue(search.q),
  type: search.type === "income" || search.type === "expense" ? search.type : undefined,
  walletId: stringValue(search.walletId),
  categoryId: stringValue(search.categoryId),
  from: stringValue(search.from),
  to: stringValue(search.to),
});

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundPage,
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_auth",
  component: AuthLayout,
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_app",
  component: AppLayout,
  beforeLoad: async ({ location }) => {
    try {
      await queryClient.ensureQueryData({
        queryKey: qk.me,
        queryFn: authApi.me,
        staleTime: 60_000,
        retry: false,
      });
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({
        to: "/masuk",
        search: { redirect: location.href },
      });
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/masuk",
  validateSearch: parseLoginSearch,
  component: LoginPage,
  beforeLoad: async () => {
    try {
      const me = await queryClient.ensureQueryData({
        queryKey: qk.me,
        queryFn: authApi.me,
        staleTime: 60_000,
        retry: false,
      });
      if (me) throw redirect({ to: "/" });
    } catch (error) {
      if (isRedirect(error)) throw error;
    }
  },
});

const registerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/daftar",
  validateSearch: parseLoginSearch,
  component: RegisterPage,
  beforeLoad: async () => {
    try {
      const me = await queryClient.ensureQueryData({
        queryKey: qk.me,
        queryFn: authApi.me,
        staleTime: 60_000,
        retry: false,
      });
      if (me) throw redirect({ to: "/" });
    } catch (error) {
      if (isRedirect(error)) throw error;
    }
  },
});

const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: HomePage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/transaksi",
  validateSearch: parseTransactionSearch,
  component: TransactionsPage,
});

const newTransactionRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/transaksi/baru",
  component: NewTransactionPage,
});

const editTransactionRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/transaksi/$id",
  component: EditTransactionPage,
});

const budgetsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/anggaran",
  component: BudgetsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/laporan",
  component: ReportsPage,
});

const walletsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/dompet",
  component: WalletsPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/kategori",
  component: CategoriesPage,
});

const moreRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/lainnya",
  component: MorePage,
});

const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([loginRoute, registerRoute]),
  appLayoutRoute.addChildren([
    indexRoute,
    transactionsRoute,
    newTransactionRoute,
    editTransactionRoute,
    budgetsRoute,
    reportsRoute,
    walletsRoute,
    categoriesRoute,
    moreRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingMs: 150,
  defaultPendingComponent: () => (
    <div className='flex min-h-[40dvh] items-center justify-center text-xs text-muted-foreground'>
      Memuat halaman...
    </div>
  ),
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
