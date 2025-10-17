import Table from "@/components/table";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { getColumns } from "./column";
import { usePerbaikanData } from "./init";

export default function Page() {
   const navigate = useNavigate();

   const { data, isLoading, error } = usePerbaikanData();

   if (error) return toast.error(error?.message);

   return (
      <Table
         columns={getColumns({ navigate })}
         data={Array.isArray(data?.results) ? data?.results : []}
         total={data?.total ?? 0}
         isLoading={isLoading}
      />
   );
}
