import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         retry: 2,
         refetchOnWindowFocus: false,
         staleTime: 1000 * 60,
         gcTime: 1000 * 60 * 5,
      },
      mutations: {
         retry: 1,
      },
   },
});

// ✅ Global error handling untuk query
queryClient.getQueryCache().subscribe((event) => {
   if (event.query && event.query.state.status === "error") {
      const error = event.query.state.error;
      if (error instanceof Error) {
         toast.error(error.message);
      }
   }
});

// ✅ Global error handling untuk mutation
queryClient.getMutationCache().subscribe((event) => {
   if (event.mutation && event.mutation.state.status === "error") {
      const error = event.mutation.state.error;
      if (error instanceof Error) {
         toast.error(error.message);
      }
   }
});

declare global {
   interface Window {
      __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
   }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;
