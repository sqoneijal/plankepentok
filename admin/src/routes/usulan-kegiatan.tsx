import { lazy } from "react";
import { v4 } from "uuid";

const UsulanKegiatan = lazy(() => import("@/pages/usulan-kegiatan/page"));
const UsulanKegiatanActions = lazy(() => import("@/pages/usulan-kegiatan/actions/page"));
const UsulanKegiatanActionsDetail = lazy(() => import("@/pages/usulan-kegiatan/detail/page"));

export const route_usulan_kegiatan = [
   { key: v4(), path: "/usulan-kegiatan", element: <UsulanKegiatan /> },
   { key: v4(), path: "/usulan-kegiatan/actions/:id", element: <UsulanKegiatanActions /> },
   { key: v4(), path: "/usulan-kegiatan/actions/:id/rab/:id_rab", element: <UsulanKegiatanActions /> },
   { key: v4(), path: "/usulan-kegiatan/:id", element: <UsulanKegiatanActionsDetail /> },
];
