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
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {hint && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
