import { UseAuth } from "@/hooks/auth-context";
import { useDialog, useTablePagination } from "@/hooks/store";
import { post } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { Lists } from "@/types/init";
import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

interface DokumenFormData {
   nama_dokumen?: string | null;
   file_dokumen?: FileList | null;
   [key: string]: string | FileList | null | undefined;
}

export function useActionDialog() {
   const { setOpen } = useDialog();
   const { pagination } = useTablePagination();
   const { id_usulan_kegiatan } = useParams();

   const [formData, setFormData] = useState<DokumenFormData>({});
   const [errors, setErrors] = useState<Lists>({});
   const [isPending, setIsPending] = useState(false);

   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const { user } = UseAuth();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsPending(true);

      try {
         const data = new FormData();
         Object.entries(formData).forEach(([key, value]) => {
            if (value instanceof FileList) {
               if (value.length > 0) {
                  data.append(key, value[0]);
               }
            } else if (value != null) {
               data.append(key, value.toString());
            }
         });
         data.append("user_modified", user?.preferred_username || "");
         const res = await post(`/usulan-kegiatan/${id_usulan_kegiatan}/dokumen/actions`, data);
         const responseData = res.data;

         setErrors(responseData?.errors ?? {});
         if (responseData?.status) {
            setOpen(false);
            setFormData({});
            queryClient.refetchQueries({
               queryKey: ["usulan-kegiatan", id_usulan_kegiatan, "dokumen", limit, offset],
            });
            toast.success(responseData?.message);
            return;
         }

         toast.error(responseData?.message);
      } catch (error) {
         toast.error((error as Error).message);
      } finally {
         setIsPending(false);
      }
   };

   return { formData, setFormData, errors, isPending, handleSubmit };
}
