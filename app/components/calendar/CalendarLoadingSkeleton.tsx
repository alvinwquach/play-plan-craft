import {
  FaRegCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaGoogle,
  FaFileExport,
} from "react-icons/fa";

export default function CalendarLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
      <main className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center my-8">
          <div className="flex items-center">
            <button className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md">
              <FaChevronLeft className="text-lg sm:text-xl" />
            </button>
            <button className="ml-2 bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md">
              <FaChevronRight className="text-lg sm:text-xl" />
            </button>
            <button className="ml-2 bg-teal-600 text-white p-2 sm:p-3 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md">
              <FaRegCalendarAlt className="text-lg sm:text-xl" />
            </button>
          </div>
          <div className="flex items-center">
            <button className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md">
              Month
            </button>
            <button className="ml-2 bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md">
              Week
            </button>
            <button className="ml-2 bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md">
              Day
            </button>
          </div>
          <div className="flex gap-4">
            <button className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md flex items-center gap-2">
              <FaFileExport className="text-lg" />
              <span className="hidden sm:inline">Export to iCal</span>
            </button>
            <button className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition shadow-sm hover:shadow-md flex items-center gap-2">
              <FaGoogle className="text-lg" />
              <span className="hidden sm:inline">Export to Google</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-12 bg-teal-500 rounded mb-4"></div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 bg-gray-200 rounded mb-2 animate-pulse"
                />
              ))}
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 bg-gray-100 rounded border border-gray-200 animate-pulse"
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
