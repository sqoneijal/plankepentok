import Table from "@/components/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
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
   approve: boolean | null;
   modified: string | null;
   iku_master: IkuMaster;
}

const getApproveStatus = (approve: boolean | null) => {
   if (approve === null) return "Draft";
   return "Approved";
};

const getApproveBadgeClass = (approve: boolean | null) => {
   return approve === null ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-green-500 text-white hover:bg-green-600";
};

const formatJenis = (jenis: string) => {
   return jenis
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const ApproveCell: React.FC<{ approve: boolean | null }> = ({ approve }) => (
   <Badge className={getApproveBadgeClass(approve)}>{getApproveStatus(approve)}</Badge>
);

const ApproveTableCell = ({ getValue }: { getValue: () => unknown }) => <ApproveCell approve={getValue() as boolean | null} />;

const DeskripsiCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const DeskripsiTableCell = ({ getValue }: { getValue: () => unknown }) => <DeskripsiCell value={getValue() as string} />;

const JenisCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const JenisTableCell = ({ getValue }: { getValue: () => unknown }) => <JenisCell value={getValue() as string} />;

export default function Iku({ endpoint, id }: Readonly<{ endpoint: string; id: string | undefined }>) {
   const { results, isLoading } = useGetQueryDetail(endpoint, `${id}/relasi-iku`);

   const columns: Array<ColumnDef<IkuItem>> = [
      {
         accessorKey: "approve",
         header: "status",
         cell: ApproveTableCell,
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
