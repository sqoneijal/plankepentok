import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type UseApiQueryProps = {
   queryKey?: string | Array<unknown>;
   url: string;
   params?: Record<string, unknown>;
   options?: {
      enabled?: boolean;
      queryKey?: Array<string | number>;
   };
};

export const useApiQuery = ({ queryKey, url, options, params }: UseApiQueryProps) => {
   const queryString = params
      ? new URLSearchParams(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]))).toString()
      : "";
   const fullUrl = `${import.meta.env.VITE_API_URL}${url}?${queryString}`;

   return useQuery({
      queryKey: Array.isArray(queryKey) ? [fullUrl, queryString] : [url, params],
      queryFn: async () => {
         const response = await fetch(fullUrl);
         if (!response.ok) {
            toast.error("Failed to fetch data");
         }
         return response.json();
      },
      ...options,
   });
};
