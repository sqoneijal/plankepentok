import Table from "@/components/table";
import { useHeaderButton } from "@/hooks/store";
import { useGetQuery } from "@/hooks/useGetQuery";
import { LinkButton } from "@/lib/helpers";
import { useEffect } from "react";
import { getColumns } from "./column";

const endpoint = "/referensi/jenis-usulan";

export default function Page() {
   const { results, total, isLoading } = useGetQuery(endpoint);

   const { setButton } = useHeaderButton();

   useEffect(() => {
      setButton(<LinkButton label="Tambah" url={`${endpoint}/actions`} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   return <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />;
}
