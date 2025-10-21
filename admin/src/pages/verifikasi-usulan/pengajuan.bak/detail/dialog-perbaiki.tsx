import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { btn_loading } from "@/helpers/init";
import { useDialog, useTablePagination } from "@/hooks/store";
import { queryClient } from "@/lib/queryClient";
import { usePostMutation } from "@/lib/useApi";
import { lazy, Suspense, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { loadingElementSecond } from "../helpers";

const BundledEditor = lazy(() => import("@/components/bundle-editor"));

function DialogPerbaiki() {
   const { id_usulan_kegiatan } = useParams();
   const { open, setOpen } = useDialog();
   const { pagination } = useTablePagination();

   const navigate = useNavigate();
   const limit = pagination.pageSize;
   const offset = pagination.pageSize * pagination.pageIndex;

   const [catatan_perbaikan, setCatatan_perbaikan] = useState("");

   const submit = usePostMutation(`/verifikasi-usulan/pengajuan/${id_usulan_kegiatan}/perbaiki`);

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogContent className="max-h-[calc(100vh-200px)]">
            <DialogHeader>
               <DialogTitle>Catatan Perbaikan</DialogTitle>
               <DialogDescription>
                  Berikan izin kepada pengusul untuk memperbaiki pengajuan sebelum dilakukan proses verifikasi ulang.
               </DialogDescription>
            </DialogHeader>
            <ScrollArea className="w-full max-h-[calc(100vh-200px)] min-h-0">
               <Suspense fallback={loadingElementSecond}>
                  <BundledEditor
                     value={catatan_perbaikan}
                     onEditorChange={(content) => setCatatan_perbaikan(content)}
                     init={{
                        height: 500,
                        menubar: false,
                        plugins: ["advlist", "anchor", "autolink", "help", "image", "link", "lists", "searchreplace", "table", "wordcount"],
                        toolbar:
                           "undo redo | blocks | " +
                           "bold italic forecolor | alignleft aligncenter " +
                           "alignright alignjustify | bullist numlist outdent indent | " +
                           "removeformat | help",
                        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                     }}
                  />
               </Suspense>
            </ScrollArea>
            <Button
               type="submit"
               size="sm"
               disabled={submit.isPending}
               onClick={() => {
                  submit.mutate(
                     {
                        catatan_perbaikan,
                     },
                     {
                        onSuccess: (data) => {
                           if (data?.status) {
                              toast.success(data?.message);
                              queryClient.refetchQueries({ queryKey: ["verifikasi-usulan", "pengajuan", limit, offset] });
                              setOpen(false);
                              navigate("/verifikasi-usulan/pengajuan");
                              return;
                           }

                           toast.error(data?.message);
                        },
                        onError: (error: Error) => {
                           toast.error(error.message);
                        },
                     }
                  );
               }}>
               {submit.isPending ? btn_loading() : "Simpan"}
            </Button>
         </DialogContent>
      </Dialog>
   );
}

export default DialogPerbaiki;
