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
      <div className="text-sm text-muted-foreground text-center py-12 border rounded-lg">
        {emptyText ?? "No runs yet."}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Prediction</TableHead>
              <TableHead className="text-right">Confidence</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(run.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="font-medium max-w-[260px] truncate">
                  {run.filename}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{run.predicted_class}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {(run.confidence * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setActive(run)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(run.id)}
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
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Run #{active?.id}</SheetTitle>
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
