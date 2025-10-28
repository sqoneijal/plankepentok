import { useNavigate } from "react-router";
import { toast } from "sonner";
import { usePostMutation } from "./usePostMutation";
import { usePutMutation } from "./usePutMutation";

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: FormData;
};

type FormData = Record<string, string>;

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
