import Table from "@/components/table";
import { toast } from "sonner";
import { getColumns } from "./column";
import { usePaguAnggaranFakultas } from "./init";

export default function Page() {
   const { data, isLoading, error, navigate, limit, offset } = usePaguAnggaranFakultas();

   if (error) return toast.error(error?.message);

   return (
      <Table
         columns={getColumns({ navigate, limit, offset })}
         data={Array.isArray(data?.results) ? data?.results : []}
         total={data?.total ?? 0}
         isLoading={isLoading}
      />
   );
}
