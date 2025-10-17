import Table from "@/components/table";
import { getColumns } from "./column";
import { useInitPage } from "./init";

export default function Page() {
   const { results, total, isLoading } = useInitPage();

   return <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} />;
}
