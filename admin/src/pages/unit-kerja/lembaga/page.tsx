import Table from "@/components/table";
import { useHeaderButton } from "@/hooks/store";
import { useGetQuery } from "@/hooks/useGetQuery";
import { LinkButton } from "@/lib/helpers";
import { useEffect } from "react";
import { getColumns } from "./column";

const endpoint = "/unit-kerja/lembaga";

export default function Page() {
   const { setButton } = useHeaderButton();

   useEffect(() => {
      setButton(<LinkButton label="Tambah " url={`${endpoint}/actions`} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const { results, total, isLoading } = useGetQuery(endpoint);

   return <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />;
}
