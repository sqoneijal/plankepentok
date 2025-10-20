import Table from "@/components/table";
import { useGetQuery } from "@/lib/utils";
import { getColumns } from "./column";

const endpoint = "/pagu-anggaran";

export default function Page() {
   const { results, total, isLoading } = useGetQuery(endpoint);

   return <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />;
}
