import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({ label, value, hint, icon: Icon, className }: Props) {
  return (
    <Card className={cn("p-0 relative overflow-hidden group border-t-2 border-t-primary/50 hover:border-t-primary transition-colors", className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
          {Icon && <Icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />}
        </div>
        <p className="text-3xl font-mono text-foreground mt-2">{value}</p>
        {hint && (
          <p className="text-xs text-muted-foreground mt-2 font-mono flex items-center gap-1.5 before:content-[''] before:block before:w-1.5 before:h-1.5 before:bg-muted-foreground/30 before:rounded-full">
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
