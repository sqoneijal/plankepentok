export type Lists = Record<string, string | null>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormData = Record<string, any>;

export type Option = {
   value: string;
   label: string;
};

export interface ApiResponse<T = unknown> {
   message: string;
   data?: T;
   results?: { [key: string]: string };
   total?: number;
   errors?: Lists;
   status: boolean;
   code?: number;
}
