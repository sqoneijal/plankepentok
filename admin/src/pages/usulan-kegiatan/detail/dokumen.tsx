import Table from "@/components/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
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
   approve: null;
}

const UploadedCell: React.FC<{ value: string }> = ({ value }) => new Date(value).toLocaleString();

const UploadedTableCell = ({ getValue }: { getValue: () => unknown }) => <UploadedCell value={getValue() as string} />;

const ModifiedCell: React.FC<{ value: string | null }> = ({ value }) => (value ? new Date(value).toLocaleString() : "-");

const ModifiedTableCell = ({ getValue }: { getValue: () => unknown }) => <ModifiedCell value={getValue() as string | null} />;

const AksiCell: React.FC<{ value: string }> = ({ value }) => (
   <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
      Lihat Dokumen
   </a>
);

const AksiTableCell = ({ getValue }: { getValue: () => unknown }) => <AksiCell value={getValue() as string} />;

export default function Dokumen({ endpoint, id }: Readonly<{ endpoint: string; id: string | undefined }>) {
   const { results, isLoading } = useGetQueryDetail(endpoint, `${id}/dokumen`);

   const columns: Array<ColumnDef<DokumenItem>> = [
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
         accessorKey: "uploaded",
         header: "Uploaded",
         cell: UploadedTableCell,
      },
      {
         accessorKey: "modified",
         header: "Modified",
         cell: ModifiedTableCell,
      },
      {
         accessorKey: "user_modified",
         header: "User Modified",
      },
      {
         accessorKey: "path_file",
         header: "Aksi",
         cell: AksiTableCell,
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
