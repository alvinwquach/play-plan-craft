"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface LessonPlan {
  title: string;
  ageGroup: string;
  subject: string;
  theme: string | null;
  status: string;
  duration: number;
  activities: {
    title: string;
    activityType: string;
    description: string;
    durationMins: number;
  }[];
  supplies: {
    name: string;
    quantity: number;
    unit: string;
    note: string | null;
  }[];
  tags: string[];
  developmentGoals: {
    name: string;
    description: string;
  }[];
}

export default function LessonPlans() {
  const searchParams = useSearchParams();
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLessonPlan = async () => {
      setLoading(true);
      setError(null);

      const lessonPlanData = searchParams.get("lessonPlan");
      if (lessonPlanData) {
        try {
          const parsed = JSON.parse(decodeURIComponent(lessonPlanData));
          setLessonPlan(parsed);
        } catch (err) {
          setError("Failed to parse lesson plan data from query parameter");
        }
        setLoading(false);
        return;
      }
    };

    fetchLessonPlan();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="bg-teal-50 text-gray-800 min-h-screen p-8 sm:p-16">
        <main className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 mb-8 text-center">
            Lesson Plans
          </h1>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <p className="text-gray-600 text-center">Loading lesson plan...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-teal-50 text-gray-800 min-h-screen p-8 sm:p-16">
        <main className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 mb-8 text-center">
            Error
          </h1>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!lessonPlan) {
    return (
      <div className="bg-teal-50 text-gray-800 min-h-screen p-8 sm:p-16">
        <main className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 mb-8 text-center">
            Lesson Plans
          </h1>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <p className="text-gray-600 text-center">
              No lesson plan data available.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-teal-50 text-gray-800 min-h-screen p-8 sm:p-16">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 mb-8 text-center">
          {lessonPlan.title}
        </h1>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-4">
              Details
            </h2>
            <ul className="text-gray-600 list-inside list-disc">
              <li>
                <strong>Age Group:</strong> {lessonPlan.ageGroup}
              </li>
              <li>
                <strong>Subject:</strong> {lessonPlan.subject}
              </li>
              <li>
                <strong>Theme:</strong> {lessonPlan.theme || "None"}
              </li>
              <li>
                <strong>Status:</strong> {lessonPlan.status}
              </li>
              <li>
                <strong>Duration:</strong> {lessonPlan.duration} minutes
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-4">
              Activities
            </h2>
            {lessonPlan.activities.length > 0 ? (
              <ul className="text-gray-600 list-inside list-disc space-y-4">
                {lessonPlan.activities.map((activity, index) => (
                  <li key={index}>
                    <strong className="text-teal-800">
                      {activity.title} ({activity.activityType})
                    </strong>
                    <p>{activity.description}</p>
                    <p className="text-sm">
                      <strong>Duration:</strong> {activity.durationMins} minutes
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No activities available.</p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-4">
              Supplies
            </h2>
            {lessonPlan.supplies.length > 0 ? (
              <ul className="text-gray-600 list-inside list-disc space-y-2">
                {lessonPlan.supplies.map((supply, index) => (
                  <li key={index}>
                    <strong className="text-teal-800">
                      {supply.name} ({supply.quantity} {supply.unit})
                    </strong>
                    {supply.note && (
                      <p className="text-sm">
                        <strong>Note:</strong> {supply.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No supplies required.</p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-4">Tags</h2>
            {lessonPlan.tags.length > 0 ? (
              <ul className="text-gray-600 list-inside list-disc space-y-2">
                {lessonPlan.tags.map((tag, index) => (
                  <li key={index}>{tag}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No tags specified.</p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-4">
              Developmental Goals
            </h2>
            {lessonPlan.developmentGoals.length > 0 ? (
              <ul className="text-gray-600 list-inside list-disc space-y-2">
                {lessonPlan.developmentGoals.map((goal, index) => (
                  <li key={index}>
                    <strong className="text-teal-800">{goal.name}</strong>
                    <p>{goal.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No developmental goals specified.</p>
            )}
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-teal-400 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-500 transition"
          >
            Back to Form
          </button>
        </div>
      </main>
      <footer className="text-center text-gray-600 mt-8">
        <p className="text-sm">© 2025 PlayPlanCraft. All rights reserved.</p>
      </footer>
    </div>
  );
}
