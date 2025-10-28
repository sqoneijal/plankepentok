import { Skeleton } from "@/components/ui/skeleton";
import { covertToSTring, getValue, objectLength } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { useGetQueryDetail } from "@/hooks/useGetQueryDetail";
import { FormInput, LinkButton, SubmitButton } from "@/lib/helpers";
import { useSubmitData } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const endpoint = "/unit-kerja/biro";

type FormData = Record<string, string>;

export default function Page() {
   const { id } = useParams();
   const isEdit = !!id;

   const { setButton } = useHeaderButton();

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<FormData>({});

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={endpoint} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton]);

   const { results, isLoading } = useGetQueryDetail(endpoint, id);
   const { onSubmit, isPending } = useSubmitData({ id, formData, setErrors, endpoint });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
   };

   useEffect(() => {
      if (id && !isLoading && objectLength(results)) {
         const data = covertToSTring(results);
         setFormData({ ...(data as FormData) });
      }
      return () => {};
   }, [id, isLoading, results]);

   if (isLoading) {
      return (
         <div className="p-0">
            <div className="border rounded-lg p-6 shadow-sm bg-white">
               <div className="space-y-4">
                  <div className="row">
                     <div className="col-12">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                     </div>
                  </div>
                  <Skeleton className="h-10 w-32" />
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <div className="col-12">
                     <FormInput
                        label="Nama Biro"
                        value={getValue(formData, "nama")}
                        onChange={(value) => setFormData((prev) => ({ ...prev, nama: value }))}
                        name="nama"
                        errors={errors}
                     />
                  </div>
               </div>
               <SubmitButton label={isEdit ? "Perbarui" : "Simpan"} isLoading={isPending} />
            </form>
         </div>
      </div>
   );
}
