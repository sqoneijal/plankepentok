import { lazy } from "react";
import { v4 } from "uuid";

const VerifikasiUsulanPengajuan = lazy(() => import("@/pages/verifikasi-usulan/pengajuan/page"));
const VerifikasiUsulanPengajuanDetail = lazy(() => import("@/pages/verifikasi-usulan/pengajuan/detail/page"));

const Perbaikan = lazy(() => import("@/pages/verifikasi-usulan/perbaikan/page"));
const PerbaikanDetail = lazy(() => import("@/pages/verifikasi-usulan/perbaikan/detail/page"));

export const route_verifikasi_usulan = [
   { key: v4(), path: "/verifikasi-usulan/pengajuan", element: <VerifikasiUsulanPengajuan /> },
   { key: v4(), path: "/verifikasi-usulan/pengajuan/:id", element: <VerifikasiUsulanPengajuanDetail /> },
   { key: v4(), path: "/verifikasi-usulan/perbaikan", element: <Perbaikan /> },
   { key: v4(), path: "/verifikasi-usulan/perbaikan/:id_usulan_kegiatan", element: <PerbaikanDetail /> },
];
