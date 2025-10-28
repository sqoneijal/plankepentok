import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
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

const StatusCell = ({ getValue }: { getValue: () => unknown }) => {
   const approve = getValue() as ApproveStatus;
   return <Badge className={getBadgeClass(approve)}>{getBadgeText(approve)}</Badge>;
};

export default function Dokumen({ endpoint, id }: Readonly<{ endpoint: string; id: string | undefined }>) {
   const { results, isLoading } = useGetQueryDetail(endpoint, `${id}/dokumen`);

   const columns: Array<ColumnDef<DokumenItem>> = [
      {
         accessorKey: "approve",
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
