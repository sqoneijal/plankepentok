import { covertToSTring } from "@/helpers/init";
import { UseAuth } from "@/hooks/auth-context";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { usePutMutation } from "@/hooks/usePutMutation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type Unit = {
   id: number;
   nama: string;
};

export type UnitPengusul = {
   biro_master?: Unit | null;
   fakultas_master?: Unit | null;
   lembaga_master?: Unit | null;
   sub_unit?: Unit | null;
   upt_master?: Unit | null;
};

export type FormData = Record<string, string | null | UnitPengusul>;

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: Record<string, string | null>;
};

const handleSubmit = (
   mutate: (data: FormData, options: { onSuccess: (response: ResponseType) => void; onError: (error: Error) => void }) => void,
   formData: FormData,
   setErrors?: (errors: Record<string, string | null>) => void
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
   const [errors, setErrors] = useState<Record<string, string | null>>({});

   const { results: data, isLoading } = useGetQueryDetail("/usulan-kegiatan", id);

   useEffect(() => {
      if (!isLoading && Object.keys(data).length > 0) {
         const converted = covertToSTring(data);
         setFormData({ ...(converted as Record<string, string>) });
      }
      return () => {};
   }, [isLoading, data]);

   return { formData, setFormData, errors, setErrors };
}

export function useUpdateInformasiUsulan(id: string | undefined, formData: FormData, setErrors: (errors: Record<string, string | null>) => void) {
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

   const results = data?.results ?? [];
   const total = data?.total || 0;

   return { results, total, isLoading };
}
