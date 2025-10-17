import { getValue } from "@/helpers/init";
import { useApiQuery } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useParams } from "react-router";
import { toast } from "sonner";
import { loadingElementSecond } from "../helpers";

export default function Sasaran() {
   const { id_usulan_kegiatan } = useParams();

   const { data, isLoading, error } = useApiQuery<{
      content: Lists;
      status: boolean;
   }>({
      queryKey: ["verifikasi-usulan", "perbaikan", id_usulan_kegiatan, "sasaran"],
      url: `/verifikasi-usulan/perbaikan/${id_usulan_kegiatan}/sasaran`,
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
         <div className="col-12 mt-2">{getValue(dataArray, "sasaran")}</div>
      </div>
   );
}
