import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

function LoadingSkeletonEditContent() {
   return (
      <div className="min-h-screen p-4 space-y-4">
         <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
         </div>

         {/* Search bar skeleton */}
         <Skeleton className="h-10 w-full max-w-sm" />
      </div>
   );
}

function LoadingSkeleton() {
   return (
      <div className="min-h-screen p-4 space-y-4">
         {/* Header skeleton */}
         <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
         </div>

         {/* Search bar skeleton */}
         <Skeleton className="h-10 w-full max-w-sm" />

         {/* Content grid skeleton */}
         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="space-y-2 p-4 border rounded-lg">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
               </div>
            ))}
         </div>
      </div>
   );
}

function AppSidebarSkeleton() {
   return (
      <div className="flex h-full w-[200px] flex-col">
         {/* Header skeleton */}
         <div className="flex h-16 shrink-0 items-center gap-2 px-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex flex-col gap-1">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-3 w-8" />
            </div>
         </div>

         {/* Content skeleton */}
         <div className="flex-1 overflow-auto px-3 py-2">
            <div className="space-y-2">
               {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-2">
                     <Skeleton className="h-4 w-4" />
                     <Skeleton className="h-4 flex-1" />
                  </div>
               ))}
            </div>
         </div>

         {/* Footer skeleton */}
         <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-t">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1 flex-1">
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-3 w-16" />
            </div>
         </div>
      </div>
   );
}

function AppHeaderSkeleton() {
   return (
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
         <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-24" />
            <div className="ml-auto flex items-center gap-2">
               <Skeleton className="h-8 w-20" />
            </div>
         </div>
      </header>
   );
}

function FormInformasiUsulanSkeleton() {
   return (
      <Card>
         <CardHeader>
            <Skeleton className="h-6 w-48" />
         </CardHeader>
         <CardContent>
            <div className="row space-y-4">
               <div className="flex gap-4">
                  <Skeleton className="h-10 w-1/6" />
                  <Skeleton className="h-10 w-1/4" />
                  <Skeleton className="h-10 w-1/6" />
                  <Skeleton className="h-10 w-1/6" />
               </div>
               <div className="flex gap-4">
                  <Skeleton className="h-10 w-1/4" />
                  <Skeleton className="h-10 w-1/4" />
                  <Skeleton className="h-10 w-1/6" />
               </div>
               <div className="flex gap-4">
                  <Skeleton className="h-20 w-1/3" />
                  <Skeleton className="h-20 w-1/3" />
                  <Skeleton className="h-20 w-1/3" />
               </div>
            </div>
         </CardContent>
      </Card>
   );
}

function FormRencanaAnggaranSkeleton() {
   return (
      <form>
         <div className="row">
            <Skeleton className="h-10 w-full" />
         </div>
         <div className="row">
            <Skeleton className="h-10 w-full" />
         </div>
         <div className="row">
            <Skeleton className="h-10 w-full" />
         </div>
         <div className="row">
            <Skeleton className="h-10 w-full" />
         </div>
         <div className="row">
            <Skeleton className="h-20 w-full" />
         </div>
         <Skeleton className="h-10 w-32 mt-4" />
      </form>
   );
}

function FormSubUnitSkeleton() {
   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <div className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-6">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-6">
                     <Skeleton className="h-10 w-full" />
                  </div>
               </div>
               <Skeleton className="h-10 w-32" />
            </div>
         </div>
      </div>
   );
}

function FormPengaturanSkeleton() {
   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-3">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
               </div>
               <Skeleton className="h-10 w-32" />
            </form>
         </div>
      </div>
   );
}

function FormUnitSatuanSkeleton() {
   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-10">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
               </div>
               <div className="row">
                  <div className="col-12">
                     <Skeleton className="h-20 w-full" />
                  </div>
               </div>
               <Skeleton className="h-10 w-32" />
            </form>
         </div>
      </div>
   );
}

function FormKategoriSBMSkeleton() {
   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-10">
                     <Skeleton className="h-10 w-full" />
                  </div>
               </div>
               <div className="row">
                  <div className="col-12">
                     <Skeleton className="h-20 w-full" />
                  </div>
               </div>
               <Skeleton className="h-10 w-32" />
            </form>
         </div>
      </div>
   );
}

function FormStandarBiayaSkeleton() {
   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-4">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
               </div>
               <div className="row">
                  <div className="col-12">
                     <Skeleton className="h-20 w-full" />
                  </div>
               </div>
               <Skeleton className="h-10 w-32" />
            </form>
         </div>
      </div>
   );
}

function FormDetailHargaSBMSkeleton() {
   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-4">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
               </div>
               <div className="row">
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="col-12 col-md-2">
                     <Skeleton className="h-10 w-full" />
                  </div>
               </div>
               <Skeleton className="h-10 w-32" />
            </form>
         </div>
      </div>
   );
}

function InfoPaguUniversitasSkeleton() {
   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
               <Skeleton className="h-4 w-3/4 mb-2" />
               <Skeleton className="h-6 w-full" />
            </div>
         ))}
      </div>
   );
}

function PaguTableSkeleton() {
   return (
      <>
         {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
               <TableCell colSpan={2} className="font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words">
                  <Skeleton className="h-4 w-full" />
               </TableCell>
               <TableCell className="font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words">
                  <Skeleton className="h-4 w-full" />
               </TableCell>
               <TableCell className="font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words">
                  <Skeleton className="h-4 w-full" />
               </TableCell>
               <TableCell className="font-medium p-1 pl-2 px-3 py-1 text-sm text-gray-900 h-8 whitespace-normal break-words">
                  <Skeleton className="h-4 w-full" />
               </TableCell>
            </TableRow>
         ))}
      </>
   );
}

export {
   AppHeaderSkeleton,
   AppSidebarSkeleton,
   FormDetailHargaSBMSkeleton,
   FormInformasiUsulanSkeleton,
   FormKategoriSBMSkeleton,
   FormPengaturanSkeleton,
   FormRencanaAnggaranSkeleton,
   FormStandarBiayaSkeleton,
   FormSubUnitSkeleton,
   FormUnitSatuanSkeleton,
   InfoPaguUniversitasSkeleton,
   LoadingSkeleton,
   LoadingSkeletonEditContent,
   PaguTableSkeleton,
};
