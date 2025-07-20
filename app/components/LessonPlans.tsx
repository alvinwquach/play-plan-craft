"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface LessonPlan {
  title: string;
  gradeLevel: string;
  subject: string;
  theme: string | null;
  status: string;
  duration: number;
  classroomSize: number;
  learningIntention: string;
  successCriteria: string[];
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
    shoppingLink?: string;
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
  const [selectedRetailer, setSelectedRetailer] = useState<
    "google" | "amazon" | "walmart" | "lakeshore"
  >("google");

  const retailers = [
    { value: "google", label: "Google Shopping" },
    { value: "amazon", label: "Amazon" },
    { value: "walmart", label: "Walmart" },
    { value: "lakeshore", label: "Lakeshore Learning" },
  ];

  const generateShoppingLink = (
    supply: LessonPlan["supplies"][0],
    retailer: string
  ): string => {
    let query = supply.name;
    if (supply.name.toLowerCase().includes("book")) {
      const context = supply.note?.toLowerCase() || "preschool";
      query = `preschool ${supply.name.toLowerCase()} ${context}`;
    } else {
      query = `${supply.name} classroom`;
    }
    const encodedQuery = encodeURIComponent(query.trim());

    switch (retailer) {
      case "amazon":
        return `https://www.amazon.com/s?k=${encodedQuery}`;
      case "walmart":
        return `https://www.walmart.com/search?q=${encodedQuery}`;
      case "lakeshore":
        return `https://www.lakeshorelearning.com/search?Ntt=${encodedQuery}`;
      case "google":
      default:
        return `https://www.google.com/search?tbm=shop&q=${encodedQuery}`;
    }
  };

  useEffect(() => {
    const fetchLessonPlan = async () => {
      setLoading(true);
      setError(null);

      const lessonPlanData = searchParams.get("lessonPlan");
      if (lessonPlanData) {
        try {
          const parsed = JSON.parse(decodeURIComponent(lessonPlanData));
          const updatedSupplies = parsed.supplies.map(
            (supply: LessonPlan["supplies"][0]) => ({
              ...supply,
              shoppingLink: generateShoppingLink(supply, selectedRetailer),
            })
          );
          setLessonPlan({ ...parsed, supplies: updatedSupplies });
        } catch (err) {
          console.error("Error parsing lesson plan:", err);
          setError(
            err instanceof Error
              ? `Parse error: ${err.message}`
              : "Failed to parse lesson plan data"
          );
        }
        setLoading(false);
        return;
      }
    };

    fetchLessonPlan();
  }, [searchParams, selectedRetailer]);

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
              Learning Intention
            </h2>
            <p className="text-gray-600">{lessonPlan.learningIntention}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-4">
              Success Criteria
            </h2>
            {lessonPlan.successCriteria.length > 0 ? (
              <ul className="text-gray-600 list-inside list-disc space-y-2">
                {lessonPlan.successCriteria.map((criterion, index) => (
                  <li key={index}>{criterion}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No success criteria specified.</p>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-4">
              Details
            </h2>
            <ul className="text-gray-600 list-inside list-disc">
              <li>
                <strong>Grade Level:</strong>{" "}
                {lessonPlan.gradeLevel.replace("_", " ")}{" "}
              </li>
              <li>
                <strong>Subject:</strong> {lessonPlan.subject.replace("_", " ")}
              </li>
              <li>
                <strong>Theme:</strong>{" "}
                {lessonPlan.theme ? lessonPlan.theme.replace("_", " ") : "None"}
              </li>
              <li>
                <strong>Status:</strong> {lessonPlan.status}
              </li>
              <li>
                <strong>Duration:</strong> {lessonPlan.duration} minutes
              </li>
              <li>
                <strong>Classroom Size:</strong> {lessonPlan.classroomSize}{" "}
                students
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
                      {activity.title} (
                      {activity.activityType.replace("_", " ")})
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
            <div className="mb-4">
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Select Retailer
              </label>
              <select
                value={selectedRetailer}
                onChange={(e) =>
                  setSelectedRetailer(
                    e.target.value as
                      | "google"
                      | "amazon"
                      | "walmart"
                      | "lakeshore"
                  )
                }
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {retailers.map((retailer) => (
                  <option key={retailer.value} value={retailer.value}>
                    {retailer.label}
                  </option>
                ))}
              </select>
            </div>
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
                    {supply.shoppingLink && (
                      <p className="text-sm">
                        <a
                          href={supply.shoppingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-500 hover:underline"
                        >
                          Find {supply.name} on{" "}
                          {
                            retailers.find((r) => r.value === selectedRetailer)
                              ?.label
                          }
                        </a>
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