import { lazy } from "react";
import { v4 } from "uuid";

const Dashboard = lazy(() => import("@/pages/dashboard/page"));

export const route_dashboard = [{ key: v4(), path: "/", element: <Dashboard /> }];
