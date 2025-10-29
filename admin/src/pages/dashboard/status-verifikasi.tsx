import Table from "@/components/table";
import { useGetQuery } from "@/hooks/useGetQuery";
import { getColumns } from "./column-status-verifikasi";

export default function StatusVerifikasi({ endpoint }: Readonly<{ endpoint: string }>) {
   const { results, total, isLoading } = useGetQuery(`${endpoint}/status-verifikasi`);

   return <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} className="mt-4" />;
}
