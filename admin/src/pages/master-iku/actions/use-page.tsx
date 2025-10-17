import { Button } from "@/components/ui/button";
import { useHeaderButton, useTablePagination } from "@/hooks/store";
import { queryClient } from "@/lib/queryClient";
import { useApiQuery, usePostMutation } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export function useMasterIKUActionsPage() {
   const { setButton } = useHeaderButton();
   const { pagination } = useTablePagination();
   const { id_iku_master } = useParams();

   const navigate = useNavigate();
   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   useEffect(() => {
      setButton(
         <Button variant="outline" size="sm" onClick={() => navigate("/master-iku")}>
            Batal
         </Button>
      );
      return () => {
         setButton(<div />);
      };
   }, [setButton, navigate]);

   const [formData, setFormData] = useState<Lists>({});
   const [errors, setErrors] = useState<Lists>({});

   const submit = usePostMutation<{ errors: Lists }>("/master-iku/actions");

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      submit.mutate(
         {
            ...formData,
         },
         {
            onSuccess: (data) => {
               setErrors(data?.errors ?? {});
               if (data?.status) {
                  queryClient.refetchQueries({
                     queryKey: ["master-iku", limit, offset],
                  });
                  toast.success(data?.message);
                  navigate("/master-iku");
                  return;
               }

               toast.error(data?.message);
            },
            onError: (error: Error) => {
               toast.error(error.message);
            },
         }
      );
   };

   const { data, isLoading, error } = useApiQuery<Lists>({
      queryKey: ["master-iku", id_iku_master],
      url: `/master-iku/actions/${id_iku_master}`,
      options: { enabled: !!id_iku_master },
   });

   useEffect(() => {
      if (id_iku_master && data?.data) {
         if (data.status) {
            setFormData((prev) => (Object.keys(prev).length === 0 ? data.data! : prev));
         } else {
            toast.error("Data tidak ditemukan.");
            navigate("/referensi/kategori-sbm");
         }
      }
   }, [data, id_iku_master, navigate]);

   if (error) {
      toast.error(error?.message);
      queryClient.removeQueries({ queryKey: ["master-iku", id_iku_master] });
   }

   return { formData, setFormData, errors, submit, handleSubmit, data, isLoading };
}
