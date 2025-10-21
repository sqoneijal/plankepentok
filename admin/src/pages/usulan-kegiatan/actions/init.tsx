import { covertToSTring } from "@/helpers/init";
import { UseAuth } from "@/hooks/auth-context";
import { useApiQuery } from "@/hooks/useApiQuery";
import { usePutMutation } from "@/hooks/usePutMutation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type FormData = Record<string, string | null>;

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: FormData;
};

const handleSubmit = (
   mutate: (data: FormData, options: { onSuccess: (response: ResponseType) => void; onError: (error: Error) => void }) => void,
   formData: FormData,
   setErrors?: (errors: FormData) => void
) => {
   mutate(formData, {
      onSuccess: (response: ResponseType) => {
         if (setErrors) setErrors(response?.errors || {});
         if (response?.status) {
            toast.success(response?.message);
            return;
         }
         toast.error(response?.message);
      },
      onError: (error: Error) => {
         toast.error(`Gagal: ${error?.message}`);
      },
   });
};

export function useInitPage(id?: string) {
   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   const { data, isLoading, error } = useApiQuery({
      url: `/usulan-kegiatan/${id}`,
      options: { enabled: !!id },
   });

   if (error) {
      toast.error(error?.message);
   }

   const content = data?.results ?? {};

   useEffect(() => {
      if (!isLoading && Object.keys(data).length > 0) {
         setFormData({ ...content });
      }
      return () => {};
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isLoading, content]);

   return { formData, setFormData, errors, setErrors };
}

export function useUpdateInformasiUsulan(id: string | undefined, formData: FormData, setErrors: (errors: FormData) => void) {
   const { user } = UseAuth();

   const { mutate, isPending } = usePutMutation<FormData, unknown>(
      `/usulan-kegiatan/${id}`,
      (data) => ({ ...covertToSTring(data), operator_input: String(user?.preferred_username) }),
      [[`/usulan-kegiatan/${id}`]]
   );

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors);
   };

   return { onSubmit, isPending };
}

export function useGetRelasiIKU(id_usulan_kegiatan?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/usulan-kegiatan/${id_usulan_kegiatan}/relasi-iku`,
      options: { enabled: !!id_usulan_kegiatan },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = data?.results ?? {};
   const total = data?.total || 0;

   return { results, total, isLoading };
}
