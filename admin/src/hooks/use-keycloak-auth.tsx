import type { KeycloakUserInfo } from "@/types/keycloak-user";
import Keycloak from "keycloak-js";
import { useCallback, useEffect, useState } from "react";
import { initKeycloak } from "./keycloak";

interface AuthState {
   keycloak: Keycloak | null;
   user: KeycloakUserInfo | null;
   initialized: boolean;
   token: string | null;
   tokenExpiresAt: number | null;
}

export function useKeycloakAuth() {
   const [auth, setAuth] = useState<AuthState>({
      keycloak: null,
      user: null,
      initialized: false,
      token: null,
      tokenExpiresAt: null,
   });

   // Inisialisasi Keycloak
   useEffect(() => {
      let mounted = true;

      async function init() {
         const result = await initKeycloak();
         if (mounted && result) {
            setAuth({
               keycloak: result.keycloak,
               user: result.user,
               initialized: true,
               token: result.keycloak.token ?? null,
               tokenExpiresAt: result.keycloak.tokenParsed?.exp ? result.keycloak.tokenParsed.exp * 1000 : null,
            });
         } else if (mounted) {
            setAuth((prev) => ({ ...prev, initialized: true }));
         }
      }

      init();

      return () => {
         mounted = false;
      };
   }, []);

   // Auto-refresh token
   useEffect(() => {
      if (!auth.keycloak) return;

      const interval = setInterval(async () => {
         try {
            const kc = auth.keycloak;
            if (!kc) return; // pastikan tidak null

            if (kc.isTokenExpired(30)) {
               const refreshed = await kc.updateToken(30);
               if (refreshed) {
                  setAuth((prev) => ({
                     ...prev,
                     token: kc.token ?? null,
                     tokenExpiresAt: kc.tokenParsed?.exp ? kc.tokenParsed.exp * 1000 : null,
                  }));
               }
            }
         } catch (err) {
            console.error("Token refresh failed", err);
         }
      }, 10_000);

      return () => clearInterval(interval);
   }, [auth.keycloak]);

   const login = useCallback(() => {
      auth.keycloak?.login();
   }, [auth.keycloak]);

   const logout = useCallback(() => {
      auth.keycloak?.logout({
         redirectUri: import.meta.env.VITE_API_BASE_URL,
      });
   }, [auth.keycloak]);

   useEffect(() => {
      if (auth.keycloak?.realmAccess) {
         const keycloakRoles = auth.keycloak.realmAccess.roles;
         const allowedRoles = ["ADM", "FUNG", "STR"];

         const hasAccess = allowedRoles.some((role) => keycloakRoles.includes(role));

         if (!hasAccess) {
            logout();
         }
      }
      return () => {};
   }, [auth.keycloak, logout]);

   return {
      ...auth,
      login,
      logout,
   };
}
