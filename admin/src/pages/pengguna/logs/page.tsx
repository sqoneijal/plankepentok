import Table from "@/components/table";
import { useGetQuery } from "@/hooks/useGetQuery";
import { FormInput } from "@/lib/helpers";
import { useState } from "react";
import { getColumns } from "./column";

const endpoint = "/pengguna/logs";

export default function Page() {
   const [search, setSearch] = useState("");
   const { results, total, isLoading } = useGetQuery(endpoint, { search });

   return (
      <>
         <div className="row">
            <FormInput divClassName="col-12 col-md-6" label="Cari..." withLabel={false} onChange={(value) => setSearch(value)} value={search} />
         </div>
         <Table columns={getColumns()} data={results} total={total} isLoading={isLoading} />
      </>
   );
}
