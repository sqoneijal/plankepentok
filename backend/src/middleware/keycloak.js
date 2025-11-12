const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// Keycloak configuration
const keycloakConfig = {
   authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || "https://iam.ar-raniry.ac.id",
   realm: process.env.KEYCLOAK_REALM || "uinar",
   clientId: process.env.KEYCLOAK_CLIENT_ID || "perencanaan",
};

// JWKS client to fetch public keys
const client = jwksClient({
   jwksUri: `${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/certs`,
});

// Function to get signing key
function getKey(header, callback) {
   client.getSigningKey(header.kid, function (err, key) {
      if (err) {
         callback(err);
      } else {
         const signingKey = key.publicKey || key.rsaPublicKey;
         callback(null, signingKey);
      }
   });
}

// Middleware to validate Keycloak JWT token
const validateKeycloakToken = (req, res, next) => {
   const authHeader = req.headers.authorization;

   if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
   }

   const token = authHeader.substring(7); // Remove 'Bearer ' prefix

   jwt.verify(
      token,
      getKey,
      {
         issuer: `${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}`,
         audience: [keycloakConfig.clientId, "account"], // Allow both client and account audience
         algorithms: ["RS256"], // Specify allowed algorithms
      },
      (err, decoded) => {
         if (err) {
            console.error("Token verification failed:", err.message);
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
         }

         // Attach user info to request
         req.user = decoded;
         next();
      }
   );
};

module.exports = validateKeycloakToken;
