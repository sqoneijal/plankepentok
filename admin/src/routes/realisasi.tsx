import { lazy } from "react";
import { v4 } from "uuid";

const Page = lazy(() => import("@/pages/realisasi/page"));
const Detail = lazy(() => import("@/pages/realisasi/detail/page"));
const Actions = lazy(() => import("@/pages/realisasi/actions/page"));

export const route_realisasi = [
   { key: v4(), path: "/realisasi", element: <Page /> },
   { key: v4(), path: "/realisasi/:id", element: <Detail /> },
   { key: v4(), path: "/realisasi/:id/actions", element: <Actions /> },
];
