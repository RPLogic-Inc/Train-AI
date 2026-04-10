"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileUp, Check, AlertCircle, Loader2 } from "lucide-react";
import type { Activity } from "@/lib/types";

interface FileUploadProps {
  onActivitiesImported: (activities: Activity[]) => void;
}

export function FileUpload({ onActivitiesImported }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<
    Array<{ name: string; status: "pending" | "parsing" | "done" | "error"; activity?: Activity }>
  >([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const fitFiles = Array.from(fileList).filter(
        (f) => f.name.toLowerCase().endsWith(".fit")
      );

      if (fitFiles.length === 0) return;

      const newFiles = fitFiles.map((f) => ({
        name: f.name,
        status: "pending" as const,
      }));
      setFiles((prev) => [...prev, ...newFiles]);

      const imported: Activity[] = [];

      for (let i = 0; i < fitFiles.length; i++) {
        const file = fitFiles[i];

        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name ? { ...f, status: "parsing" as const } : f
          )
        );

        try {
          const buffer = await file.arrayBuffer();
          const { parseFitFile } = await import("@/lib/fit-parser-util");
          const activity = await parseFitFile(buffer, 48, 185, 168);

          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? { ...f, status: "done" as const, activity }
                : f
            )
          );
          imported.push(activity);
        } catch {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: "error" as const } : f
            )
          );
        }
      }

      if (imported.length > 0) {
        onActivitiesImported(imported);
      }
    },
    [onActivitiesImported]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Import Garmin FIT Files</CardTitle>
          <p className="text-sm text-muted-foreground">
            Export activities from Garmin Connect and upload the .FIT files here.
            Heart rate zones, TSS, and training metrics will be calculated
            automatically.
          </p>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="mb-2 text-sm font-medium">
              Drag & drop .FIT files here
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              Or click to browse
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".fit"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted hover:text-foreground">
                <FileUp className="h-3.5 w-3.5" />
                Browse Files
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imported Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    {file.status === "parsing" && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {file.status === "done" && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    {file.status === "pending" && (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  {file.activity && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{file.activity.sport}</Badge>
                      <span className="text-xs text-muted-foreground">
                        TSS: {file.activity.tss}
                      </span>
                    </div>
                  )}
                  {file.status === "error" && (
                    <span className="text-xs text-destructive">
                      Parse error
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
