import Table from "@/components/table";
import { useGetQuery } from "@/hooks/useGetQuery";
import { getColumns } from "./column";

const endpoint = "/pagu-anggaran";

export default function Page() {
   const { results, total, isLoading } = useGetQuery(endpoint);

   return <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />;
}
