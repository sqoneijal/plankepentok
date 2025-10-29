import Table from "@/components/table";
import { UseAuth } from "@/hooks/auth-context";
import { useGetQuery } from "@/hooks/useGetQuery";
import { useNavigate } from "react-router";
import { getColumns } from "./column";

const endpoint = "/verifikasi-usulan/pengajuan";

export default function Page() {
   const { user } = UseAuth();
   const { results, total, isLoading } = useGetQuery(endpoint, { username: String(user?.preferred_username) });

   const navigate = useNavigate();

   return <Table columns={getColumns(endpoint, navigate)} data={results} total={total} isLoading={isLoading} />;
}
