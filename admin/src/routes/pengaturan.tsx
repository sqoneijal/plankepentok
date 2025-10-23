import { lazy } from "react";
import { v4 } from "uuid";

const Pengaturan = lazy(() => import("@/pages/pengaturan/page"));
const PengaturanActions = lazy(() => import("@/pages/pengaturan/actions/page"));

export const route_pengaturan = [
   { key: v4(), path: "/pengaturan", element: <Pengaturan /> },
   { key: v4(), path: "/pengaturan/actions", element: <PengaturanActions /> },
   { key: v4(), path: "/pengaturan/actions/:id", element: <PengaturanActions /> },
];
