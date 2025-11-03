import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import type { ColumnDef, Row } from "@tanstack/react-table";
import React from "react";

interface DokumenItem {
   id: number;
   id_usulan: number;
   nama_dokumen: string;
   tipe_dokumen: string;
   path_file: string;
   uploaded: string;
   modified: string | null;
   user_modified: string;
   file_dokumen: string;
   usulan_kegiatan: {
      verifikasi: Array<{
         id_referensi: number;
         status: string | null;
         catatan: string | null;
      }>;
   };
}

type ApproveStatus = "sesuai" | "tidak_sesuai" | null;

const getBadgeClass = (approve: ApproveStatus) => {
   if (approve === "sesuai") return "bg-green-400";
   if (approve === "tidak_sesuai") return "bg-red-400";
   return "bg-orange-400";
};

const getBadgeText = (approve: ApproveStatus) => {
   if (approve === "sesuai") return "Sesuai";
   if (approve === "tidak_sesuai") return "Tidak Sesuai";
   return "Draft";
};

const AksiCell: React.FC<{ value: string }> = ({ value }) => (
   <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      Lihat Dokumen
   </a>
);

const AksiTableCell = ({ getValue }: { getValue: () => unknown }) => <AksiCell value={getValue() as string} />;

const StatusCell: React.FC<{ row: Row<DokumenItem> }> = ({ row }) => {
   const original = row.original;
   const verifikasi = original?.usulan_kegiatan?.verifikasi;
   const status =
      verifikasi?.find((e: { id_referensi: number; status: string | null; catatan: string | null }) => e.id_referensi === original.id)?.status ||
      null;
   return <Badge className={getBadgeClass(status as ApproveStatus)}>{getBadgeText(status as ApproveStatus)}</Badge>;
};

export default function Dokumen({ endpoint, id }: Readonly<{ endpoint: string; id: string | undefined }>) {
   const { results, isLoading } = useGetQueryDetail(endpoint, `${id}/dokumen`);

   const columns: Array<ColumnDef<DokumenItem>> = [
      {
         accessorKey: "id",
         header: "Status",
         cell: StatusCell,
      },
      {
         accessorKey: "nama_dokumen",
         header: "Nama Dokumen",
      },
      {
         accessorKey: "tipe_dokumen",
         header: "Tipe Dokumen",
      },
      {
         accessorKey: "file_dokumen",
         header: "File",
      },
      {
         accessorKey: "path_file",
         header: "Aksi",
         cell: AksiTableCell,
      },
      {
         accessorKey: "id",
         header: "catatan perbaikan",
         cell: ({ row }) => {
            const original = row.original;
            const verifikasi = original?.usulan_kegiatan?.verifikasi;
            const status =
               verifikasi?.find((e: { id_referensi: number; status: string | null; catatan: string | null }) => e.id_referensi === original.id) ||
               null;

            if (status?.status !== "sesuai") {
               return status?.catatan;
            }
         },
      },
   ];

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Dokumen Pendukung</CardTitle>
         </CardHeader>
         <CardContent>
            <Table columns={columns} data={results || []} isLoading={isLoading} usePagination={false} total={results.length} />
         </CardContent>
      </Card>
   );
}
