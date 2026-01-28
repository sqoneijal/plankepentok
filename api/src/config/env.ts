import { config } from "dotenv";
config();

export const ENV = {
   PORT: Number(process.env.PORT || "3000"),
   HOST: process.env.HOST || "0.0.0.0",
   DATABASE_URL: process.env.DATABASE_URL!,

   // Keycloak
   KEYCLOAK_AUTH_SERVER_URL: process.env.KEYCLOAK_AUTH_SERVER_URL || "https://iam.ar-raniry.ac.id",
   KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || "uinar",
   KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || "perencanaan",

   // Keycloak JWKS URL
   get KEYCLOAK_JWKS_URL() {
      return `${this.KEYCLOAK_AUTH_SERVER_URL}/realms/${this.KEYCLOAK_REALM}/protocol/openid-connect/certs`;
   },

   get KEYCLOAK_ISSUER() {
      return `${this.KEYCLOAK_AUTH_SERVER_URL}/realms/${this.KEYCLOAK_REALM}`;
   },
};
