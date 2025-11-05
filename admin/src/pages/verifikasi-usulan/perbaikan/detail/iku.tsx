import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";

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
   approve: string | null;
   modified: string | null;
   iku_master: IkuMaster;
}

interface VerifikasiItem {
   id_referensi: number;
   table_referensi: string;
   status: string | null;
   catatan?: string;
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

const ApproveCell: React.FC<{ approve: string | null }> = ({ approve = null }) => (
   <Badge className={getApproveBadgeClass(approve)}>{getApproveStatus(approve)}</Badge>
);

const DeskripsiCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const DeskripsiTableCell = ({ getValue }: { getValue: () => unknown }) => <DeskripsiCell value={getValue() as string} />;

const JenisCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const JenisTableCell = ({ getValue }: { getValue: () => unknown }) => <JenisCell value={getValue() as string} />;

const columns = ({ verifikasi }: { verifikasi: Array<VerifikasiItem> }): Array<ColumnDef<IkuItem>> => [
   {
      accessorKey: "id",
      header: "Status",
      cell: ({ getValue }) => {
         const value = verifikasi.find(
            (e: { id_referensi: number; table_referensi: string }) => e.id_referensi === getValue() && e.table_referensi === "tb_relasi_usulan_iku"
         );

         return <ApproveCell approve={value?.status ?? null} />;
      },
      meta: { className: "w-[10px]" },
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
      cell: ({ getValue }) => {
         const value = verifikasi.find(
            (e: { id_referensi: number; table_referensi: string }) => e.id_referensi === getValue() && e.table_referensi === "tb_relasi_usulan_iku"
         );
         if (value && value?.status === "tidak_sesuai") return value?.catatan;
      },
   },
];

export default function Iku({
   results,
   isLoading,
   verifikasi,
}: Readonly<{
   results: Array<IkuItem>;
   isLoading: boolean;
   verifikasi: Array<VerifikasiItem>;
}>) {
   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>IKU</CardTitle>
         </CardHeader>
         <CardContent>
            <Table columns={columns({ verifikasi })} data={results} isLoading={isLoading} usePagination={false} total={results.length} />
         </CardContent>
      </Card>
   );
}
