import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/auth-context";
import { queryClient } from "@/hooks/queryClient.ts";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
   <QueryClientProvider client={queryClient}>
      <AuthProvider>
         <BrowserRouter>
            <Toaster position="top-center" />
            <App />
         </BrowserRouter>
      </AuthProvider>
   </QueryClientProvider>
);
