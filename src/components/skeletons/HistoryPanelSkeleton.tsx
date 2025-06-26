
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const HistoryPanelSkeleton = () => {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
};
