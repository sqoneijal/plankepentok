import { lazy } from "react";
import { v4 } from "uuid";

const Daftar = lazy(() => import("@/pages/pengguna/daftar/page"));
const DaftarActions = lazy(() => import("@/pages/pengguna/daftar/actions/page"));
const Logs = lazy(() => import("@/pages/pengguna/logs/page"));

export const route_pengguna = [
   { key: v4(), path: "/pengguna/daftar", element: <Daftar /> },
   { key: v4(), path: "/pengguna/daftar/actions", element: <DaftarActions /> },
   { key: v4(), path: "/pengguna/daftar/actions/:id", element: <DaftarActions /> },
   { key: v4(), path: "/pengguna/logs", element: <Logs /> },
];
