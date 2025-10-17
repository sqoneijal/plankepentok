import { useKeycloakAuth } from "@/hooks/use-keycloak-auth";
import type { KeycloakUserInfo } from "@/types/keycloak-user";
import Keycloak from "keycloak-js";
import { createContext, type ReactNode, useContext } from "react";

interface AuthContextProps {
   keycloak: Keycloak | null;
   user: KeycloakUserInfo | null;
   token: string | null;
   tokenExpiresAt: number | null;
   initialized: boolean;
   login: () => void;
   logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
   children: ReactNode;
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
   const auth = useKeycloakAuth();
   return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function UseAuth(): AuthContextProps {
   const context = useContext(AuthContext);
   if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
}
