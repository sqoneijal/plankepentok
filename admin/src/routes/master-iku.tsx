import { lazy } from "react";
import { v4 } from "uuid";

const MasterIKU = lazy(() => import("@/pages/master-iku/page"));
const MasterIKUActions = lazy(() => import("@/pages/master-iku/actions/page"));

export const route_master_iku = [
   { key: v4(), path: "/master-iku", element: <MasterIKU /> },
   { key: v4(), path: "/master-iku/actions", element: <MasterIKUActions /> },
   { key: v4(), path: "/master-iku/actions/:id", element: <MasterIKUActions /> },
];
