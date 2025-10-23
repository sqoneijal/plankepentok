import { useTablePagination } from "@/hooks/store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { usePostMutation } from "@/hooks/usePostMutation";
import { usePutMutation } from "@/hooks/usePutMutation";
import { clsx, type ClassValue } from "clsx";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: FormData;
};

type FormData = Record<string, string>;

export function cn(...inputs: Array<ClassValue>) {
   return twMerge(clsx(inputs));
}

export function useGetQuery(enpoint: string, params?: FormData) {
   const { pagination } = useTablePagination();

   const limit = pagination?.pageSize;
   const offset = pagination?.pageIndex * pagination.pageSize;

   const { data, isLoading, error } = useApiQuery({
      url: enpoint,
      params: { limit: String(limit), offset: String(offset), ...params },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = Array.isArray(data?.results) ? data?.results : [];
   const total = data?.total || 0;

   return { results, total, isLoading };
}

export function useGetQueryDetail(endpoint: string, id?: string) {
   const { data, isLoading, error } = useApiQuery({
      url: `${endpoint}/${id}`,
      options: { enabled: !!id },
   });

   if (error) {
      toast.error(error?.message);
   }

   const results = data?.results ?? {};

   return { results, isLoading };
}

export const handleMutationSuccess = (response: ResponseType, setErrors?: (errors: FormData) => void) => {
   if (setErrors) setErrors(response?.errors || {});
   if (response?.status) {
      toast.success(response?.message);
      return;
   }
   toast.error(response?.message);
};

export const handleMutationError = (error: Error) => {
   toast.error(`Gagal: ${error?.message}`);
};

export function useSubmitData({
   id,
   formData,
   setErrors,
   endpoint,
}: {
   id: string | undefined;
   formData: FormData;
   setErrors: (errors: FormData) => void;
   endpoint: string;
}) {
   const navigate = useNavigate();
   const isUpdate = Boolean(id);

   const mutationHook = isUpdate ? usePutMutation<FormData, unknown> : usePostMutation<FormData, unknown>;
   const cacheKeys = isUpdate ? [[endpoint], [`${endpoint}/${id}`]] : [[endpoint]];

   const { mutate, isPending } = mutationHook(isUpdate ? `${endpoint}/${id}` : endpoint, (data) => ({ ...data }), cacheKeys);

   const onSubmit = () => {
      mutate(
         { ...formData },
         {
            onSuccess: (response) => {
               handleMutationSuccess(response, setErrors);
               if (response.status) {
                  navigate(endpoint);
               }
            },
            onError: handleMutationError,
         }
      );
   };

   return { onSubmit, isPending };
}
