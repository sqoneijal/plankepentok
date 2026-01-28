import Ajv from "ajv";
import ajvErrors from "ajv-errors";
import addFormats from "ajv-formats";
import { FastifyError, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

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
               const field = err.params?.errors?.[0]?.params?.missingProperty;

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

      fastify.log.error(error);

      return reply.status(error.statusCode || 500).send({
         success: false,
         message: error.message || "Internal Server Error",
      });
   });
};

export default fp(ajvCompilerPlugin, { name: "ajv-compiler" });
