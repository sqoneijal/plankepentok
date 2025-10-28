import { lazy } from "react";
import { v4 } from "uuid";

const ReferensiUnitSatuan = lazy(() => import("@/pages/referensi/unit-satuan/page"));
const ReferensiUnitSatuanActions = lazy(() => import("@/pages/referensi/unit-satuan/actions/page"));

const ReferensiKategoriSBM = lazy(() => import("@/pages/referensi/kategori-sbm/page"));
const ReferensiKategoriSBMActions = lazy(() => import("@/pages/referensi/kategori-sbm/actions/page"));

const ReferensiStandarBiaya = lazy(() => import("@/pages/referensi/standar-biaya/page"));
const ReferensiStandarBiayaActions = lazy(() => import("@/pages/referensi/standar-biaya/actions/page"));

const ReferensiDetailHargaSBM = lazy(() => import("@/pages/referensi/detail-harga-sbm/page"));
const ReferensiDetailHargaSBMActions = lazy(() => import("@/pages/referensi/detail-harga-sbm/actions/page"));

const JenisUsulan = lazy(() => import("@/pages/referensi/jenis-usulan/page"));
const JenisUsulanActions = lazy(() => import("@/pages/referensi/jenis-usulan/actions/page"));

export const route_referensi = [
   { key: v4(), path: "/referensi/unit-satuan", element: <ReferensiUnitSatuan /> },
   { key: v4(), path: "/referensi/unit-satuan/actions", element: <ReferensiUnitSatuanActions /> },
   { key: v4(), path: "/referensi/unit-satuan/actions/:id", element: <ReferensiUnitSatuanActions /> },
   { key: v4(), path: "/referensi/kategori-sbm", element: <ReferensiKategoriSBM /> },
   { key: v4(), path: "/referensi/kategori-sbm/actions", element: <ReferensiKategoriSBMActions /> },
   { key: v4(), path: "/referensi/kategori-sbm/actions/:id", element: <ReferensiKategoriSBMActions /> },
   { key: v4(), path: "/referensi/standar-biaya", element: <ReferensiStandarBiaya /> },
   { key: v4(), path: "/referensi/standar-biaya/actions", element: <ReferensiStandarBiayaActions /> },
   { key: v4(), path: "/referensi/standar-biaya/actions/:id", element: <ReferensiStandarBiayaActions /> },
   { key: v4(), path: "/referensi/detail-harga-sbm", element: <ReferensiDetailHargaSBM /> },
   { key: v4(), path: "/referensi/detail-harga-sbm/actions", element: <ReferensiDetailHargaSBMActions /> },
   { key: v4(), path: "/referensi/detail-harga-sbm/actions/:id", element: <ReferensiDetailHargaSBMActions /> },
   { key: v4(), path: "/referensi/jenis-usulan", element: <JenisUsulan /> },
   { key: v4(), path: "/referensi/jenis-usulan/actions", element: <JenisUsulanActions /> },
   { key: v4(), path: "/referensi/jenis-usulan/actions/:id", element: <JenisUsulanActions /> },
];
