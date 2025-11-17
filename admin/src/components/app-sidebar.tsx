import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarRail,
} from "@/components/ui/sidebar";
import { loadingSpinner } from "@/helpers/init";
import {
   BarChart3,
   BookOpen,
   Building2,
   CheckCircle,
   ChevronRight,
   DollarSign,
   FileText,
   LayoutDashboard,
   Settings,
   ShieldCheck,
   TicketsPlane,
   TrendingUp,
   Users,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { Link, useLocation } from "react-router";

const NavUser = lazy(() => import("./nav-user"));

type MenuItem = {
   label: string;
   icon?: React.ReactNode;
   url: string;
   child?: Array<MenuItem>;
   isActive?: boolean;
   roles?: Array<number>;
};

const data: Array<MenuItem> = [
   { roles: [1, 2, 3, 4], label: "Dashboard", icon: <LayoutDashboard />, url: "/" },
   {
      roles: [1, 2],
      label: "Referensi",
      icon: <BookOpen />,
      url: "#",
      child: [
         { roles: [1, 2], label: "Jenis Keluaran TOR", url: "/referensi/jenis-keluaran-tor" },
         { roles: [1, 2], label: "Volume Keluaran TOR", url: "/referensi/volume-keluaran-tor" },
         { roles: [1, 2], label: "Jenis Usulan", url: "/referensi/jenis-usulan" },
         { roles: [1, 2], label: "Unit Satuan", url: "/referensi/unit-satuan" },
         { roles: [1, 2], label: "Kategori SBM", url: "/referensi/kategori-sbm" },
         { roles: [1, 2], label: "Standar Biaya", url: "/referensi/standar-biaya" },
         { roles: [1, 2], label: "Detail Harga SBM", url: "/referensi/detail-harga-sbm" },
      ],
   },
   { roles: [1], label: "Verifikator", icon: <ShieldCheck />, url: "/verifikator" },
   {
      roles: [1],
      label: "Unit Kerja",
      icon: <Building2 />,
      url: "#",
      child: [
         { roles: [1], label: "Biro", url: "/unit-kerja/biro" },
         { roles: [1], label: "Lembaga", url: "/unit-kerja/lembaga" },
         { roles: [1], label: "UPT", url: "/unit-kerja/upt" },
         { roles: [1], label: "Fakultas", url: "/unit-kerja/fakultas" },
         { roles: [1], label: "Sub Unit", url: "/unit-kerja/sub-unit" },
      ],
   },
   {
      roles: [1, 2],
      label: "Pagu Anggaran",
      icon: <DollarSign />,
      url: "/pagu-anggaran",
   },
   { roles: [1, 2], label: "Master IKU", icon: <BarChart3 />, url: "/master-iku" },
   { roles: [1, 3], label: "Usulan Kegiatan", icon: <FileText />, url: "/usulan-kegiatan" },
   {
      roles: [1, 2, 4],
      label: "Verifikasi Usulan",
      icon: <CheckCircle />,
      url: "#",
      child: [
         { roles: [1, 2, 4], label: "Pengajuan", url: "/verifikasi-usulan/pengajuan" },
         { roles: [1, 2, 4], label: "Perbaikan", url: "/verifikasi-usulan/perbaikan" },
      ],
   },
   { roles: [1, 2, 3], label: "Realisasi", icon: <TrendingUp />, url: "/realisasi" },
   { roles: [1, 2], label: "Pengaturan", icon: <Settings />, url: "/pengaturan" },
   {
      roles: [1],
      label: "Pengguna",
      icon: <Users />,
      url: "#",
      child: [
         { roles: [1], label: "Daftar", url: "/pengguna/daftar" },
         { roles: [1], label: "Logs", url: "/pengguna/logs" },
      ],
   },
];

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const location = useLocation();
   const selectedRolesString = localStorage.getItem("selected_roles");
   const selected_roles = selectedRolesString ? JSON.parse(selectedRolesString) : null;

   return (
      <Sidebar collapsible="offcanvas" {...props}>
         <SidebarHeader>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild>
                     <Link
                        to="/"
                        className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-muted/50 hover:-translate-y-0.5">
                        <div
                           className={`flex aspect-square size-9 items-center justify-center rounded-md bg-muted text-primary transition-all duration-300 group-hover:text-primary/90`}>
                           <TicketsPlane className={`size-5 transition-transform duration-300 group-hover:scale-110`} />
                        </div>

                        <div className="flex flex-col leading-none">
                           <span className={`font-semibold tracking-wide text-foreground transition-all duration-300 group-hover:text-foreground`}>
                              PlanKePentok
                           </span>
                           <span className={`text-xs font-medium text-muted-foreground transition-all duration-300 group-hover:text-primary/60`}>
                              v1.0
                           </span>
                        </div>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarHeader>
         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {data
                        .filter((e) => e.roles?.includes(selected_roles?.id))
                        .map((item, index) => (
                           <Tree key={index} item={item} location={location} />
                        ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>
         <SidebarFooter>
            <Suspense fallback={loadingSpinner()}>
               <NavUser />
            </Suspense>
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   );
}

function Tree({ item, location }: Readonly<{ item: MenuItem; location: ReturnType<typeof useLocation> }>) {
   const isActive = item.url !== "#" && item.url === location.pathname;
   const isParentActive = item.child?.some((child) => child.url === location.pathname) || false;

   if (!item.child || item.child.length === 0) {
      return (
         <SidebarMenuItem data-active={isActive}>
            <SidebarMenuButton asChild isActive={isActive}>
               <Link to={item.url} className="font-medium">
                  {item.icon}
                  {item.label}
               </Link>
            </SidebarMenuButton>
         </SidebarMenuItem>
      );
   }

   return (
      <SidebarMenuItem data-active={isParentActive}>
         <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90" defaultOpen={isParentActive}>
            <CollapsibleTrigger asChild>
               <SidebarMenuButton asChild isActive={isActive}>
                  <Link to={item.url} className="font-medium">
                     {item.icon}
                     {item.label}
                     <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </Link>
               </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
               <SidebarMenuSub>
                  {item.child.map((subItem, index) => (
                     <Tree key={index} item={subItem} location={location} />
                  ))}
               </SidebarMenuSub>
            </CollapsibleContent>
         </Collapsible>
      </SidebarMenuItem>
   );
}
