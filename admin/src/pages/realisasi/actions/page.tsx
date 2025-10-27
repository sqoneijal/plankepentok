import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toNumber } from "@/helpers/init";
import { useHeaderButton } from "@/hooks/store";
import { usePostMutation } from "@/hooks/usePostMutation";
import { FormDatePicker, FormInput, LinkButton } from "@/lib/helpers";
import { useGetQueryDetail } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { columns } from "./column";

const endpoint = "/realisasi";

type FormData = Record<string, unknown>;

export default function Page() {
   const { id } = useParams();
   const { setButton } = useHeaderButton();
   const { results, isLoading } = useGetQueryDetail(endpoint, `${id}/ref-rab`);

   const { mutate, isPending } = usePostMutation<FormData, unknown>(`${endpoint}/${id}`, (data) => ({ ...data }), [[`${endpoint}/${id}`]]);

   useEffect(() => {
      setButton(<LinkButton label="Batal" url={`${endpoint}/${id}`} type="actions" />);
      return () => {
         setButton(<div />);
      };
   }, [setButton, id]);

   const [formData, setFormData] = useState<FormData>({});
   const [errors, setErrors] = useState<Record<string, string>>({});

   return (
      <div className="row">
         <div className="col-12 col-md-8">
            <Card>
               <CardHeader>
                  <CardTitle>Rencana Anggaran Biaya</CardTitle>
                  <CardDescription>Berikut adalah rencana anggaran biaya yang digunakan sebagai referensi untuk realisasi kegiatan.</CardDescription>
               </CardHeader>
               <CardContent>
                  <Table
                     columns={columns()}
                     data={results}
                     total={results.length}
                     isLoading={isLoading}
                     usePagination={false}
                     trCursor={true}
                     onRowClick={(row) => {
                        let harga_satuan: string;
                        let total_biaya: string;
                        let qty: string;

                        if (row.rab_detail_perubahan === null) {
                           qty = row.qty!;
                           harga_satuan = row.harga_satuan!;
                           total_biaya = (toNumber(row.qty) * toNumber(row.harga_satuan)).toString();
                        } else {
                           harga_satuan = row.rab_detail_perubahan.harga_satuan!;
                           qty = row.rab_detail_perubahan.qty!;
                           total_biaya = (toNumber(row.rab_detail_perubahan.qty) * toNumber(row.rab_detail_perubahan.harga_satuan)).toString();
                        }

                        setFormData({
                           ...row,
                           new_qty: qty,
                           new_harga_satuan: harga_satuan,
                           new_total_biaya: total_biaya,
                        } as FormData);
                     }}
                  />
               </CardContent>
            </Card>
         </div>
         <div className="col-12 col-md-4">
            <Card>
               <CardContent>
                  <div className="row">
                     <FormInput divClassName="col-12" label="Uraian Biaya" value={formData?.uraian_biaya as string} disabled={true} />
                  </div>
                  <div className="row">
                     <FormDatePicker
                        divClassName="col-12 col-md-6"
                        label="Qty"
                        name="new_qty"
                        value={formData?.new_qty as string}
                        onChange={(value) => setFormData({ ...formData, new_qty: String(value) })}
                        errors={errors}
                     />
                     <FormInput
                        divClassName="col-12 col-md-6"
                        label="Satuan"
                        value={(formData?.unit_satuan as Record<string, unknown>)?.nama as string}
                        disabled={true}
                     />
                  </div>
                  <div className="row">
                     <FormInput
                        apakahFormatRupiah={true}
                        divClassName="col-12 col-md-6"
                        label="Harga Satuan"
                        name="new_harga_satuan"
                        value={formData?.new_harga_satuan as string}
                        onChange={(value) => setFormData({ ...formData, new_harga_satuan: String(value) })}
                        errors={errors}
                     />
                     <FormInput
                        apakahFormatRupiah={true}
                        divClassName="col-12 col-md-6"
                        label="Total Biaya"
                        value={formData?.new_total_biaya as string}
                        disabled={true}
                     />
                  </div>
               </CardContent>
               <CardFooter>
                  <Button
                     disabled={isPending}
                     onClick={() => {
                        mutate(formData, {
                           onSuccess: (response) => {
                              const { errors, status, message } = response;
                              setErrors({ ...errors });

                              if (status) {
                                 toast.success(message);
                              } else {
                                 toast.error(message);
                              }
                           },
                        });
                     }}>
                     {isPending && <Spinner />}Simpan
                  </Button>
               </CardFooter>
            </Card>
         </div>
      </div>
   );
}
