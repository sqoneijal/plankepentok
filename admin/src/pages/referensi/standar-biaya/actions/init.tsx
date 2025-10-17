import { useHeaderButton } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { usePostMutation } from "@/hooks/usePostMutation";
import { usePutMutation } from "@/hooks/usePutMutation";
import { LinkButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type FormData = Record<string, string>;

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: FormData;
};

const handleSubmit = (
   mutate: (data: FormData, options: { onSuccess: (response: ResponseType) => void; onError: (error: Error) => void }) => void,
   formData: FormData,
   setErrors: (errors: FormData) => void,
   navigate: (path: string) => void
) => {
   mutate(formData, {
      onSuccess: (response: ResponseType) => {
         setErrors(response?.errors || {});
         if (response?.status) {
            toast.success(response?.message);
            navigate("/referensi/standar-biaya");
            return;
         }
         toast.error(response?.message);
      },
      onError: (error: Error) => {
         toast.error(`Gagal: ${error?.message}`);
      },
   });
};

export function useOptions() {
   const { data: kategoriSBM, isLoading: isLoadingKategoriSBM } = useApiQuery({
      url: "/options/kategori-sbm",
   });

   const { data: unitSatuan, isLoading: isLoadingUnitSatuan } = useApiQuery({
      url: "/options/unit-satuan",
      options: { enabled: !isLoadingKategoriSBM },
   });

   return { kategoriSBM: kategoriSBM?.results, unitSatuan: unitSatuan?.results, isLoadingKategoriSBM, isLoadingUnitSatuan };
}

export function useInitPage() {
   const { setButton } = useHeaderButton();

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   useEffect(() => {
      setButton(<LinkButton label="Batal" url="/referensi/standar-biaya" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   return { formData, setFormData, errors, setErrors };
}

export function useGetDetailData(id?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/referensi/standar-biaya/${id}`,
      options: { enabled: !!id },
   });

   if (error) {
      toast.error(error?.message);
   }

   const content = data?.data ?? {};

   return { content, isLoading };
}

export function useCreateData(formData: FormData, setErrors: (errors: FormData) => void) {
   const { mutate, isPending } = usePostMutation<FormData, unknown>("/referensi/standar-biaya", (data) => ({ ...data }), [
      [`/referensi/standar-biaya`],
   ]);

   const navigate = useNavigate();

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors, navigate);
   };

   return { onSubmit, isPending };
}

export function useUpdateData(id: string | undefined, formData: FormData, setErrors: (errors: FormData) => void) {
   const navigate = useNavigate();

   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/referensi/standar-biaya/${id}`, (data) => ({ id, ...data }), [
      [`/referensi/standar-biaya/${id}`],
      [`/referensi/standar-biaya`],
   ]);

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors, navigate);
   };

   return { onSubmit, isPending };
}
