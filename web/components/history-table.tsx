"use client";

import { formatDistanceToNow } from "date-fns";
import { Trash2, Eye } from "lucide-react";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PredictionCard } from "@/components/prediction-card";
import type { PredictionResponse } from "@/lib/api";

type Props = {
  items: PredictionResponse[];
  onDelete?: (id: number) => void;
  emptyText?: string;
};

export function HistoryTable({ items, onDelete, emptyText }: Props) {
  const [active, setActive] = useState<PredictionResponse | null>(null);

  if (items.length === 0) {
    return (
      <div className="font-mono text-sm text-muted-foreground text-center py-12 border border-dashed border-border/50 rounded-none bg-background/50">
        // {emptyText ?? "No runs yet."}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-none border border-border/50 overflow-hidden bg-background/30 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase tracking-widest text-primary/70">When</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-widest text-primary/70">File</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-widest text-primary/70">Prediction</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-widest text-primary/70 text-right">Confidence</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((run) => (
              <TableRow key={run.id} className="border-b-border/30 hover:bg-secondary/40">
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(run.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="font-mono text-xs font-medium max-w-[260px] truncate text-foreground/80">
                  {run.filename}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider rounded-none border-primary/40 text-primary bg-primary/5">
                    {run.predicted_class}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-right text-foreground">
                  {(run.confidence * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActive(run)}
                      className="rounded-none hover:bg-primary/20 hover:text-primary h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(run.id)}
                        className="rounded-none hover:bg-destructive/20 hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto rounded-none border-l-primary/30"
        >
          <SheetHeader className="px-6 pt-6 border-b border-border/50 pb-4 mb-4">
            <SheetTitle className="font-mono uppercase tracking-widest text-primary flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse"></div>
              Run #{active?.id} Diagnostics
            </SheetTitle>
          </SheetHeader>
          {active && (
            <div className="px-6">
              <PredictionCard data={active} compact />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
