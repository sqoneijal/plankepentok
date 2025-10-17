import Table from "@/components/table";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { getColumns } from "./column";
import { usePaguAnggaranFakultas } from "./init";

export default function Page() {
   const { data, isLoading, error, navigate, limit, offset } = usePaguAnggaranFakultas();

   if (error) {
      toast.error(error?.message);
      queryClient.removeQueries({ queryKey: ["pengaturan", limit, offset] });
   }

   return (
      <Table
         columns={getColumns({ navigate, limit, offset })}
         data={Array.isArray(data?.results) ? data?.results : []}
         total={data?.total ?? 0}
         isLoading={isLoading}
      />
   );
}
