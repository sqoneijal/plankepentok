import { FormRencanaAnggaranSkeleton } from "@/components/loading-skeleton";
import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getColumns } from "./column";
import { useInitPage } from "./init";

const Forms = lazy(() => import("./form/page"));

export default function Page({ id_usulan_kegiatan, id_rab_detail }: Readonly<{ id_usulan_kegiatan?: string; id_rab_detail?: string }>) {
   const [openSheet, setOpenSheet] = useState(false);

   const { results, total, isLoading } = useInitPage(id_usulan_kegiatan);

   const navigate = useNavigate();

   useEffect(() => {
      if (id_rab_detail) {
         setOpenSheet(true);
      }
   }, [id_rab_detail]);

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Rencana Anggaran Biaya</CardTitle>
            <CardAction>
               <Button variant="outline" onClick={() => setOpenSheet(true)}>
                  Tambah Anggaran Biaya
               </Button>
               <Sheet
                  open={openSheet}
                  onOpenChange={() => {
                     setOpenSheet(false);
                     navigate(`/usulan-kegiatan/actions/${id_usulan_kegiatan}`);
                  }}>
                  <SheetContent>
                     <SheetHeader className="-mb-8">
                        <SheetTitle>Rencana Anggaran Biaya</SheetTitle>
                        <SheetDescription>Tambahkan atau perbarui rencana anggaran biaya untuk kegiatan usulan.</SheetDescription>
                     </SheetHeader>
                     <Suspense fallback={<FormRencanaAnggaranSkeleton />}>
                        <div className="p-4">
                           <Forms id_usulan_kegiatan={id_usulan_kegiatan} id_rab_detail={id_rab_detail} handleSheetForm={setOpenSheet} />
                        </div>
                     </Suspense>
                  </SheetContent>
               </Sheet>
            </CardAction>
         </CardHeader>
         <CardContent>
            <Table columns={getColumns(id_usulan_kegiatan)} data={results} total={total} isLoading={isLoading} />
         </CardContent>
      </Card>
   );
}
