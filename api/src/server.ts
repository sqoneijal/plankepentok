import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";
import Fastify, { FastifyInstance, FastifyRequest } from "fastify";
import jwksClient from "jwks-rsa";
import { prisma } from "./lib/prisma";
import pengaturan from "./routes/pengaturan";
import daftarPengguna from "./routes/pengguna/daftar";
import referensiRoutes from "./routes/referensi";
import userValidate from "./routes/user-validate";

dotenv.config();

const server: FastifyInstance = Fastify({
   logger: {
      level: process.env.LOG_LEVEL || "info",
   },
   ajv: {
      customOptions: {
         allErrors: true,
         coerceTypes: true,
         removeAdditional: true,
         strict: false,
      },
      plugins: [require("ajv-errors")],
   },
});

/**
 * ======================
 * Global Config
 * ======================
 */
const PORT = Number(process.env.PORT) || 3000;
const API_PREFIX = process.env.API_PREFIX || "/api";
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * ======================
 * CORS
 * ======================
 */
server.register(cors, {
   origin: ["http://localhost:5173"],
   credentials: true,
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

/**
 * ======================
 * JWT
 * ======================
 */

const keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL!;
const keycloakRealm = process.env.KEYCLOAK_REALM!;
const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID!;

const jwks = jwksClient({
   jwksUri: `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
});

server.register(jwt, {
   decode: { complete: true },

   secret: async (request: FastifyRequest, token: any): Promise<string> => {
      if (!token?.header?.kid) {
         throw new Error("Invalid token header");
      }

      const key = await jwks.getSigningKey(token.header.kid);
      return key.getPublicKey();
   },
});

/**
 * ======================
 * Rate Limiting
 * ======================
 */
server.register(rateLimit, {
   global: true,
   timeWindow: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900_000,
   max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});

/**
 * ======================
 * Decorator Auth
 * ======================
 */
server.decorate("authenticate", async (request: any, reply: any) => {
   try {
      await request.jwtVerify({
         iss: `${keycloakBaseUrl}/realms/${keycloakRealm}`,
         aud: keycloakClientId,
      });
   } catch (err) {
      reply.code(401).send({
         statusCode: 401,
         error: "Unauthorized",
         message: "Invalid or expired token",
      });
      throw err;
   }
});

/**
 * Health
 */
server.get("/health", async () => {
   return { status: "ok", mode: NODE_ENV };
});

/**
 * ======================
 * Routes
 * ======================
 */

server.register(userValidate, { prefix: API_PREFIX });
server.register(pengaturan, { prefix: API_PREFIX });
server.register(daftarPengguna, { prefix: API_PREFIX });
server.register(referensiRoutes, { prefix: API_PREFIX });

/**
 * Processes sub-errors within a validation error and updates the errors record.
 */
const processSubErrors = (subErrors: Array<any>, errors: Record<string, string>, errMessage?: string) => {
   for (const subErr of subErrors) {
      let field: string | undefined;

      // required di dalam errorMessage
      if (subErr.keyword === "required") {
         field = subErr.params?.missingProperty;
         if (field && !errors[field]) {
            errors[field] = errMessage || subErr.message;
         }
         continue;
      }

      // error lain dengan instancePath
      if (subErr.instancePath) {
         field = subErr.instancePath.replace(/^\//, "");
         if (field && !errors[field]) {
            errors[field] = subErr.message;
         }
      }
   }
};

/**
 * Handles errorMessage keyword errors.
 */
const handleErrorMessageKeyword = (err: any, errors: Record<string, string>): boolean => {
   if (err.keyword === "errorMessage" && Array.isArray(err.params?.errors)) {
      processSubErrors(err.params.errors, errors, err.message);
      return true;
   }
   return false;
};

/**
 * Handles required keyword errors.
 */
const handleRequiredKeyword = (err: any, errors: Record<string, string>): boolean => {
   if (err.keyword === "required") {
      const field = err.params?.missingProperty;
      if (field && !errors[field]) {
         errors[field] = "Field wajib diisi";
      }
      return true;
   }
   return false;
};

/**
 * Handles instancePath errors.
 */
const handleInstancePathError = (err: any, errors: Record<string, string>): void => {
   if (err.instancePath) {
      const field = err.instancePath.replace(/^\//, "");
      if (field && !errors[field]) {
         errors[field] = err.message;
      }
   }
};

/**
 * Processes validation errors and returns a record of field-specific error messages.
 */
const processValidationErrors = (validationErrors: Array<any>): Record<string, string> => {
   const errors: Record<string, string> = {};

   for (const err of validationErrors) {
      if (handleErrorMessageKeyword(err, errors)) continue;
      if (handleRequiredKeyword(err, errors)) continue;
      handleInstancePathError(err, errors);
   }

   return errors;
};

server.setErrorHandler((error: any, request, reply) => {
   if (error.validation) {
      const errors = processValidationErrors(error.validation);

      return reply.send({
         status: false,
         message: "Validasi gagal",
         errors,
      });
   }

   reply.send(error);
});

/**
 * ======================
 * Graceful Shutdown (FASTIFY WAY)
 * ======================
 */
server.addHook("onClose", async () => {
   server.log.info("🔻 Closing Prisma connection...");
   await prisma.$disconnect();
});

/**
 * ======================
 * Start Server
 * ======================
 */
const start = async () => {
   try {
      await server.listen({
         port: PORT,
         host: "0.0.0.0",
      });

      server.log.info(`🚀 Server running on port ${PORT}`);
      server.log.info(`📌 API Prefix: ${API_PREFIX}`);
   } catch (err) {
      server.log.error(err);
      process.exit(1);
   }
};

start();

export default server;
