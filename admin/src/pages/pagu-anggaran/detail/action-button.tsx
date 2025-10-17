import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePutMutation } from "@/hooks/usePutMutation";
import { CircleX, Edit, Save } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import type { PaguBiroRow, PaguFakultasRow, PaguLembagaRow, PaguParentRow, PaguSubUnitRow, PaguUPTRow } from "./init";

type ActionButtonProps = PaguBiroRow | PaguLembagaRow | PaguUPTRow | PaguFakultasRow | PaguSubUnitRow;

type FormData = Record<string, string>;

type ResponseType = {
   status?: boolean;
   message?: string;
   errors?: FormData;
};

const handleSubmit = (
   mutate: (data: FormData, options: { onSuccess: (response: ResponseType) => void; onError: (error: Error) => void }) => void,
   formData: FormData,
   setSelectedRow: (data: null) => void
) => {
   mutate(formData, {
      onSuccess: (response: ResponseType) => {
         if (response?.status) {
            setSelectedRow(null);
            toast.success(response?.message);
            return;
         }
         toast.error(response?.message);
      },
      onError: (error: Error) => {
         toast.error(`Gagal: ${error?.message}`);
      },
   });
};

function buttonAction<T extends ActionButtonProps>({
   row,
   selectedRow,
   setSelectedRow,
   isPending,
   onSubmit,
}: {
   row: T;
   selectedRow: T | null;
   setSelectedRow: (data: T | null) => void;
   isPending?: boolean;
   onSubmit?: () => void;
}) {
   return selectedRow && selectedRow?.id === row?.id ? (
      <>
         <Button variant="outline" className="size-6" onClick={onSubmit} disabled={isPending}>
            {isPending ? <Spinner /> : <Save />}
         </Button>
         <Button variant="outline" className="size-6" onClick={() => setSelectedRow(null)}>
            <CircleX />
         </Button>
      </>
   ) : (
      <Button
         variant="outline"
         className="size-6"
         onClick={() => setSelectedRow({ ...row, total_pagu: row?.total_pagu.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ".") })}>
         <Edit />
      </Button>
   );
}

export function ActionButton<T extends ActionButtonProps>({
   row,
   selectedRow,
   setSelectedRow,
   endpoint,
}: {
   row: T;
   selectedRow: T | null;
   setSelectedRow: (data: T | null) => void;
   endpoint: string;
}) {
   const id = selectedRow?.id;
   const tahun_anggaran = selectedRow?.tahun_anggaran;

   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/pagu-anggaran/${endpoint}/${id}`, (data) => ({ id, ...data }), [
      [`/pagu-anggaran/${tahun_anggaran}/${endpoint}`],
   ]);

   const onSubmit = () => {
      if (!selectedRow) return;
      handleSubmit(mutate, { total_pagu: selectedRow.total_pagu }, setSelectedRow);
   };

   return buttonAction({ row, selectedRow, setSelectedRow, isPending, onSubmit });
}

export function ActionButtonSub<T extends PaguSubUnitRow>({
   row,
   selectedRow,
   setSelectedRow,
}: {
   row: T;
   selectedRow: PaguParentRow | PaguSubUnitRow | null;
   setSelectedRow: (data: PaguParentRow | PaguSubUnitRow | null) => void;
}) {
   const id = selectedRow?.id;
   const tahun_anggaran = selectedRow?.tahun_anggaran;

   const { mutate, isPending } = usePutMutation<FormData, unknown>(`/pagu-anggaran/sub-unit/${id}`, (data) => ({ id, ...data }), [
      [`/pagu-anggaran/${tahun_anggaran}/sub-unit`],
   ]);

   const onSubmit = () => {
      if (!selectedRow) return;
      handleSubmit(mutate, { total_pagu: selectedRow.total_pagu }, setSelectedRow);
   };

   return buttonAction({ row, selectedRow, setSelectedRow, isPending, onSubmit });
}

export function TextTotalPagu({ value, onChange }: Readonly<{ value?: string; onChange?: (value: string) => void }>) {
   const inputRef = useRef<HTMLInputElement | null>(null);

   const formatRupiah = (value: string, input: HTMLInputElement | null) => {
      if (!input) return value;

      const selectionStart = input.selectionStart || 0;
      const rawValue = value.replaceAll(/\D/g, "");

      // Format angka ke ribuan dengan titik
      const formattedValue = rawValue.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ".");

      // Hitung perbedaan panjang string sebelum dan sesudah format
      const diff = formattedValue.length - rawValue.length;

      // Set posisi kursor kembali ke posisi semula
      requestAnimationFrame(() => {
         const newPos = Math.max(selectionStart + diff, 0);
         input.setSelectionRange(newPos, newPos);
      });

      return formattedValue;
   };

   return (
      <input
         ref={inputRef}
         type="text"
         className="h-6 w-full border-b border-black focus:outline-none focus:ring-0 focus:border-black"
         value={value || ""}
         onChange={({ target: { value } }) => onChange?.(formatRupiah(value, inputRef.current))}
      />
   );
}
