import { FormFile, FormText } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { btn_loading, getValue } from "@/helpers/init";
import { useDialog } from "@/hooks/store";
import type { Lists } from "@/types/init";
import { useActionDialog } from "./use-action-dialog";

function ActionDialog() {
   const { open, setOpen } = useDialog();
   const { formData, setFormData, errors, isPending, handleSubmit } = useActionDialog();

   return (
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Upload Dokumen Pendukung</DialogTitle>
               <DialogDescription>Silakan upload dokumen pendukung untuk melengkapi data Anda.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="w-full max-h-[calc(100vh-200px)] min-h-0">
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="row">
                     <div className="col-12 mb-3">
                        <FormText
                           label="Nama Dokumen"
                           name="nama_dokumen"
                           value={getValue(formData as Lists, "nama_dokumen")}
                           onChange={(value) => setFormData((prev) => ({ ...prev, nama_dokumen: value }))}
                           errors={errors}
                        />
                     </div>
                     <div className="col-12">
                        <FormFile
                           label="File Dokumen"
                           name="file_dokumen"
                           onChange={(value) => setFormData((prev) => ({ ...prev, file_dokumen: value }))}
                           errors={errors}
                        />
                     </div>
                  </div>
                  <Button type="submit" size="sm" disabled={isPending}>
                     {isPending ? btn_loading() : "Simpan"}
                  </Button>
               </form>
            </ScrollArea>
         </DialogContent>
      </Dialog>
   );
}

export default ActionDialog;
