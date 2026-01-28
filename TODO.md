# TODO: Fix JWT Audience Issue

- [x] Edit api/src/plugins/keycloak-auth.ts to update the audience in jwt.verify to an array of accepted audiences: [ENV.KEYCLOAK_REALM, ENV.KEYCLOAK_CLIENT_ID, "account"]
- [x] Test the API endpoint /api/v1/user/validate/:username to ensure the token is now accepted
