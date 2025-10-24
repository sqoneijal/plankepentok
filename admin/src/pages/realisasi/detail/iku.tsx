import Table from "@/components/table";
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

const formatJenis = (jenis: string) => {
   return jenis
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const DeskripsiCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const DeskripsiTableCell = ({ getValue }: { getValue: () => unknown }) => <DeskripsiCell value={getValue() as string} />;

const JenisCell: React.FC<{ value: string }> = ({ value }) => <span>{formatJenis(value)}</span>;

const JenisTableCell = ({ getValue }: { getValue: () => unknown }) => <JenisCell value={getValue() as string} />;

const columns = (): Array<ColumnDef<IkuItem>> => [
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

export default function Iku({ results, isLoading }: Readonly<{ results: Array<IkuItem>; isLoading: boolean }>) {
   return (
      <Card className="mt-4">
         <CardHeader>
            <CardTitle>IKU</CardTitle>
         </CardHeader>
         <CardContent>
            <Table columns={columns()} data={results} isLoading={isLoading} usePagination={false} total={results.length} />
         </CardContent>
      </Card>
   );
}
