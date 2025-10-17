import { getValue } from "@/helpers/init";

export const loadingElement = (
   <div className="flex items-center justify-center from-slate-50 to-slate-100 min-h-[500px]">
      <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
         <p className="text-gray-600 font-medium">Memuat data...</p>
      </div>
   </div>
);

import type { Lists } from "@/types/init";

export const getStatusFromData = (dataArray: Lists): "submitted" | "verified" | "rejected" | undefined => {
   const statusValue = getValue(dataArray, "status_usulan");
   return ["submitted", "verified", "rejected"].includes(statusValue) ? (statusValue as "submitted" | "verified" | "rejected") : undefined;
};
