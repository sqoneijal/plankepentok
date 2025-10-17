import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFirstHash, loadingSpinner } from "@/helpers/init";
import { useStatusUsulanKegiatan } from "@/hooks/store";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { loadingElement } from "./helper";

const InformasiDasar = lazy(() => import("./informasi-dasar"));
const Anggaran = lazy(() => import("./anggaran"));
const LatarBelakang = lazy(() => import("./latar-belakang"));
const Tujuan = lazy(() => import("./tujuan"));
const Sasaran = lazy(() => import("./sasaran"));
const Rab = lazy(() => import("./rab/page"));
const Iku = lazy(() => import("./iku/page"));
const Dokumen = lazy(() => import("./dokumen/page"));
const Informasi = lazy(() => import("./informasi"));

export default function Page() {
   const location = useLocation();
   const navigate = useNavigate();

   const { id_usulan_kegiatan } = useParams();
   const { status, setStatus } = useStatusUsulanKegiatan();

   const [currentTab, setCurrentTab] = useState(getFirstHash(location.hash));

   const tabsMenu = [
      { value: "#informasi-dasar", label: "Informasi Dasar", element: <InformasiDasar /> },
      { value: "#anggaran", label: "Anggaran", element: <Anggaran /> },
      { value: "#latar-belakang", label: "Latar Belakang", element: <LatarBelakang /> },
      { value: "#tujuan", label: "Tujuan", element: <Tujuan /> },
      { value: "#sasaran", label: "Sasaran", element: <Sasaran /> },
      { value: "#rab", label: "RAB", element: <Rab /> },
      { value: "#iku", label: "IKU", element: <Iku /> },
      { value: "#dokumen", label: "Dokumen", element: <Dokumen /> },
   ];

   const handleTabChange = (value: string) => {
      setCurrentTab(value);
      navigate(value);
   };

   const { data, isLoading, error } = useApiQuery<Lists>({
      queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "status-usulan"],
      url: `/usulan-kegiatan/${id_usulan_kegiatan}/status-usulan`,
   });

   useEffect(() => {
      if (!isLoading && data?.data && id_usulan_kegiatan) {
         setStatus(data?.data?.status_usulan ?? "");
      }
      return () => {};
   }, [data, isLoading, setStatus, id_usulan_kegiatan]);

   if (isLoading)
      return (
         <div className="min-h-screen flex items-center justify-center from-slate-50 to-slate-100">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
               <p className="text-gray-600 font-medium">Memuat data...</p>
            </div>
         </div>
      );

   if (error) toast.error(error?.message);

   return (
      <div className="overflow-hidden rounded-lg border shadow-sm p-4">
         {status !== "draft" && (
            <Suspense fallback={loadingSpinner()}>
               <div className="mb-2">
                  <Informasi status={status ? (status as "submitted" | "verified" | "rejected") : undefined} />
               </div>
            </Suspense>
         )}
         <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList>
               {tabsMenu.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} onClick={() => navigate(tab.value)}>
                     {tab.label}
                  </TabsTrigger>
               ))}
            </TabsList>
            {tabsMenu.map((item) => (
               <TabsContent value={item.value} className="space-y-4" key={item.value}>
                  <Suspense fallback={loadingElement}>{item.element}</Suspense>
               </TabsContent>
            ))}
         </Tabs>
      </div>
   );
}
