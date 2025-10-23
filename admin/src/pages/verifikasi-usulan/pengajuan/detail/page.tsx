import { DetailUsulanKegiatanSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHeaderButton } from "@/hooks/store";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { LinkButton } from "@/lib/helpers";
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router";

const endpoint = "/verifikasi-usulan/pengajuan";

const UsulanKegiatan = lazy(() => import("./usulan-kegiatan"));
const Iku = lazy(() => import("./iku"));
const RencanaAnggaranBiaya = lazy(() => import("./rencana-anggaran-biaya"));
const Dokumen = lazy(() => import("./dokumen"));

const getTitleHistori = (jenis: string) => {
   switch (jenis) {
      case "penolakan":
         return { title: "Histori Penolakan", desc: "Berikut adalah histori penolakan untuk usulan kegiatan ini." };
      case "perbaikan":
         return { title: "Histori Perbaikan", desc: "Berikut adalah histori perbaikan untuk usulan kegiatan ini." };
   }
};

interface HistoriItem {
   id: string | number;
   uploaded: string;
   user_modified: string;
   catatan: string;
}

const renderDaftarHistori = (content: HistoriItem[]) => {
   return content.map((item: HistoriItem) => (
      <Card key={item.id}>
         <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Tanggal: {new Date(item.uploaded).toLocaleString("id-ID")}</p>
            <p className="text-sm text-muted-foreground mb-2">User: {item.user_modified}</p>
            <p className="text-sm">{item.catatan}</p>
         </CardContent>
      </Card>
   ));
};

export default function Page() {
   const { id } = useParams();
   const { setButton } = useHeaderButton();

   const [openDialag, setOpenDialag] = useState(false);
   const [jenisHistori, setJenisHistori] = useState("");

   const { results: daftarHistoriPenolakan } = useGetQueryDetail(endpoint, `${id}/histori-penolakan`);
   const { results: daftarHistoriPerbaikan } = useGetQueryDetail(endpoint, `${id}/histori-perbaikan`);

   const { results, isLoading } = useGetQueryDetail(endpoint, id);

   useEffect(() => {
      setButton(
         <ButtonGroup>
            <Button
               variant="outline"
               onClick={() => {
                  setOpenDialag(true);
                  setJenisHistori("perbaikan");
               }}>
               Histori Perbaikan
            </Button>
            <Button
               variant="outline"
               onClick={() => {
                  setOpenDialag(true);
                  setJenisHistori("penolakan");
               }}>
               Histori Penolakan
            </Button>
            <LinkButton label="Kembali" url={endpoint} type="actions" />
         </ButtonGroup>
      );
      return () => {
         setButton(<div />);
      };
   }, [setButton, id]);

   if (isLoading) {
      return <DetailUsulanKegiatanSkeleton />;
   }

   if (!results) {
      return <div>Data tidak ditemukan</div>;
   }

   const historiList = jenisHistori === "penolakan" ? daftarHistoriPenolakan : daftarHistoriPerbaikan;

   return (
      <Suspense fallback={<DetailUsulanKegiatanSkeleton />}>
         <Dialog open={openDialag} onOpenChange={setOpenDialag}>
            <DialogContent className="max-h-[100vh] w-full max-w-4xl">
               <DialogHeader>
                  <DialogTitle>{getTitleHistori(jenisHistori)?.title}</DialogTitle>
                  <DialogDescription>{getTitleHistori(jenisHistori)?.desc}</DialogDescription>
               </DialogHeader>
               <ScrollArea className="h-[80vh] p-4">
                  {historiList && historiList.length > 0 ? (
                     <div className="space-y-4">{renderDaftarHistori(historiList)}</div>
                  ) : (
                     <p className="py-4 text-muted-foreground">Tidak ada histori {jenisHistori}.</p>
                  )}
               </ScrollArea>
            </DialogContent>
         </Dialog>
         <UsulanKegiatan results={results} endpoint={endpoint} id_usulan={id as string} />
         <Iku results={results?.relasi_usulan_iku} isLoading={isLoading} endpoint={endpoint} id_usulan={id as string} />
         <RencanaAnggaranBiaya results={results?.rab_detail} isLoading={isLoading} endpoint={endpoint} id_usulan={id as string} />
         <Dokumen results={results?.dokumen_pendukung} isLoading={isLoading} endpoint={endpoint} id_usulan={id as string} />
      </Suspense>
   );
}
