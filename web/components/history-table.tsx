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
      <div className="text-sm text-muted-foreground text-center py-12 border rounded-xl bg-background/50">
        {emptyText ?? "No historical data available."}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-medium">Timestamp</TableHead>
              <TableHead className="text-xs font-medium">Source File</TableHead>
              <TableHead className="text-xs font-medium">Classification</TableHead>
              <TableHead className="text-xs font-medium text-right">Confidence Score</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((run) => (
              <TableRow key={run.id} className="hover:bg-muted/30">
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(run.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground max-w-[260px] truncate">
                  {run.filename}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {run.predicted_class}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-mono text-right text-muted-foreground">
                  {(run.confidence * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActive(run)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(run.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
          className="w-full sm:max-w-xl overflow-y-auto"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-base font-semibold">
              Inspection Report #{active?.id}
            </SheetTitle>
          </SheetHeader>
          {active && (
            <div className="p-6">
              <PredictionCard data={active} compact />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
