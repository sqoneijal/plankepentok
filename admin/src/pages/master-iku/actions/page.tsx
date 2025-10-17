import { FormSelect, FormText, FormTextarea } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { btn_loading, getValue } from "@/helpers/init";
import { getTahunAnggaranOptions, loadingElement } from "./helper";
import { useMasterIKUActionsPage } from "./use-page";

export default function Page() {
   const { formData, setFormData, errors, submit, handleSubmit, isLoading } = useMasterIKUActionsPage();

   if (isLoading) return loadingElement;

   return (
      <div className="p-0">
         <div className="border rounded-lg p-6 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="row">
                  <div className="col-12 col-md-4 mb-3 sm:mb-0">
                     <FormSelect
                        label="Jenis IKU"
                        name="jenis"
                        value={getValue(formData, "jenis")}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, jenis: value }))}
                        errors={errors}
                        options={[
                           { value: "rektor", label: "Rektor" },
                           { value: "perguruan_tinggi", label: "Perguruan Tinggi" },
                        ]}
                     />
                  </div>
                  <div className="col-12 col-md-4 mb-3 sm:mb-0">
                     <FormText
                        label="Kode"
                        name="kode"
                        value={getValue(formData, "kode")}
                        onChange={(value) => setFormData((prev) => ({ ...prev, kode: value }))}
                        errors={errors}
                     />
                  </div>
                  <div className="col-12 col-md-4">
                     <FormSelect
                        label="Tahun Berlaku"
                        name="tahun_berlaku"
                        value={getValue(formData, "tahun_berlaku")}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, tahun_berlaku: value }))}
                        errors={errors}
                        options={getTahunAnggaranOptions()}
                     />
                  </div>
               </div>
               <div className="row">
                  <div className="col-12">
                     <FormTextarea
                        label="Deskripsi"
                        name="deskripsi"
                        value={getValue(formData, "deskripsi")}
                        onChange={(value) => setFormData((prev) => ({ ...prev, deskripsi: value }))}
                        errors={errors}
                     />
                  </div>
               </div>
               <Button type="submit" size="sm" disabled={submit.isPending}>
                  {submit.isPending ? btn_loading() : "Simpan"}
               </Button>
            </form>
         </div>
      </div>
   );
}
