import type { Lists } from "@/types/init";
import React from "react";
import { create } from "zustand";

export const useFormEditPaguAnggaran = create<{
   editStatus: boolean;
   setEditStatus: (status: boolean) => void;
}>((set) => ({
   editStatus: false,
   setEditStatus: (status) => set({ editStatus: status }),
}));

export const useTahunAnggaran = create<{
   tahunAnggaran: string;
   setTahunAnggaran: (tahunAnggaran: string) => void;
}>((set) => ({
   tahunAnggaran: "",
   setTahunAnggaran: (data) => set({ tahunAnggaran: data }),
}));

export const useDataEdit = create<{
   dataEdit: Lists;
   setDataEdit: (dataEdit: Lists) => void;
}>((set) => ({
   dataEdit: {},
   setDataEdit: (dataEdit) => set({ dataEdit }),
}));

export const useDialog = create<{
   open: boolean;
   setOpen: (status: boolean) => void;
}>((set) => ({
   open: false,
   setOpen: (status) => set({ open: status }),
}));

export const useOptions = create<{
   options: Record<string, string | null | Array<Lists>>;
   setOptions: (opt: Record<string, string | null | Array<Lists>>) => void;
}>((set) => ({
   options: {},
   setOptions: (options) => set({ options }),
}));

export const useStatusUsulanKegiatan = create<{
   status: string;
   setStatus: (status: string) => void;
}>((set) => ({
   status: "draft",
   setStatus: (status) => set({ status }),
}));

type HeaderButtonStore = {
   button: React.ReactElement;
   setButton: (btn: React.ReactElement) => React.ReactElement;
};

export const useHeaderButton = create<HeaderButtonStore>((set) => ({
   button: <div />,
   setButton: (btn) => {
      set({ button: btn });
      return btn;
   },
}));

type PaginationStore = {
   pagination: {
      pageIndex: number;
      pageSize: number;
   };
   setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
};

export const useTablePagination = create<PaginationStore>((set) => ({
   pagination: {
      pageIndex: 0,
      pageSize: 25,
   },
   setPagination: (pagination) => set({ pagination }),
}));
