"use client";

import { useTraining } from "@/lib/training-context";
import { FileUpload } from "@/components/import/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ImportPage() {
  const { addActivities, activities } = useTraining();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Data</h1>
        <p className="text-sm text-muted-foreground">
          Import Garmin FIT files to analyze your training
        </p>
      </div>

      <FileUpload onActivitiesImported={addActivities} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            How to Export from Garmin Connect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Web (connect.garmin.com):</p>
            <ol className="list-inside list-decimal space-y-1 pl-2">
              <li>Go to Activities &rarr; All Activities</li>
              <li>Click on an activity to open it</li>
              <li>Click the gear icon (top right) &rarr; Export Original</li>
              <li>This downloads the .FIT file</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Bulk Export:</p>
            <ol className="list-inside list-decimal space-y-1 pl-2">
              <li>Go to garmin.com/account &rarr; Manage Your Data</li>
              <li>Request a data export</li>
              <li>You&apos;ll receive a zip with all your .FIT files</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-2xl font-bold">{activities.length}</p>
              <p className="text-xs text-muted-foreground">Total Activities</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {activities.filter((a) => a.sport === "run").length}
              </p>
              <p className="text-xs text-muted-foreground">Runs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {activities.filter((a) => a.sport === "bike").length}
              </p>
              <p className="text-xs text-muted-foreground">Rides</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {activities.filter((a) => a.sport === "swim").length}
              </p>
              <p className="text-xs text-muted-foreground">Swims</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
