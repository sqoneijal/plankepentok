import { lazy } from "react";
import { v4 } from "uuid";

const PaguAnggaran = lazy(() => import("@/pages/pagu-anggaran/page"));
const PaguAnggaranDetail = lazy(() => import("@/pages/pagu-anggaran/detail/page"));

export const route_pagu_anggaran = [
   { key: v4(), path: "/pagu-anggaran", element: <PaguAnggaran /> },
   { key: v4(), path: "/pagu-anggaran/:id", element: <PaguAnggaranDetail /> },
];
