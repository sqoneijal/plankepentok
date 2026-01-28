import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";

import { ENV } from "./config/env";
import ajvCompilerPlugin from "./plugins/ajv-compiler";
import keycloakAuthPlugin from "./plugins/keycloak-auth";
import prismaPlugin from "./plugins/prisma";

// Routes
import referensiJenisKeluaranTor from "./routes/referensi/jenis-keluaran-tor.routes";
import referensiJenisUsulanRoutes from "./routes/referensi/jenis-usulan.routes";
import referensiPenerimaManfaatTor from "./routes/referensi/penerima-manfaat-tor.routes";
import unitSatuanRoutes from "./routes/referensi/unit-satuan.routes";
import referensiVolumeKeluaranTor from "./routes/referensi/volume-keluaran-tor.routes";
import usersRoutes from "./routes/users.routes";

const fastify = Fastify({
   logger: {
      level: "info",
      transport: {
         target: "pino-pretty",
         options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
         },
      },
   },
});

async function main() {
   // Security
   await fastify.register(helmet);
   await fastify.register(cors, {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
   });

   // Multipart for file uploads
   await fastify.register(multipart, {
      limits: {
         fileSize: 10 * 1024 * 1024, // 10MB
      },
   });

   // Swagger Documentation
   await fastify.register(swagger, {
      openapi: {
         info: {
            title: "Perencanaan API",
            description: "API untuk Sistem Perencanaan Anggaran",
            version: "1.0.0",
         },
         servers: [{ url: `http://localhost:${ENV.PORT}`, description: "Development" }],
         components: {
            securitySchemes: {
               bearerAuth: {
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
               },
            },
         },
         security: [{ bearerAuth: [] }],
      },
   });

   await fastify.register(swaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
         docExpansion: "list",
         deepLinking: false,
      },
   });

   // Plugins
   await fastify.register(ajvCompilerPlugin);
   await fastify.register(prismaPlugin);
   await fastify.register(keycloakAuthPlugin);

   // Routes
   await fastify.register(usersRoutes, { prefix: "/api/v1/user" });
   await fastify.register(referensiJenisKeluaranTor, { prefix: "/api/v1/referensi" });
   await fastify.register(referensiVolumeKeluaranTor, { prefix: "/api/v1/referensi" });
   await fastify.register(referensiPenerimaManfaatTor, { prefix: "/api/v1/referensi" });
   await fastify.register(referensiJenisUsulanRoutes, { prefix: "/api/v1/referensi" });
   await fastify.register(unitSatuanRoutes, { prefix: "/api/v1/referensi" });
   // await fastify.register(usulanKegiatanRoutes, { prefix: "/api/v1/usulan-kegiatan" });
   // await fastify.register(rabDetailRoutes, { prefix: "/api/v1/rab-detail" });
   // await fastify.register(verifikasiRoutes, { prefix: "/api/v1/verifikasi" });
   // await fastify.register(masterDataRoutes, { prefix: "/api/v1/master" });

   // Health check
   fastify.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

   // Start server
   try {
      await fastify.listen({ port: ENV.PORT, host: ENV.HOST });
      fastify.log.info(`Server running at http://${ENV.HOST}:${ENV.PORT}`);
      fastify.log.info(`Documentation at http://${ENV.HOST}:${ENV.PORT}/docs`);
   } catch (err) {
      fastify.log.error(err);
      process.exit(1);
   }
}

await main();
