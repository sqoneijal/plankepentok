import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFirstHash } from "@/helpers/init";
import { Suspense } from "react";
import { useLocation, useNavigate } from "react-router";
import { loadingElementSecond } from "../helpers";
import { tabsList } from "./navigation";

export default function Page() {
   const location = useLocation();
   const navigate = useNavigate();

   return (
      <div className="overflow-hidden rounded-lg border shadow-sm p-4">
         <Tabs defaultValue={getFirstHash(location.hash)}>
            <TabsList>
               {tabsList.map((row) => (
                  <TabsTrigger key={row.key} value={row.key} onClick={() => navigate(row.key)}>
                     {row.label}
                  </TabsTrigger>
               ))}
            </TabsList>
            {tabsList.map((row) => (
               <TabsContent key={row.key} value={row.key}>
                  <Suspense fallback={loadingElementSecond}>{row.element}</Suspense>
               </TabsContent>
            ))}
         </Tabs>
      </div>
   );
}
