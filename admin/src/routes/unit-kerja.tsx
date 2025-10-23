import { lazy } from "react";
import { v4 } from "uuid";

const UnitKerjaBiro = lazy(() => import("@/pages/unit-kerja/biro/page"));
const UnitKerjaBiroActions = lazy(() => import("@/pages/unit-kerja/biro/actions/page"));

const UnitKerjaLembaga = lazy(() => import("@/pages/unit-kerja/lembaga/page"));
const UnitKerjaLembagaActions = lazy(() => import("@/pages/unit-kerja/lembaga/actions/page"));

const UnitKerjaUPT = lazy(() => import("@/pages/unit-kerja/upt/page"));
const UnitKerjaUPTActions = lazy(() => import("@/pages/unit-kerja/upt/actions/page"));

const UnitKerjaFakultas = lazy(() => import("@/pages/unit-kerja/fakultas/page"));
const UnitKerjaFakultasActions = lazy(() => import("@/pages/unit-kerja/fakultas/actions/page"));

const UnitKerjaSubUnit = lazy(() => import("@/pages/unit-kerja/sub-unit/page"));
const UnitKerjaSubUnitActions = lazy(() => import("@/pages/unit-kerja/sub-unit/actions/page"));

export const route_unit_kerja = [
   { key: v4(), path: "/unit-kerja/biro", element: <UnitKerjaBiro /> },
   { key: v4(), path: "/unit-kerja/biro/actions", element: <UnitKerjaBiroActions /> },
   { key: v4(), path: "/unit-kerja/biro/actions/:id", element: <UnitKerjaBiroActions /> },
   { key: v4(), path: "/unit-kerja/lembaga", element: <UnitKerjaLembaga /> },
   { key: v4(), path: "/unit-kerja/lembaga/actions", element: <UnitKerjaLembagaActions /> },
   { key: v4(), path: "/unit-kerja/lembaga/actions/:id", element: <UnitKerjaLembagaActions /> },
   { key: v4(), path: "/unit-kerja/upt", element: <UnitKerjaUPT /> },
   { key: v4(), path: "/unit-kerja/upt/actions", element: <UnitKerjaUPTActions /> },
   { key: v4(), path: "/unit-kerja/upt/actions/:id", element: <UnitKerjaUPTActions /> },
   { key: v4(), path: "/unit-kerja/fakultas", element: <UnitKerjaFakultas /> },
   { key: v4(), path: "/unit-kerja/fakultas/actions", element: <UnitKerjaFakultasActions /> },
   { key: v4(), path: "/unit-kerja/fakultas/actions/:id", element: <UnitKerjaFakultasActions /> },
   { key: v4(), path: "/unit-kerja/sub-unit", element: <UnitKerjaSubUnit /> },
   { key: v4(), path: "/unit-kerja/sub-unit/actions", element: <UnitKerjaSubUnitActions /> },
   { key: v4(), path: "/unit-kerja/sub-unit/actions/:id", element: <UnitKerjaSubUnitActions /> },
];
