
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CalendarSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Study Schedule</CardTitle>
          <CardDescription>Plan your learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              (Interactive calendar will be implemented here)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSection;
