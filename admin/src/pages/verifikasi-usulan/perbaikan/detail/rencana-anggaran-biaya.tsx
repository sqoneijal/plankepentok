import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { objectLength, toRupiah } from "@/helpers/init";
import type { ColumnDef } from "@tanstack/react-table";

type ApproveStatus = "valid" | "tidak_valid" | "perbaiki" | null;

interface VerifikasiItem {
   id_referensi: string;
   table_referensi: string;
   status: ApproveStatus;
   catatan: string;
}

interface UnitSatuan {
   id: number;
   nama: string;
   deskripsi: string;
   aktif: boolean;
   uploaded: string | null;
   modified: string | null;
   user_modified: string | null;
}

interface RabDetailPerubahan {
   harga_satuan: string;
   id: number;
   qty: string;
   total_biaya: string;
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
   catatan_perbaikan: string | null;
   rab_detail_perubahan: RabDetailPerubahan;
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

const columns = ({ verifikasi }: { verifikasi: Array<VerifikasiItem> }): Array<ColumnDef<RencanaAnggaranBiayaItem>> => [
   {
      accessorKey: "id",
      header: "Status",
      cell: ({ getValue }) => {
         const value = verifikasi.find((e: VerifikasiItem) => e.id_referensi === getValue() && e.table_referensi === "tb_rab_detail");
         const approve = value?.status as ApproveStatus;

         return <Badge className={getBadgeClass(approve)}>{getBadgeText(approve)}</Badge>;
      },
      meta: { className: "w-[10px]" },
   },
   {
      accessorKey: "uraian_biaya",
      header: "Uraian Biaya",
      meta: { className: "w-[300px]" },
   },
   {
      accessorKey: "qty",
      header: "Qty",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan) ? `${original?.qty} -> ${original?.rab_detail_perubahan?.qty}` : original?.qty,
   },
   {
      accessorKey: "unit_satuan",
      header: "Satuan",
      cell: (value) => {
         const unitSatuan = value.getValue() as UnitSatuan;
         return (
            <Tooltip>
               <TooltipTrigger>{unitSatuan?.nama}</TooltipTrigger>
               <TooltipContent>{unitSatuan?.deskripsi}</TooltipContent>
            </Tooltip>
         );
      },
   },
   {
      accessorKey: "harga_satuan",
      header: "Harga Satuan",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan)
            ? `${toRupiah(original?.harga_satuan)} -> ${toRupiah(original?.rab_detail_perubahan?.harga_satuan)}`
            : toRupiah(original?.harga_satuan),
   },
   {
      accessorKey: "total_biaya",
      header: "Total Biaya",
      cell: ({ row: { original } }) =>
         objectLength(original?.rab_detail_perubahan)
            ? `${toRupiah(original?.total_biaya)} -> ${toRupiah(original?.rab_detail_perubahan?.total_biaya)}`
            : toRupiah(original?.total_biaya),
   },
   {
      accessorKey: "catatan",
      header: "Catatan",
   },
   {
      accessorKey: "id",
      header: "Catatan Perbaikan",
      cell: ({ getValue }) => {
         const value = verifikasi.find((e: VerifikasiItem) => e.id_referensi === getValue() && e.table_referensi === "tb_rab_detail");
         const approve = value?.status as ApproveStatus;

         if (approve !== "valid") {
            return value?.catatan;
         }
      },
   },
];

export default function RencanaAnggaranBiaya({
   results,
   isLoading,
   verifikasi,
   anggaran_disetujui,
}: Readonly<{
   results: Array<RencanaAnggaranBiayaItem>;
   isLoading: boolean;
   verifikasi: Array<VerifikasiItem>;
   anggaran_disetujui: string;
}>) {
   const totalBiaya = results.reduce((sum: number, item: RencanaAnggaranBiayaItem) => sum + Number.parseFloat(item.total_biaya || "0"), 0);

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Rencana Anggaran Biaya</CardTitle>
            <CardAction>
               <div className="flex items-center justify-end gap-2 -mt-1">
                  <Badge variant="outline" className="bg-yellow-100">
                     <Label className="text-sm font-medium text-gray-600">Total Anggaran Pengajuan:</Label>
                     <div className="font-semibold text-lg">{toRupiah(totalBiaya)}</div>
                  </Badge>
                  <Badge variant="outline" className="bg-green-100">
                     <Label className="text-sm font-medium text-gray-600">Total Anggaran Disetujui:</Label>
                     <div className="font-semibold text-lg">{toRupiah(anggaran_disetujui)}</div>
                  </Badge>
               </div>
            </CardAction>
         </CardHeader>
         <CardContent>
            <Table columns={columns({ verifikasi })} data={results} total={results.length} isLoading={isLoading} usePagination={false} />
         </CardContent>
      </Card>
   );
}
