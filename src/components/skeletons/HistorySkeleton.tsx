
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const HistorySkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="w-64 h-screen bg-white border-r">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
              
              {/* Stats skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-1">
                          <Skeleton className="h-6 w-12" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Table skeleton */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-5 h-5" />
                        <Skeleton className="w-20 h-6 rounded-full" />
                      </div>
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="w-32 h-4" />
                      <Skeleton className="w-28 h-4" />
                      <div className="flex space-x-2">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
