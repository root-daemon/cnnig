"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wand2,
  Layers,
  History,
  BarChart3,
  Cpu,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/classify", label: "Classify", icon: Wand2 },
  { href: "/batch", label: "Batch", icon: Layers },
  { href: "/history", label: "History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/50 bg-sidebar/80 backdrop-blur-sm text-sidebar-foreground z-20">
      <div className="flex h-14 items-center gap-3 border-b border-border/50 px-5">
        <Cpu className="h-5 w-5 text-primary" />
        <span className="font-mono text-sm tracking-widest uppercase font-bold text-foreground">Wafer<span className="text-primary">CNN</span></span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
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
                "group flex items-center gap-3 rounded-none px-3 py-2.5 text-sm transition-all duration-200 border-l-2",
                active
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:bg-sidebar-accent/50 hover:border-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="font-mono tracking-wide uppercase text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/50 p-5">
         <div className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-2">System Status</div>
         <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
           <span className="font-mono text-xs text-primary/80 uppercase tracking-wider">Engine Online</span>
         </div>
      </div>
    </aside>
  );
}
