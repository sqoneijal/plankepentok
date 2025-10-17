import { useHeaderButton } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { usePostMutation } from "@/hooks/usePostMutation";
import { usePutMutation } from "@/hooks/usePutMutation";
import { LinkButton } from "@/lib/helpers";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export type FormData = Record<string, string>;

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
            navigate("/pengaturan");
            return;
         }
         toast.error(response?.message);
      },
      onError: (error: Error) => {
         toast.error(`Gagal: ${error?.message}`);
      },
   });
};

export function useInitPage() {
   const { setButton } = useHeaderButton();

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   useEffect(() => {
      setButton(<LinkButton label="Batal" url="/pengaturan" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   return { formData, setFormData, errors, setErrors };
}

export function useGetDetailData(id?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/pengaturan/${id}`,
      options: { enabled: !!id },
   });

   if (error) {
      toast.error(error?.message);
   }

   const content = data?.results ?? {};

   return { content, isLoading };
}

export function useCreateData(formData: FormData, setErrors: (errors: FormData) => void) {
   const { mutate, isPending } = usePostMutation<FormData, unknown>("/pengaturan", (data) => ({ ...data }), [[`/pengaturan`]]);

   const navigate = useNavigate();

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors, navigate);
   };

   return { onSubmit, isPending };
}

export function useUpdateData(id: string | undefined, formData: FormData, setErrors: (errors: FormData) => void) {
   const navigate = useNavigate();

   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/pengaturan/${id}`, (data) => ({ id, ...data }), [
      [`/pengaturan/${id}`],
      [`/pengaturan`],
   ]);

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors, navigate);
   };

   return { onSubmit, isPending };
}
