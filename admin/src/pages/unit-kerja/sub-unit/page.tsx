import Table from "@/components/table";
import { getColumns } from "./column";
import { useInitPage, useTableData } from "./init";

export default function Page() {
   const { limit, offset } = useInitPage();
   const { results, total, isLoading } = useTableData({ limit, offset });

   return <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} />;
}
