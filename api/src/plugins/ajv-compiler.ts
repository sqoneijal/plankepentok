import Ajv from "ajv";
import ajvErrors from "ajv-errors";
import addFormats from "ajv-formats";
import { FastifyError, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const FIELD_MESSAGES: Record<string, string> = {
   kode: "Kode sudah digunakan",
   email: "Email sudah terdaftar",
   username: "Username sudah digunakan",
};

const UNIQUE_CONSTRAINT_MAP: Record<string, Array<string>> = {
   tb_detail_harga_sbm_unique: ["id_standar_biaya", "tahun_anggaran", "id_satuan"],
};

const ajvCompilerPlugin: FastifyPluginAsync = async (fastify) => {
   const ajv = new Ajv({
      allErrors: true,
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true,
      // Untuk custom error messages
      $data: true,
   });

   // Add formats (email, date, uri, etc.)
   addFormats(ajv);

   // Add custom error messages support
   ajvErrors(ajv);

   // Custom formats
   ajv.addFormat("decimal", /^-?\d+(\.\d+)?$/);
   ajv.addFormat("phone", /^(\+62|62|0)8[1-9]\d{6,11}$/);

   fastify.setValidatorCompiler(({ schema }) => {
      return ajv.compile(schema);
   });

   // Custom error formatter
   fastify.setErrorHandler((error: FastifyError, request, reply) => {
      if (error.validation) {
         const formattedErrors = error.validation.reduce(
            (acc, err: any) => {
               let field: string | undefined;
               let message: string;

               // 1️⃣ AJV errorMessage (ajv-errors)
               if (err.keyword === "errorMessage" && Array.isArray(err.params?.errors)) {
                  const innerError = err.params.errors[0];

                  field = innerError?.params?.missingProperty;
                  message = err.message; // custom message dari schema

                  if (field) {
                     acc[field] = message;
                  }

                  return acc;
               }

               // 2️⃣ required biasa
               if (err.keyword === "required") {
                  field = err.params?.missingProperty;
                  message = "Field wajib diisi";

                  if (field) {
                     acc[field] = message;
                  }

                  return acc;
               }

               // 3️⃣ error lain (format, enum, dll)
               if (err.instancePath) {
                  field = err.instancePath.replace("/", "");
               }

               if (!field) return acc;

               // format date
               if (err.keyword === "format" && err.params?.format === "date") {
                  acc[field] = "Format tanggal harus YYYY-MM-DD";
                  return acc;
               }

               // enum
               if (err.keyword === "enum") {
                  acc[field] = "Nilai tidak valid";
                  return acc;
               }

               if (field) {
                  acc[field] = err.message;
               }

               return acc;
            },
            {} as Record<string, string>,
         );

         return reply.status(400).send({
            success: false,
            message: "Validasi gagal",
            errors: formattedErrors,
         });
      }

      if (error.code === "P2002") {
         let targets: Array<string> = [];

         // 1️⃣ Prisma native target
         if (Array.isArray((error as any).meta?.target)) {
            targets = (error as any).meta.target;
         } else if (typeof (error as any).meta?.target === "string") {
            targets = [(error as any).meta.target];
         }

         // 2️⃣ Fallback khusus composite unique tb_detail_harga_sbm
         if (targets.length === 0) {
            targets = UNIQUE_CONSTRAINT_MAP.tb_detail_harga_sbm_unique;
         }

         const errors = targets.reduce((acc: Record<string, string>, field) => {
            acc[field] = FIELD_MESSAGES[field] ?? "Kombinasi data sudah ada";
            return acc;
         }, {});

         request.log.warn(
            {
               prismaCode: error.code,
               targets,
            },
            "Unique constraint violation",
         );

         return reply.status(400).send({
            success: false,
            message: "Validasi gagal",
            errors,
         });
      }

      if (error.code === "P2025") {
         return reply.status(404).send({
            success: false,
            message: "Data tidak ditemukan",
         });
      }

      fastify.log.error(error);

      return reply.status(error.statusCode || 500).send({
         success: false,
         message: error.message || "Internal Server Error",
      });
   });
};

export default fp(ajvCompilerPlugin, { name: "ajv-compiler" });
