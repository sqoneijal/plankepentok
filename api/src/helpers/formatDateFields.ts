export function formatDateFields<T extends Record<string, any>>(
   data: T,
   options?: {
      only?: Array<string>; // hanya field tertentu
      except?: Array<string>; // kecuali field tertentu
   },
): T {
   const result: Record<string, any> = { ...data };

   for (const key of Object.keys(result)) {
      const value = result[key];

      if (!value) continue;

      // hanya Date object
      if (value instanceof Date) {
         if (options?.only && !options.only.includes(key)) continue;
         if (options?.except?.includes(key)) continue;

         result[key] = value.toISOString().slice(0, 10);
      }
   }

   return result as T;
}
