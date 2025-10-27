import { createColumnHelper, type CellContext, type ColumnDef } from "@tanstack/react-table";
import React from "react";

type RowData = Record<string, unknown>;

const columnHelper = createColumnHelper<RowData>();

type ColumnConfig = {
   key: string;
   header: string;
   cell?: (info: CellContext<RowData, unknown>) => React.ReactNode;
};

const valueRenderer = ({ value }: { value: unknown }): React.ReactNode => {
   if (!value) {
      return <span className="text-muted-foreground">Tidak ada</span>;
   }

   if (typeof value === "string") {
      try {
         const parsed = JSON.parse(value);
         if (Array.isArray(parsed)) {
            return (
               <div className="space-y-2 max-h-40 overflow-y-auto">
                  {parsed.map((item, idx) => (
                     <div key={idx} className="border border-gray-200 rounded p-2 bg-gray-50">
                        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
                     </div>
                  ))}
               </div>
            );
         } else if (typeof parsed === "object" && parsed !== null) {
            return (
               <pre className="text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(parsed, null, 2)}
               </pre>
            );
         } else {
            return <span>{String(parsed)}</span>;
         }
      } catch {
         return <span>{value}</span>;
      }
   } else {
      return <span>{String(value)}</span>;
   }
};

const columnConfigs: Array<ColumnConfig> = [
   {
      key: "user_modified",
      header: "User Modified",
   },
   {
      key: "action_type",
      header: "Action Type",
   },
   {
      key: "table_affected",
      header: "Table Affected",
   },
   {
      key: "old_value",
      header: "Old Value",
      cell: (info) => valueRenderer({ value: info.getValue() }),
   },
   {
      key: "new_value",
      header: "New Value",
      cell: (info) => valueRenderer({ value: info.getValue() }),
   },
   {
      key: "ip_address",
      header: "IP Address",
   },
   {
      key: "timestamp",
      header: "Timestamp",
   },
];

export const getColumns = (): Array<ColumnDef<RowData, unknown>> =>
   columnConfigs.map((config) =>
      columnHelper.accessor(config.key, {
         header: config.header,
         cell: config.cell ? (info) => config.cell!(info) : (info) => info.getValue(),
      })
   );
