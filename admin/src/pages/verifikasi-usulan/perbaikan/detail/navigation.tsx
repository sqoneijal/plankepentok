import { lazy } from "react";

const InformasiDasar = lazy(() => import("./informasi-dasar"));
const Anggaran = lazy(() => import("./anggaran"));
const LatarBelakang = lazy(() => import("./latar-belakang"));
const Tujuan = lazy(() => import("./tujuan"));
const Sasaran = lazy(() => import("./sasaran"));
const Rab = lazy(() => import("./rab/page"));
const Iku = lazy(() => import("./iku/page"));
const Dokumen = lazy(() => import("./dokumen/page"));
const CatatanPerbaikan = lazy(() => import("./catatan-perbaikan"));

const tabsList = [
   { key: "#informasi-dasar", label: "Informasi Dasar", element: <InformasiDasar /> },
   { key: "#anggaran", label: "Anggaran", element: <Anggaran /> },
   { key: "#latar-belakang", label: "Latar Belakang", element: <LatarBelakang /> },
   { key: "#tujuan", label: "Tujuan", element: <Tujuan /> },
   { key: "#sasaran", label: "Sasaran", element: <Sasaran /> },
   { key: "#rab", label: "RAB", element: <Rab /> },
   { key: "#iku", label: "IKU", element: <Iku /> },
   { key: "#dokumen", label: "Dokumen", element: <Dokumen /> },
   { key: "#perbaikan", label: "Perbaikan", element: <CatatanPerbaikan /> },
];

export { tabsList };
