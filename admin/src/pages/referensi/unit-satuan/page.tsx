import Table from "@/components/table";
import { useHeaderButton } from "@/hooks/store";
import { useGetQuery } from "@/hooks/useGetQuery";
import { FormInput, LinkButton } from "@/lib/helpers";
import { useEffect, useMemo, useState } from "react";
import { getColumns } from "./column";

const endpoint = "/referensi/unit-satuan";

export default function Page() {
   const { setButton } = useHeaderButton();

   const [search, setSearch] = useState("");

   const actionButton = useMemo(() => <LinkButton label="Tambah" url={`${endpoint}/actions`} type="actions" />, []);

   useEffect(() => {
      setButton(actionButton);
      return () => {
         setButton(<div />);
      };
   }, [actionButton, setButton]);

   const { results, total, isLoading } = useGetQuery(endpoint, { search });

   return (
      <>
         <div className="mb-4 max-w-sm">
            <FormInput withLabel={false} label="Cari unit satuan..." onChange={(value) => setSearch(value)} value={search} />
         </div>
         <Table columns={getColumns(endpoint)} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
