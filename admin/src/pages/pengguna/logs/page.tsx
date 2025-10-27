import Table from "@/components/table";
import { useGetQuery } from "@/hooks/useGetQuery";
import { getColumns } from "./column";

const endpoint = "/pengguna/logs";

export default function Page() {
   const { results, total, isLoading } = useGetQuery(endpoint);

   return <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} />;
}
