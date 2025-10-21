import { detailLabel, getStatusUsulanKegiatan, getValue } from "@/helpers/init";
import { usePegawai, useUnitKerja } from "@/helpers/simpeg";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import moment from "moment";
import { useParams } from "react-router";
import { toast } from "sonner";
import { loadingElementSecond } from "../helpers";

const formatDate = (dateStr: string) => {
   if (!dateStr) return "-";
   return moment(dateStr).format("DD-MM-YYYY");
};

export default function InformasiDasar() {
   const { id_usulan_kegiatan } = useParams();

   const { data, isLoading, error } = useApiQuery<{
      content: Lists;
      status: boolean;
   }>({
      queryKey: ["verifikasi-usulan", "pengajuan", id_usulan_kegiatan, "informasi-dasar"],
      url: `/verifikasi-usulan/pengajuan/${id_usulan_kegiatan}/informasi-dasar`,
      options: { enabled: !!id_usulan_kegiatan },
   });

   const { data: operator, isLoading: isLoadingOperator } = usePegawai(data?.content ? getValue(data.content, "operator_input") : undefined);
   const { data: unitKerja, isLoading: isLoadingUnitKerja } = useUnitKerja(data?.content ? getValue(data.content, "id_unit_pengusul") : undefined);

   if (isLoading) return loadingElementSecond;

   if (error) {
      toast.error(error?.message);
      return null;
   }

   if (!data?.status) return <div className="p-6 text-center">Data tidak ditemukan</div>;

   const dataArray = data?.content ?? {};

   return (
      <div className="row">
         <div className="col-12 col-md-6">
            {detailLabel({ label: "Kode", value: getValue(dataArray, "kode") })}
            {detailLabel({ label: "Tanggal Mulai", value: formatDate(getValue(dataArray, "waktu_mulai")) })}
            {detailLabel({ label: "Tempat Pelaksanaan", value: getValue(dataArray, "tempat_pelaksanaan") })}
            {detailLabel({ label: "Tanggal Pengajuan", value: formatDate(getValue(dataArray, "tanggal_submit")) })}
            {detailLabel({
               label: "Operator Input",
               value: isLoadingOperator ? "Loading..." : `${getValue(dataArray, "operator_input")} - ${getValue(operator, "nama")}`,
            })}
         </div>
         <div className="col-12 col-md-6">
            {detailLabel({ label: "Nama", value: getValue(dataArray, "nama") })}
            {detailLabel({ label: "Tanggal Selesai", value: formatDate(getValue(dataArray, "waktu_selesai")) })}
            {detailLabel({ label: "Status Usulan", value: getStatusUsulanKegiatan(getValue(dataArray, "status_usulan")) })}
            {detailLabel({ label: "Unit Pengusul", value: isLoadingUnitKerja ? "Loading..." : unitKerja })}
         </div>
      </div>
   );
}
