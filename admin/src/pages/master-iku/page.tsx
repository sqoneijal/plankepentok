import Table from "@/components/table";
import { useHeaderButton } from "@/hooks/store";
import { LinkButton } from "@/lib/helpers";
import { useGetQuery } from "@/lib/utils";
import { useEffect } from "react";
import { getColumns } from "./column";

const endpoint = "/master-iku";

export default function Page() {
   const { setButton } = useHeaderButton();
   const { results, total, isLoading } = useGetQuery(endpoint);

   useEffect(() => {
      setButton(<LinkButton label="Tambah Master IKU" url={`${endpoint}/actions`} />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   return <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} />;
}
