"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { type Visit } from "@prisma/client";

export function VisitsTable() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof Visit | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchVisits();
  }, []);

  async function fetchVisits() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/visits");
      if (!response.ok) throw new Error("Failed to fetch visits");
      const data = await response.json();
      setVisits(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      setError(message);
      toast.error("Failed to load visits", {
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSort = (column: keyof Visit) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

    const sortedVisits = [...visits].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      const modifier = sortDirection === "asc" ? 1 : -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier;
      }
      return 0;
    });

    setVisits(sortedVisits);
  };

  const handleOpenNotes = (visit: Visit) => {
    setSelectedVisit(visit);
    setEditedNotes(visit.notes);
    setIsEditing(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedVisit) return;

    try {
      setIsSaving(true);
      const response = await fetch("/api/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedVisit.id, notes: editedNotes }),
      });

      if (!response.ok) throw new Error("Failed to save notes");

      const updatedVisit = await response.json();
      setVisits(visits.map(v => v.id === updatedVisit.id ? updatedVisit : v));
      setIsEditing(false);
      toast.success("Notes updated successfully");
    } catch (error) {
      toast.error("Failed to save notes", {
        description: "Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <div className="animate-pulse">Loading visits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border p-8 text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("patientName")}
            >
              Patient
              {sortColumn === "patientName" && (
                <span className="ml-2">
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("vetName")}
            >
              Veterinarian
              {sortColumn === "vetName" && (
                <span className="ml-2">
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Medications</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("visitDate")}
            >
              Visit Date
              {sortColumn === "visitDate" && (
                <span className="ml-2">
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </TableHead>
            <TableHead>Documentation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map((visit) => (
            <TableRow key={visit.id}>
              <TableCell className="font-medium">{visit.patientName}</TableCell>
              <TableCell>{visit.vetName.replace("_", " ")}</TableCell>
              <TableCell>
                <Badge variant="outline">{visit.species}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {visit.medications.map((med) => (
                    <Badge key={med} variant="secondary">
                      {med}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{format(new Date(visit.visitDate), "MMM dd, yyyy")}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleOpenNotes(visit)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={selectedVisit !== null} onOpenChange={() => setSelectedVisit(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Visit Notes - {selectedVisit?.patientName}
              <Badge variant="outline">
                {selectedVisit && format(new Date(selectedVisit.visitDate), "MMM dd, yyyy")}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {isEditing ? (
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              className="min-h-[150px]"
              placeholder="Enter visit notes..."
              disabled={isSaving}
            />
          ) : (
            <div className="text-sm text-muted-foreground min-h-[150px] p-3 rounded-md border">
              {selectedVisit?.notes}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Notes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
