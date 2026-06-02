import { Link, useRouterState } from "@tanstack/react-router";
import {
  Users, Target, FileText, FileSignature, ShoppingCart, Package, UserSquare2, Building2,
  PackagePlus, Warehouse, PackageMinus, ClipboardList,
  Ticket, Activity, CalendarClock, Workflow, HelpCircle, ShieldCheck,
  Calendar, ListTodo, FolderKanban, BarChart3, UsersRound, FileBox,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar,
} from "@/components/ui/sidebar";

type Item = { title: string; url: string; icon: LucideIcon };

const SALES: Item[] = [
  { title: "All Leads", url: "/leads", icon: Users },
  { title: "Opportunities", url: "/opportunities", icon: Target },
  { title: "Quotes", url: "/quotes", icon: FileText },
  { title: "Service Contracts", url: "/service-contracts", icon: FileSignature },
  { title: "Sales Orders", url: "/sales-orders", icon: ShoppingCart },
  { title: "Products & Services", url: "/products", icon: Package },
  { title: "Contacts", url: "/contacts", icon: UserSquare2 },
  { title: "Organizations", url: "/organizations", icon: Building2 },
];

const INVENTORY: Item[] = [
  { title: "Inbound", url: "/inventory/inbound", icon: PackagePlus },
  { title: "Storage", url: "/inventory/storage", icon: Warehouse },
  { title: "Outbound", url: "/inventory/outbound", icon: PackageMinus },
  { title: "Quy trình kho", url: "/quy-trinh-quan-ly-kho", icon: ClipboardList },
  { title: "Prototype kho", url: "/warehouse-prototype", icon: ShieldCheck },
];

const SUPPORT: Item[] = [
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Activities", url: "/activities", icon: Activity },
  { title: "Schedule", url: "/schedule", icon: CalendarClock },
  { title: "Rules", url: "/rules", icon: Workflow },
  { title: "SupportFAQ", url: "/support-faq", icon: HelpCircle },
  { title: "Organizations", url: "/organizations", icon: Building2 },
];

const MANAGEMENT: Item[] = [
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Project Tasks", url: "/project-tasks", icon: ListTodo },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Teams", url: "/teams", icon: UsersRound },
  { title: "Documents", url: "/documents", icon: FileBox },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (url: string) =>
    url === "/leads" ? pathname === "/leads" || pathname.startsWith("/leads/") : pathname === url || pathname.startsWith(url + "/");

  const renderGroup = (label: string, items: Item[]) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((it) => (
            <SidebarMenuItem key={label + it.title + it.url}>
              <SidebarMenuButton asChild isActive={isActive(it.url)} tooltip={it.title}>
                <Link to={it.url} className="flex items-center gap-2">
                  <it.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{it.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">TG</div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Tag-Driven CRM</span>
              <span className="text-[10px] text-muted-foreground">Workflow by tags</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Sales", SALES)}
        {renderGroup("Inventory", INVENTORY)}
        {renderGroup("Support", SUPPORT)}
        {renderGroup("Management", MANAGEMENT)}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
