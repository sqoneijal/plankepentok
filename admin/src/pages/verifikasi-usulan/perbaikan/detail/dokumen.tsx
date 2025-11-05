import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";
import React from "react";

interface VerifikasiItem {
   id_referensi: number;
   table_referensi: string;
   status: string | null;
   catatan?: string;
}

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
   approve: string | null;
}

const AksiCell: React.FC<{ value: string }> = ({ value }) => (
   <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      Lihat Dokumen
   </a>
);

const AksiTableCell = ({ getValue }: { getValue: () => unknown }) => <AksiCell value={getValue() as string} />;

const getApproveBadgeClass = (approve: string | null | undefined) => {
   if (approve == null) return "bg-yellow-500 text-white hover:bg-yellow-600";
   if (approve === "sesuai") return "bg-green-500 text-white hover:bg-green-600";
   return "bg-red-500 text-white hover:bg-red-600";
};

const getApproveStatus = (approve: string | null) => {
   if (approve === null) return "Draft";
   if (approve === "sesuai") return "Sesuai";
   if (approve === "tidak_sesuai") return "Tidak Sesuai";
   return "Draft";
};

const columns = ({ verifikasi }: { verifikasi: Array<VerifikasiItem> }): Array<ColumnDef<DokumenItem>> => [
   {
      accessorKey: "id",
      header: "Status",
      cell: ({ getValue }) => {
         const value = verifikasi.find(
            (e: { id_referensi: number; table_referensi: string }) => e.id_referensi === getValue() && e.table_referensi === "tb_dokumen_pendukung"
         );

         return <Badge className={getApproveBadgeClass(value?.status)}>{getApproveStatus(value?.status as string)}</Badge>;
      },
      meta: { className: "w-[10px]" },
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
      header: "Catatan Perbaikan",
      cell: ({ getValue }) => {
         const value = verifikasi.find(
            (e: { id_referensi: number; table_referensi: string }) => e.id_referensi === getValue() && e.table_referensi === "tb_dokumen_pendukung"
         );
         if (value && value?.status === "tidak_sesuai") return value?.catatan;
      },
   },
];

export default function Dokumen({
   results,
   isLoading,
   verifikasi,
}: Readonly<{
   results: Array<DokumenItem>;
   isLoading: boolean;
   verifikasi: Array<VerifikasiItem>;
}>) {
   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Dokumen Pendukung</CardTitle>
         </CardHeader>
         <CardContent>
            <Table columns={columns({ verifikasi })} data={results || []} isLoading={isLoading} usePagination={false} total={results.length} />
         </CardContent>
      </Card>
   );
}
