import React from "react";

export default function CalendarLoadingSkeleton() {
  return (
    <div className="bg-teal-50 text-gray-800 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 min-h-screen">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center my-8 gap-4">
          <div className="flex flex-wrap gap-3 sm:gap-4 sm:items-center sm:justify-center justify-end">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="h-8 bg-gray-200 rounded mb-2"></div>
              ))}
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 bg-gray-100 rounded border border-gray-200"
                >
                  <div className="h-4 bg-gray-200 rounded m-2"></div>
                  <div className="h-4 bg-gray-200 rounded m-2 w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
