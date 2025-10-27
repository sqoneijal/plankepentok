import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, ChevronDownIcon, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { v4 } from "uuid";
import { cn } from "./utils";

export function LinkButton({ label, url, type, onClick }: Readonly<{ label: React.ReactNode; url?: string; type: string; onClick?: () => void }>) {
   return (
      <Button variant="outline" asChild className={cn(["edit", "delete"].includes(String(type)) && "size-6")} onClick={onClick}>
         {["edit", "delete", "actions"].includes(String(type)) ? (
            <Link to={url || ""} className="dark:text-foreground">
               {label}
            </Link>
         ) : (
            <span className="dark:text-foreground">{label}</span>
         )}
      </Button>
   );
}

export function EditButton({ label, onClick }: Readonly<{ label: React.ReactNode; onClick?: () => void }>) {
   return (
      <Button variant="outline" asChild className={cn("size-6")} onClick={onClick}>
         <span className="dark:text-foreground">{label}</span>
      </Button>
   );
}

export function SubmitButton({ label, isLoading = false }: Readonly<{ label: string; isLoading?: boolean }>) {
   return (
      <Button type="submit" disabled={isLoading}>
         {isLoading && <Spinner />} {label}
      </Button>
   );
}

export function FormFile({
   divClassName,
   label,
   disabled = false,
   name,
   errors,
   className,
   onChange,
}: Readonly<{
   divClassName: string;
   label: string;
   disabled?: boolean;
   name: string;
   errors: Record<string, string | null>;
   className?: string;
   onChange?: (value: File) => void;
}>) {
   const id = v4();
   const errorMessage = name ? errors?.[name] : undefined;

   return (
      <div className={cn(divClassName)}>
         <Label htmlFor={id} className="mb-2">
            {label}
         </Label>
         <Input
            disabled={disabled}
            type="file"
            id={id}
            placeholder={label}
            className={cn(errorMessage && "border-red-500", className)}
            onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) onChange?.(file);
            }}
         />
         {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
      </div>
   );
}

export function FormInput({
   label,
   type = "text",
   divClassName,
   className,
   errors = {},
   onChange,
   value,
   name,
   withLabel = true,
   disabled = false,
   apakahFormatRupiah = false,
}: Readonly<{
   disabled?: boolean;
   type?: string;
   label?: string;
   divClassName?: string;
   errors?: Record<string, string | null>;
   onChange?: (value: string) => void;
   value?: string | null;
   name?: string;
   className?: string;
   withLabel?: boolean;
   apakahFormatRupiah?: boolean;
}>) {
   const id = v4();
   const errorMessage = name ? errors?.[name] : undefined;
   const inputRef = useRef<HTMLInputElement | null>(null);

   const formatRupiah = (value: string, input: HTMLInputElement | null) => {
      if (!input) return value;

      const selectionStart = input.selectionStart || 0;
      const rawValue = value.replaceAll(/\D/g, "");

      // Format angka ke ribuan dengan titik
      const formattedValue = rawValue.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ".");

      // Hitung perbedaan panjang string sebelum dan sesudah format
      const diff = formattedValue.length - rawValue.length;

      // Set posisi kursor kembali ke posisi semula, hanya untuk input yang mendukung selection (bukan number)
      if (input.type !== "number") {
         requestAnimationFrame(() => {
            const newPos = Math.max(selectionStart + diff, 0);
            input.setSelectionRange(newPos, newPos);
         });
      }

      return formattedValue;
   };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      if (apakahFormatRupiah) {
         val = formatRupiah(val, inputRef.current);
      }
      onChange?.(val);
   };

   return (
      <div className={cn(divClassName)}>
         {withLabel && (
            <Label htmlFor={id} className="mb-2">
               {label}
            </Label>
         )}
         <Input
            ref={inputRef}
            disabled={disabled}
            type={type}
            id={id}
            placeholder={label}
            value={apakahFormatRupiah ? formatRupiah(value || "", inputRef.current) : value || ""}
            className={cn(errorMessage && "border-red-500", className)}
            onChange={handleChange}
         />
         {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
      </div>
   );
}

export function FormSelect({
   divClassName,
   label,
   name,
   onChange,
   value,
   errors,
   options,
   withLabel = true,
   useCommand = false,
}: Readonly<{
   onChange?: (value: string) => void;
   divClassName?: string;
   label?: string;
   name?: string;
   value?: string;
   errors?: Record<string, string | null>;
   options: Array<Record<string, string>>;
   withLabel?: boolean;
   useCommand?: boolean;
}>) {
   const id = v4();
   const errorMessage = name ? errors?.[name] : undefined;
   const [open, setOpen] = useState(false);

   const selectedLabel = options?.find((row: Record<string, string>) => row.value === value)?.label;

   if (useCommand) {
      return (
         <div className={cn(divClassName)}>
            <Label htmlFor={id} className="mb-2">
               {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
               <PopoverTrigger asChild>
                  <Button
                     variant="outline"
                     role="combobox"
                     aria-expanded={open}
                     className={cn("w-full justify-between", errorMessage && "border-red-500")}>
                     {selectedLabel || `Pilih ${label?.toLowerCase() || "opsi"}...`}
                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
               </PopoverTrigger>
               <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                  <Command>
                     <CommandInput placeholder={`Cari ${label?.toLowerCase() || "opsi"}...`} />
                     <CommandList>
                        <CommandEmpty>Tidak ada opsi ditemukan.</CommandEmpty>
                        <CommandGroup>
                           {options?.map((row) => (
                              <CommandItem
                                 key={row.value}
                                 value={row.label}
                                 onSelect={() => {
                                    onChange?.(row.value);
                                    setOpen(false);
                                 }}>
                                 <Check className={cn("mr-2 h-4 w-4", value === row.value ? "opacity-100" : "opacity-0")} />
                                 {row.label}
                              </CommandItem>
                           ))}
                        </CommandGroup>
                     </CommandList>
                  </Command>
               </PopoverContent>
            </Popover>
            {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
         </div>
      );
   }

   return (
      <div className={cn(divClassName)}>
         {withLabel && (
            <Label htmlFor={id} className="mb-2">
               {label}
            </Label>
         )}
         <Select key={value || ""} onValueChange={(value) => onChange?.(value)} value={value || ""}>
            <SelectTrigger className={cn("w-full", errorMessage && "border-red-500")}>
               <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
               {options?.map((row: Record<string, string>) => (
                  <SelectItem value={row.value} key={`${row.value}-${row.label.toLowerCase()}`}>
                     {row.tooltipContent ? (
                        <Tooltip>
                           <TooltipTrigger>{row.label}</TooltipTrigger>
                           <TooltipContent>{row.tooltipContent}</TooltipContent>
                        </Tooltip>
                     ) : (
                        row.label
                     )}
                  </SelectItem>
               ))}
            </SelectContent>
         </Select>
         {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
      </div>
   );
}

export function FormTextarea({
   label,
   divClassName,
   errors,
   onChange,
   value,
   name,
   disabled,
}: Readonly<{
   label?: string;
   divClassName?: string;
   errors?: Record<string, string | null>;
   onChange?: (value: string) => void;
   value?: string;
   name?: string;
   disabled?: boolean;
}>) {
   const id = v4();
   const errorMessage = name ? errors?.[name] : undefined;

   return (
      <div className={cn(divClassName)}>
         <Label htmlFor={id} className="mb-2">
            {label}
         </Label>
         <Textarea
            disabled={disabled}
            id={id}
            placeholder={label}
            value={value || ""}
            className={cn(errorMessage && "border-red-500")}
            onChange={({ target: { value } }) => onChange?.(value)}
         />
         {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
      </div>
   );
}

export function FormDatePicker({
   label,
   name,
   errors,
   onChange,
   value,
   divClassName,
   disabled = false,
}: Readonly<{
   errors: Record<string, string | null>;
   name: string;
   label?: string;
   onChange?: (value: Date | string | undefined) => void;
   value?: string;
   divClassName?: string;
   disabled?: boolean;
}>) {
   const id = v4();

   const [open, setOpen] = useState(false);
   const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);

   useEffect(() => {
      setDate(value ? new Date(value) : undefined);
   }, [value]);

   return (
      <div className={cn(divClassName)}>
         <Label htmlFor={id} className="mb-2">
            {label}
         </Label>
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button
                  variant="outline"
                  id={id}
                  size="sm"
                  disabled={disabled}
                  className={cn("w-full justify-between font-normal h-9", errors?.[name] ? "border border-red-500" : "")}>
                  {date ? date.toLocaleDateString() : <span className="opacity-80 font-light">Pilih tanggal</span>}
                  <ChevronDownIcon />
               </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
               <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                     setDate(date);
                     setOpen(false);
                     onChange?.(date);
                  }}
               />
            </PopoverContent>
         </Popover>
         {errors?.[name] && <p className="text-red-500 text-sm mt-1">{errors?.[name]}</p>}
      </div>
   );
}
