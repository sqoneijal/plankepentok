import { lazy } from "react";
import { v4 } from "uuid";

const VerifikasiUsulanPengajuan = lazy(() => import("@/pages/verifikasi-usulan/pengajuan/page"));
const VerifikasiUsulanPengajuanDetail = lazy(() => import("@/pages/verifikasi-usulan/pengajuan/detail/page"));

export const route_verifikasi_usulan = [
   { key: v4(), path: "/verifikasi-usulan/pengajuan", element: <VerifikasiUsulanPengajuan /> },
   { key: v4(), path: "/verifikasi-usulan/pengajuan/:id/:id_jenis_usulan", element: <VerifikasiUsulanPengajuanDetail /> },
];
