import { Suspense } from "react";
import LessonPlans from "../components/LessonPlans";

export default function LessonPlansPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-teal-50 text-gray-800 min-h-screen p-8 sm:p-16">
          <main className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 mb-8 text-center">
              Lesson Plans
            </h1>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <p className="text-gray-600 text-center">
                Loading lesson plan...
              </p>
            </div>
          </main>
        </div>
      }
    >
      <LessonPlans />
    </Suspense>
  );
}
