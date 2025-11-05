import Table from "@/components/table";
import { useGetQuery } from "@/hooks/useGetQuery";
import { useNavigate } from "react-router";
import { getColumns } from "./column";

const endpoint = "/verifikasi-usulan/perbaikan";

export default function Page() {
   const { results, total, isLoading } = useGetQuery(endpoint);

   const navigate = useNavigate();

   return <Table columns={getColumns(endpoint, navigate)} data={results} total={total} isLoading={isLoading} />;
}
