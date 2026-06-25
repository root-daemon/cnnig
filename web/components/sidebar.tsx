"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wand2,
  Layers,
  History,
  BarChart3,
  Network,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/classify", label: "Analysis", icon: Wand2 },
  { href: "/batch", label: "Batch Inference", icon: Layers },
  { href: "/history", label: "Data History", icon: History },
  { href: "/analytics", label: "Metrics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-3 border-b px-5">
        <Network className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm tracking-tight text-foreground">WaferCNN Framework</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-5">
         <div className="text-xs font-medium text-muted-foreground mb-1">System Status</div>
         <div className="flex items-center gap-2 text-sm text-foreground">
           <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
           Model Loaded
         </div>
      </div>
    </aside>
  );
}
