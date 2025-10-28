import { lazy } from "react";
import { v4 } from "uuid";

const Page = lazy(() => import("@/pages/verifikator/page"));
const Actions = lazy(() => import("@/pages/verifikator/actions/page"));

export const route_verifikator = [
   { key: v4(), path: "/verifikator", element: <Page /> },
   { key: v4(), path: "/verifikator/actions", element: <Actions /> },
   { key: v4(), path: "/verifikator/actions/:id", element: <Actions /> },
];
