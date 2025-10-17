import { detailLabel, getValue, toRupiah } from "@/helpers/init";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useParams } from "react-router";
import { toast } from "sonner";
import { loadingElementSecond } from "../helpers";

export default function Anggaran() {
   const { id_usulan_kegiatan } = useParams();

   const { data, isLoading, error } = useApiQuery<{
      content: Lists;
      status: boolean;
   }>({
      queryKey: ["verifikasi-usulan", "pengajuan", id_usulan_kegiatan, "anggaran"],
      url: `/verifikasi-usulan/pengajuan/${id_usulan_kegiatan}/anggaran`,
      options: { enabled: !!id_usulan_kegiatan },
   });

   if (isLoading) return loadingElementSecond;

   if (error) {
      toast.error(error?.message);
      return null;
   }

   if (!data?.status) return <div className="p-6 text-center">Data tidak ditemukan</div>;

   const dataArray = data?.content ?? {};

   return (
      <div className="row">
         <div className="col-12 col-md-6">{detailLabel({ label: "Total Anggaran", value: toRupiah(getValue(dataArray, "total_anggaran")) })}</div>
         <div className="col-12 col-md-6">
            {detailLabel({ label: "Rencana Total Anggaran", value: toRupiah(getValue(dataArray, "rencana_total_anggaran")) })}
         </div>
      </div>
   );
}
