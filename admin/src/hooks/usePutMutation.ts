import { useMutation } from "@tanstack/react-query";
import { UseAuth } from "./auth-context";
import { queryClient } from "./queryClient";

export const usePutMutation = <TData, TTransformed = TData>(url: string, transformData?: (data: TData) => TTransformed) => {
   const { token, user } = UseAuth();

   return useMutation({
      mutationFn: async (data: TData) => {
         const transformed = transformData ? transformData(data) : (data as unknown as TTransformed);
         const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...transformed, user_modified: user?.preferred_username }),
         });

         const errorData = await response.json();

         if (response.ok) {
            return errorData;
         }

         throw errorData;
      },
      onSuccess: (response) => {
         const { success, refetchQuery } = response;
         if (success && Array.isArray(refetchQuery)) {
            for (const queryKey of refetchQuery) {
               const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
               queryClient.invalidateQueries({ queryKey: [url], exact: false });
            }
         }
      },
   });
};
