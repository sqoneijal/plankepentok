import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { cn } from "@/lib/utils";
import type { ColumnDef, Row } from "@tanstack/react-table";

interface IkuMaster {
   id: number;
   jenis: string;
   kode: string;
   deskripsi: string;
   tahun_berlaku: string;
   uploaded: string | null;
   modified: string | null;
   user_modified: string | null;
}

interface IkuItem {
   id: number;
   id_usulan: number;
   id_iku: number;
   uploaded: string;
   user_modified: string;
   approve: boolean | null;
   modified: string | null;
   iku_master: IkuMaster;
   usulan_kegiatan: {
      verifikasi: Array<{
         id_referensi: number;
         status: string | null;
         catatan: string | null;
      }>;
   };
}

const getApproveStatus = (approve: string | null) => {
   if (approve === null) return "Draft";
   if (approve === "sesuai") return "Sesuai";
   if (approve === "tidak_sesuai") return "Tidak Sesuai";
   return "Draft";
};

const getApproveBadgeClass = (approve: string | null) => {
   if (approve === null) return "bg-yellow-500 text-white hover:bg-yellow-600";
   if (approve === "sesuai") return "bg-green-500 text-white hover:bg-green-600";
   return "bg-red-500 text-white hover:bg-red-600";
};

const formatJenis = (jenis: string) => {
   return jenis
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const ApproveCell: React.FC<{ approve: string | null }> = ({ approve }) => (
   <Badge className={cn(getApproveBadgeClass(approve), "text-xs")}>{getApproveStatus(approve)}</Badge>
);

const DeskripsiCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const DeskripsiTableCell = ({ getValue }: { getValue: () => unknown }) => <DeskripsiCell value={getValue() as string} />;

const JenisCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const JenisTableCell = ({ getValue }: { getValue: () => unknown }) => <JenisCell value={getValue() as string} />;

const StatusTableCell = ({ row }: { row: Row<IkuItem> }) => {
   const original = row.original;
   const verifikasi = original?.usulan_kegiatan?.verifikasi;
   const status =
      verifikasi?.find((e: { id_referensi: number; status: string | null; catatan: string | null }) => e.id_referensi === original.id)?.status ||
      null;
   return <ApproveCell approve={status} />;
};

const CatatanBerpaikanTableCell = ({ row }: { row: Row<IkuItem> }) => {
   const original = row.original;
   const verifikasi = original?.usulan_kegiatan?.verifikasi;
   const status =
      verifikasi?.find((e: { id_referensi: number; status: string | null; catatan: string | null }) => e.id_referensi === original.id) || null;

   if (status?.status !== "sesuai") {
      return status?.catatan;
   }
};

export default function Iku({ endpoint, id }: Readonly<{ endpoint: string; id: string | undefined }>) {
   const { results, isLoading } = useGetQueryDetail(endpoint, `${id}/relasi-iku`);

   const columns: Array<ColumnDef<IkuItem>> = [
      {
         accessorKey: "id",
         header: "status",
         cell: StatusTableCell,
      },
      {
         accessorKey: "iku_master.kode",
         header: "Kode",
      },
      {
         accessorKey: "iku_master.jenis",
         header: "Jenis",
         cell: JenisTableCell,
      },
      {
         accessorKey: "iku_master.tahun_berlaku",
         header: "Tahun Berlaku",
      },
      {
         accessorKey: "iku_master.deskripsi",
         header: "Deskripsi",
         cell: DeskripsiTableCell,
      },
      {
         accessorKey: "id",
         header: "Catatan Perbaikan",
         cell: CatatanBerpaikanTableCell,
      },
   ];

   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>IKU</CardTitle>
         </CardHeader>
         <CardContent>
            <Table columns={columns} data={results} isLoading={isLoading} usePagination={false} total={results.length} />
         </CardContent>
      </Card>
   );
}
