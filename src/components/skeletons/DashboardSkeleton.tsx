
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const DashboardSkeleton = () => {
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
            {/* Hero section skeleton */}
            <div className="mb-8 sm:mb-12">
              <div className="text-center sm:text-left mb-6">
                <Skeleton className="h-6 w-40 mb-4 mx-auto sm:mx-0" />
                <Skeleton className="h-12 w-80 mb-3 mx-auto sm:mx-0" />
                <Skeleton className="h-5 w-96 mx-auto sm:mx-0" />
              </div>

              {/* Quick stats skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm bg-white/60 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-12" />
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-2 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Welcome card skeleton */}
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-72" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Calculator grid skeleton */}
            <div>
              <div className="mb-6">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex flex-wrap gap-1 mb-4">
                        {[...Array(3)].map((_, j) => (
                          <Skeleton key={j} className="h-5 w-16 rounded-full" />
                        ))}
                      </div>
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
