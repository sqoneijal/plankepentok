import { useNavigate } from "react-router";
import { toast } from "sonner";
import { usePostMutation } from "./usePostMutation";
import { usePutMutation } from "./usePutMutation";

type ResponseType = {
   success?: boolean;
   message?: string;
   errors?: FormData;
};

type FormData = Record<string, string>;

type MutationError = {
   message?: string;
   errors?: FormData;
};

export const handleMutationSuccess = (response: ResponseType, setErrors?: (errors: FormData) => void) => {
   if (setErrors) setErrors(response?.errors || {});
   if (response?.success) {
      toast.success(response?.message);
      return;
   }
   toast.error(response?.message);
};

export const handleMutationError = (error: MutationError, setErrors?: (errors: FormData) => void) => {
   if (setErrors) setErrors(error.errors || {});
   toast.error(error?.message);
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

   const { mutate, isPending } = mutationHook(isUpdate ? `${endpoint}/${id}` : endpoint, (data) => ({ ...data }));

   const onSubmit = () => {
      mutate(
         { ...formData },
         {
            onSuccess: (response) => {
               handleMutationSuccess(response, setErrors);
               if (response.success) {
                  navigate(endpoint);
               }
            },
            onError: (error) => handleMutationError(error, setErrors),
         },
      );
   };

   return { onSubmit, isPending };
}
