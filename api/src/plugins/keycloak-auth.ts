import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { ENV } from "../config/env";
import { KeycloakUser } from "../types";

const client = jwksClient({
   jwksUri: ENV.KEYCLOAK_JWKS_URL,
   cache: true,
   cacheMaxEntries: 5,
   cacheMaxAge: 600_000, // 10 minutes
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
   client.getSigningKey(header.kid, (err, key) => {
      if (err) {
         callback(err);
         return;
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
   });
}

const verifyToken = (token: string): Promise<KeycloakUser> => {
   return new Promise((resolve, reject) => {
      jwt.verify(
         token,
         getKey,
         {
            algorithms: ["RS256"],
            issuer: ENV.KEYCLOAK_ISSUER,
            audience: [ENV.KEYCLOAK_REALM, ENV.KEYCLOAK_CLIENT_ID, "account"],
         },
         (err, decoded) => {
            if (err) {
               reject(err);
            } else {
               resolve(decoded as KeycloakUser);
            }
         },
      );
   });
};

const keycloakAuthPlugin: FastifyPluginAsync = async (fastify) => {
   // Decorator untuk autentikasi
   fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
      try {
         console.log(request);
         const authHeader = request.headers.authorization;

         if (!authHeader) {
            return reply.status(401).send({
               success: false,
               message: "Token tidak ditemukan",
               errors: [{ field: "authorization", message: "Header Authorization diperlukan" }],
            });
         }

         const token = authHeader.replace("Bearer ", "");

         if (!token) {
            return reply.status(401).send({
               success: false,
               message: "Format token tidak valid",
               errors: [{ field: "authorization", message: "Gunakan format: Bearer <token>" }],
            });
         }

         const user = await verifyToken(token);
         request.user = user;
      } catch (error: any) {
         fastify.log.error(error);

         let message = "Token tidak valid";
         if (error.name === "TokenExpiredError") {
            message = "Token sudah kedaluwarsa";
         } else if (error.name === "JsonWebTokenError") {
            message = "Token tidak valid atau rusak";
         }

         return reply.status(401).send({
            success: false,
            message,
            errors: [{ field: "token", message: error.message }],
         });
      }
   });

   // Decorator untuk cek role
   fastify.decorate("requireRoles", (roles: string[]) => {
      return async (request: FastifyRequest, reply: FastifyReply) => {
         const user = request.user;

         if (!user) {
            return reply.status(401).send({
               success: false,
               message: "Tidak terautentikasi",
            });
         }

         const userRoles = new Set([...(user.realm_access?.roles || []), ...(user.resource_access?.[ENV.KEYCLOAK_CLIENT_ID]?.roles || [])]);

         const hasRole = roles.some((role) => userRoles.has(role));

         if (!hasRole) {
            return reply.status(403).send({
               success: false,
               message: "Akses ditolak. Role tidak mencukupi",
               errors: [
                  {
                     field: "roles",
                     message: `Diperlukan salah satu role: ${roles.join(", ")}`,
                  },
               ],
            });
         }
      };
   });
};

declare module "fastify" {
   interface FastifyInstance {
      authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
      requireRoles: (roles: Array<string>) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
   }
}

export default fp(keycloakAuthPlugin, { name: "keycloak-auth" });
