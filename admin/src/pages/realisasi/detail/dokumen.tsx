import Table from "@/components/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";
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
   approve: string | null;
}

const AksiCell: React.FC<{ value: string }> = ({ value }) => (
   <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      Lihat Dokumen
   </a>
);

const AksiTableCell = ({ getValue }: { getValue: () => unknown }) => <AksiCell value={getValue() as string} />;

const columns = (): Array<ColumnDef<DokumenItem>> => [
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
];

export default function Dokumen({ results, isLoading }: Readonly<{ results: Array<DokumenItem>; isLoading: boolean }>) {
   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>Dokumen Pendukung</CardTitle>
         </CardHeader>
         <CardContent>
            <Table columns={columns()} data={results || []} isLoading={isLoading} usePagination={false} total={results.length} />
         </CardContent>
      </Card>
   );
}
