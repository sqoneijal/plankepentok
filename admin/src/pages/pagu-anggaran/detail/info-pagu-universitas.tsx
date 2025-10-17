import { Label } from "@/components/ui/label";
import { toRupiah } from "@/helpers/init";

export default function InfoPaguUniversitas({ content }: Readonly<{ content?: Record<string, string> }>) {
   if (!content) {
      return <div>No data available</div>;
   }

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
         year: "numeric",
         month: "2-digit",
         day: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
         second: "2-digit",
      });
   };

   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         <div>
            <Label className="font-semibold">ID</Label>
            <p>{content.id}</p>
         </div>
         <div>
            <Label className="font-semibold">Tahun Anggaran</Label>
            <p>{content.tahun_anggaran}</p>
         </div>
         <div>
            <Label className="font-semibold">Total Pagu</Label>
            <p>{toRupiah(content.total_pagu)}</p>
         </div>
         <div>
            <Label className="font-semibold">Realisasi</Label>
            <p>{content.realisasi ? toRupiah(content.realisasi) : "Belum ada"}</p>
         </div>
         <div>
            <Label className="font-semibold">Status Aktif</Label>
            <p>{content.is_aktif ? "Aktif" : "Tidak Aktif"}</p>
         </div>
         <div>
            <Label className="font-semibold">Tanggal Upload</Label>
            <p>{formatDate(content.uploaded)}</p>
         </div>
         <div>
            <Label className="font-semibold">Tanggal Modifikasi</Label>
            <p>{formatDate(content.modified)}</p>
         </div>
         <div>
            <Label className="font-semibold">User Modified</Label>
            <p>{content.user_modified}</p>
         </div>
      </div>
   );
}
