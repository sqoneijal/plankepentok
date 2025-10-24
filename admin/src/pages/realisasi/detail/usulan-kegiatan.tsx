import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { detailLabel, toRupiah } from "@/helpers/init";
import { usePegawai, useUnitKerja } from "@/helpers/simpeg";
import type { FormData } from "@/types/init";

export default function UsulanKegiatan({ results }: Readonly<{ results: FormData }>) {
   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("id-ID");
   };

   const { data: unitPengusul, isLoading: isLoadingUnitPengusul } = useUnitKerja(results.id_unit_pengusul);
   const { data: operatorInput, isLoading: isLoadingOperatorInput } = usePegawai(results.operator_input);

   const rabDetail = results.rab_detail ? results.rab_detail : [];
   const total_anggaran_disetujui = (rabDetail as Array<Record<string, unknown>>).reduce((sum: number, item: Record<string, unknown>) => {
      const perubahan = item.rab_detail_perubahan as Record<string, unknown> | undefined;
      return sum + (perubahan ? Number.parseFloat((perubahan.total_biaya as string) || "0") : Number.parseFloat((item.total_biaya as string) || "0"));
   }, 0);

   return (
      <Card>
         <CardHeader>
            <CardTitle>Detail Usulan Kegiatan</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="row">
               <div className="col-12 col-md-2">{detailLabel({ label: "Kode", value: results.kode })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Nama", value: results.nama })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Waktu Mulai", value: formatDate(results.waktu_mulai) })}</div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Waktu Selesai", value: formatDate(results.waktu_selesai) })}</div>
               <div className="col-12 col-md-2">
                  {detailLabel({ label: "Operator Input", value: isLoadingOperatorInput ? <Spinner /> : operatorInput?.nama || "N/A" })}
               </div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Tanggal Submit", value: formatDate(results.tanggal_submit) })}</div>
            </div>
            <div className="row">
               <div className="col-12 col-md-2">{detailLabel({ label: "Tanggal Submit", value: formatDate(results.tanggal_submit) })}</div>
               <div className="col-12 col-md-2">
                  {detailLabel({ label: "Rencana Total Anggaran", value: toRupiah(results.rencana_total_anggaran) })}
               </div>
               <div className="col-12 col-md-2">{detailLabel({ label: "Total Anggaran", value: toRupiah(results.total_anggaran) })}</div>
               <div className="col-12 col-md-2">
                  {detailLabel({
                     label: "Total Anggaran Disetujui",
                     value: toRupiah(total_anggaran_disetujui),
                  })}
               </div>
            </div>
            <div className="row">
               <div className="col-12 col-md-5">
                  {detailLabel({ label: "Unit Pengusul", value: isLoadingUnitPengusul ? <Spinner /> : unitPengusul })}
               </div>
               <div className="col-12 col-md-5">{detailLabel({ label: "Tempat Pelaksanaan", value: results.tempat_pelaksanaan })}</div>
            </div>
            <div className="row">
               <div className="col-12">{detailLabel({ label: "Latar Belakang", value: results.latar_belakang })}</div>
            </div>
            <div className="row">
               <div className="col-12">{detailLabel({ label: "Tujuan", value: results.tujuan })}</div>
            </div>
            <div className="row">
               <div className="col-12">{detailLabel({ label: "Sasaran", value: results.sasaran })}</div>
            </div>
         </CardContent>
      </Card>
   );
}
