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
            navigate("/unit-kerja/upt");
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
      setButton(<LinkButton label="Batal" url="/unit-kerja/upt" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   return { formData, setFormData, errors, setErrors };
}

export function useGetDetailData(id?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `/unit-kerja/upt/${id}`,
      options: { enabled: !!id },
   });

   if (error) {
      toast.error(error?.message);
   }

   const content = data?.results ?? {};

   return { content, isLoading };
}

export function useCreateData(formData: FormData, setErrors: (errors: FormData) => void) {
   const { mutate, isPending } = usePostMutation<FormData, unknown>("/unit-kerja/upt", (data) => ({ ...data }), [[`/unit-kerja/upt`]]);

   const navigate = useNavigate();

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors, navigate);
   };

   return { onSubmit, isPending };
}

export function useUpdateData(id: string | undefined, formData: FormData, setErrors: (errors: FormData) => void) {
   const navigate = useNavigate();

   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/unit-kerja/upt/${id}`, (data) => ({ id, ...data }), [
      [`/unit-kerja/upt/${id}`],
      [`/unit-kerja/upt`],
   ]);

   const onSubmit = () => {
      handleSubmit(mutate, formData, setErrors, navigate);
   };

   return { onSubmit, isPending };
}
