import { LoadingSkeleton } from "@/components/loading-skeleton";
import { lazy, Suspense } from "react";
import { Routes as ReactRoutes, Route } from "react-router";
import { v4 } from "uuid";

const Dashboard = lazy(() => import("@/pages/dashboard/page"));

const ReferensiUnitSatuan = lazy(() => import("@/pages/referensi/unit-satuan/page"));
const ReferensiUnitSatuanActions = lazy(() => import("@/pages/referensi/unit-satuan/actions/page"));

const ReferensiKategoriSBM = lazy(() => import("@/pages/referensi/kategori-sbm/page"));
const ReferensiKategoriSBMActions = lazy(() => import("@/pages/referensi/kategori-sbm/actions/page"));

const ReferensiStandarBiaya = lazy(() => import("@/pages/referensi/standar-biaya/page"));
const ReferensiStandarBiayaActions = lazy(() => import("@/pages/referensi/standar-biaya/actions/page"));

const ReferensiDetailHargaSBM = lazy(() => import("@/pages/referensi/detail-harga-sbm/page"));
const ReferensiDetailHargaSBMActions = lazy(() => import("@/pages/referensi/detail-harga-sbm/actions/page"));

const UsulanKegiatan = lazy(() => import("@/pages/usulan-kegiatan/page"));
const UsulanKegiatanActions = lazy(() => import("@/pages/usulan-kegiatan/actions/page"));
const UsulanKegiatanActionsDetail = lazy(() => import("@/pages/usulan-kegiatan/detail/page"));

const MasterIKU = lazy(() => import("@/pages/master-iku/page"));
const MasterIKUActions = lazy(() => import("@/pages/master-iku/actions/page"));

const VerifikasiUsulanPengajuan = lazy(() => import("@/pages/verifikasi-usulan/pengajuan/page"));
const VerifikasiUsulanPengajuanDetail = lazy(() => import("@/pages/verifikasi-usulan/pengajuan/detail/page"));

const VerifikasiUsulanPerbaikan = lazy(() => import("@/pages/verifikasi-usulan/perbaikan/page"));
const VerifikasiUsulanPerbaikanDetail = lazy(() => import("@/pages/verifikasi-usulan/perbaikan/detail/page"));

const PaguAnggaran = lazy(() => import("@/pages/pagu-anggaran/page"));
const PaguAnggaranDetail = lazy(() => import("@/pages/pagu-anggaran/detail/page"));

const Realisasi = lazy(() => import("@/pages/realisasi/page"));

const Pengaturan = lazy(() => import("@/pages/pengaturan/page"));
const PengaturanActions = lazy(() => import("@/pages/pengaturan/actions/page"));

const UnitKerjaBiro = lazy(() => import("@/pages/unit-kerja/biro/page"));
const UnitKerjaBiroActions = lazy(() => import("@/pages/unit-kerja/biro/actions/page"));

const UnitKerjaLembaga = lazy(() => import("@/pages/unit-kerja/lembaga/page"));
const UnitKerjaLembagaActions = lazy(() => import("@/pages/unit-kerja/lembaga/actions/page"));

const UnitKerjaUPT = lazy(() => import("@/pages/unit-kerja/upt/page"));
const UnitKerjaUPTActions = lazy(() => import("@/pages/unit-kerja/upt/actions/page"));

const UnitKerjaFakultas = lazy(() => import("@/pages/unit-kerja/fakultas/page"));
const UnitKerjaFakultasActions = lazy(() => import("@/pages/unit-kerja/fakultas/actions/page"));

const UnitKerjaSubUnit = lazy(() => import("@/pages/unit-kerja/sub-unit/page"));
const UnitKerjaSubUnitActions = lazy(() => import("@/pages/unit-kerja/sub-unit/actions/page"));

const route_path = [
   { key: v4(), path: "/", element: <Dashboard /> },
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
   { key: v4(), path: "/usulan-kegiatan", element: <UsulanKegiatan /> },
   { key: v4(), path: "/usulan-kegiatan/actions/:id", element: <UsulanKegiatanActions /> },
   { key: v4(), path: "/usulan-kegiatan/actions/:id/rab/:id", element: <UsulanKegiatanActions /> },
   { key: v4(), path: "/usulan-kegiatan/:id", element: <UsulanKegiatanActionsDetail /> },
   { key: v4(), path: "/master-iku", element: <MasterIKU /> },
   { key: v4(), path: "/master-iku/actions", element: <MasterIKUActions /> },
   { key: v4(), path: "/master-iku/actions/:id", element: <MasterIKUActions /> },
   { key: v4(), path: "/verifikasi-usulan/pengajuan", element: <VerifikasiUsulanPengajuan /> },
   { key: v4(), path: "/verifikasi-usulan/pengajuan/:id", element: <VerifikasiUsulanPengajuanDetail /> },
   { key: v4(), path: "/verifikasi-usulan/perbaikan", element: <VerifikasiUsulanPerbaikan /> },
   { key: v4(), path: "/verifikasi-usulan/perbaikan/:id", element: <VerifikasiUsulanPerbaikanDetail /> },
   { key: v4(), path: "/pagu-anggaran", element: <PaguAnggaran /> },
   { key: v4(), path: "/pagu-anggaran/:id", element: <PaguAnggaranDetail /> },
   { key: v4(), path: "/realisasi", element: <Realisasi /> },
   { key: v4(), path: "/pengaturan", element: <Pengaturan /> },
   { key: v4(), path: "/pengaturan/actions", element: <PengaturanActions /> },
   { key: v4(), path: "/pengaturan/actions/:id", element: <PengaturanActions /> },
   { key: v4(), path: "/unit-kerja/biro", element: <UnitKerjaBiro /> },
   { key: v4(), path: "/unit-kerja/biro/actions", element: <UnitKerjaBiroActions /> },
   { key: v4(), path: "/unit-kerja/biro/actions/:id", element: <UnitKerjaBiroActions /> },
   { key: v4(), path: "/unit-kerja/lembaga", element: <UnitKerjaLembaga /> },
   { key: v4(), path: "/unit-kerja/lembaga/actions", element: <UnitKerjaLembagaActions /> },
   { key: v4(), path: "/unit-kerja/lembaga/actions/:id", element: <UnitKerjaLembagaActions /> },
   { key: v4(), path: "/unit-kerja/upt", element: <UnitKerjaUPT /> },
   { key: v4(), path: "/unit-kerja/upt/actions", element: <UnitKerjaUPTActions /> },
   { key: v4(), path: "/unit-kerja/upt/actions/:id", element: <UnitKerjaUPTActions /> },
   { key: v4(), path: "/unit-kerja/fakultas", element: <UnitKerjaFakultas /> },
   { key: v4(), path: "/unit-kerja/fakultas/actions", element: <UnitKerjaFakultasActions /> },
   { key: v4(), path: "/unit-kerja/fakultas/actions/:id", element: <UnitKerjaFakultasActions /> },
   { key: v4(), path: "/unit-kerja/sub-unit", element: <UnitKerjaSubUnit /> },
   { key: v4(), path: "/unit-kerja/sub-unit/actions", element: <UnitKerjaSubUnitActions /> },
   { key: v4(), path: "/unit-kerja/sub-unit/actions/:id", element: <UnitKerjaSubUnitActions /> },
];

export default function Routes() {
   return (
      <div className="mt-3">
         <Suspense fallback={<LoadingSkeleton />}>
            <ReactRoutes>
               {route_path.map((item) => {
                  if (!item.element) {
                     return null;
                  }

                  return <Route key={item.key} path={item.path} element={item.element} />;
               })}
            </ReactRoutes>
         </Suspense>
      </div>
   );
}
