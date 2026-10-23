import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import App from "./App";

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <h1>Home</h1>,
});

const transaksi = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transaksi",
  component: () => <h1>About</h1>,
});
const tambahTransaksi = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tambah-transaksi",
  component: () => <h1>About</h1>,
});
const anggaran = createRoute({
  getParentRoute: () => rootRoute,
  path: "/anggaran",
  component: () => <h1>About</h1>,
});
const lainnya = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lainnya",
  component: () => <h1>About</h1>,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  transaksi,
  tambahTransaksi,
  anggaran,
  lainnya,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
