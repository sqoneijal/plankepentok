import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toRupiah } from "@/helpers/init";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import type { ColumnDef } from "@tanstack/react-table";

type ApproveStatus = "valid" | "tidak_valid" | "perbaiki" | null;

interface UnitSatuan {
   id: number;
   nama: string;
   deskripsi: string;
   aktif: boolean;
   uploaded: string | null;
   modified: string | null;
   user_modified: string | null;
}

interface RencanaAnggaranBiayaItem {
   id: number;
   id_usulan: number;
   uraian_biaya: string;
   qty: string;
   id_satuan: number;
   harga_satuan: string;
   total_biaya: string;
   catatan: string | null;
   uploaded: string;
   modified: string | null;
   user_modified: string;
   approve: ApproveStatus;
   unit_satuan: UnitSatuan;
   usulan_kegiatan: {
      verifikasi: Array<{
         id_referensi: number;
         status: string | null;
         catatan: string | null;
      }>;
   };
}

const getBadgeClass = (approve: ApproveStatus) => {
   if (approve === "valid") return "bg-green-400";
   if (approve === "tidak_valid") return "bg-red-400";
   return "bg-orange-400";
};

const getBadgeText = (approve: ApproveStatus) => {
   if (approve === "valid") return "Valid";
   if (approve === "tidak_valid") return "Tidak Valid";
   if (approve === "perbaiki") return "Perbaiki";
   return "Draft";
};

const columns: Array<ColumnDef<RencanaAnggaranBiayaItem>> = [
   {
      accessorKey: "id",
      header: "Status",
      cell: ({ row }) => {
         const original = row.original;
         const verifikasi = original?.usulan_kegiatan?.verifikasi;
         const status =
            verifikasi?.find((e: { id_referensi: number; status: string | null; catatan: string | null }) => e.id_referensi === original.id)
               ?.status || null;
         return <Badge className={getBadgeClass(status as ApproveStatus)}>{getBadgeText(status as ApproveStatus)}</Badge>;
      },
   },
   {
      accessorKey: "uraian_biaya",
      header: "Uraian Biaya",
   },
   {
      accessorKey: "qty",
      header: "Qty",
   },
   {
      accessorKey: "unit_satuan.nama",
      header: "Satuan",
   },
   {
      accessorKey: "harga_satuan",
      header: "Harga Satuan",
      cell: ({ getValue }) => toRupiah(getValue() as string),
   },
   {
      accessorKey: "total_biaya",
      header: "Total Biaya",
      cell: ({ getValue }) => toRupiah(getValue() as string),
   },
   {
      accessorKey: "catatan",
      header: "Catatan",
   },
   {
      accessorKey: "id",
      header: "catatan perbaikan",
      cell: ({ row }) => {
         const original = row.original;
         const verifikasi = original?.usulan_kegiatan?.verifikasi;
         const status =
            verifikasi?.find((e: { id_referensi: number; status: string | null; catatan: string | null }) => e.id_referensi === original.id) || null;

         if (status?.status !== "valid") {
            return status?.catatan;
         }
      },
   },
];

export default function RencanaAnggaranBiaya({ endpoint, id }: Readonly<{ endpoint: string; id: string | undefined }>) {
   const { results, isLoading } = useGetQueryDetail(endpoint, `${id}/rab`);

   const totalBiaya = results.reduce((sum: number, item: RencanaAnggaranBiayaItem) => sum + Number.parseFloat(item.total_biaya || "0"), 0);

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Rencana Anggaran Biaya</CardTitle>
            <CardAction>
               <div className="flex items-center justify-end gap-2 -mt-1">
                  <Label className="text-sm font-medium text-gray-600">Total Anggaran:</Label>
                  <div className="font-semibold text-lg">{toRupiah(totalBiaya)}</div>
               </div>
            </CardAction>
         </CardHeader>
         <CardContent>
            <Table columns={columns} data={results} total={results.length} isLoading={isLoading} usePagination={false} />
         </CardContent>
      </Card>
   );
}
