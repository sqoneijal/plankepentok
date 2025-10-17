import { Button } from "@/components/ui/button";
import { cleanRupiah, getValue } from "@/helpers/init";
import { useHeaderButton, useTablePagination } from "@/hooks/store";
import { queryClient } from "@/lib/queryClient";
import { useApiQuery, usePostMutation } from "@/lib/useApi";
import type { Lists } from "@/types/init";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export function useActions() {
   const navigate = useNavigate();

   const { pagination } = useTablePagination();
   const { setButton } = useHeaderButton();

   const limit = pagination.pageSize;
   const offset = pagination.pageIndex * pagination.pageIndex;

   const [formData, setFormData] = useState<Lists>({});
   const [errors, setErrors] = useState<Lists>({});

   useEffect(() => {
      setButton(
         <Button variant="outline" size="sm" onClick={() => navigate("/pengaturan")}>
            Batal
         </Button>
      );
      return () => {
         setButton(<div />);
      };
   }, [setButton, navigate]);

   const submit = usePostMutation<{ errors: Lists }>("/pengaturan/actions");

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      submit.mutate(
         {
            ...formData,
            total_pagu: cleanRupiah(getValue(formData, "total_pagu")),
         },
         {
            onSuccess: (data) => {
               setErrors(data?.errors ?? {});
               if (data?.status) {
                  queryClient.refetchQueries({
                     queryKey: ["pengaturan", limit, offset],
                  });
                  toast.success(data?.message);
                  navigate("/pengaturan");
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

   return { handleSubmit, submit, formData, setFormData, errors };
}

export function useEditData() {
   const { id_pengaturan } = useParams();

   const { data, isLoading, error } = useApiQuery<Lists>({
      queryKey: ["pengaturan", "actions", id_pengaturan],
      url: `/pengaturan/actions/${id_pengaturan}`,
      options: { enabled: !!id_pengaturan },
   });

   if (error) {
      toast.error(error?.message);
      queryClient.removeQueries({ queryKey: ["pengaturan", "actions", id_pengaturan] });
   }

   return { data, isLoading, error };
}
