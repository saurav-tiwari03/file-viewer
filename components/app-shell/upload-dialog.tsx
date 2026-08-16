"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadForm } from "@/components/upload/upload-form";

export function UploadDialog({ label = "New file", className }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className={className ?? "w-full"}>
        <Plus className="size-4" />
        {label}
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a file</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-2">
          <UploadForm viewBasePath="/files" bordered />
        </div>
      </DialogContent>
    </Dialog>
  );
}
