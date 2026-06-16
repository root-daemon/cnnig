"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { api, CLASS_NAMES } from "@/lib/api";
import { HistoryTable } from "@/components/history-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 25;

export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const key = ["history", page, filter] as const;
  const { data, isLoading, mutate } = useSWR(key, () =>
    api.history({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      class: filter === "all" ? undefined : filter,
    }),
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function confirmDelete() {
    if (pendingDelete == null) return;
    try {
      await api.deleteRun(pendingDelete);
      toast.success(`Deleted run #${pendingDelete}`);
      mutate();
    } catch (e) {
      toast.error(String(e));
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            All inference runs, newest first.
          </p>
        </div>
        <Select
          value={filter}
          onValueChange={(v) => {
            setFilter(v ?? "all");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {CLASS_NAMES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {total.toLocaleString()} run{total === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>
            Page {page + 1} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <HistoryTable
              items={data?.items ?? []}
              onDelete={(id) => setPendingDelete(id)}
              emptyText={
                filter === "all"
                  ? "No runs yet. Classify a wafer map to get started."
                  : `No runs for class "${filter}".`
              }
            />
          )}

          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground tabular-nums">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)}{" "}
                of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={pendingDelete != null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete run #{pendingDelete}?</DialogTitle>
            <DialogDescription>
              This permanently removes the run from history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
