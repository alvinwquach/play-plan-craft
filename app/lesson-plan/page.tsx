"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  ageGroup: string;
  subject: string;
  theme: string;
  duration: number;
  activityTypes: string[];
  classroomSize: number;
}

export default function LessonPlanForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    ageGroup: "PRESCHOOL",
    subject: "SCIENCE",
    theme: "",
    duration: 30,
    activityTypes: ["STORYTELLING"],
    classroomSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ageGroups = ["INFANT", "TODDLER", "PRESCHOOL", "KINDERGARTEN"];
  const subjects = [
    "LITERACY",
    "MATH",
    "SCIENCE",
    "ART",
    "MUSIC",
    "PHYSICAL_EDUCATION",
    "SOCIAL_EMOTIONAL",
  ];
  const themes = [
    "SEASONS",
    "NATURE",
    "HOLIDAYS",
    "EMOTIONS",
    "COMMUNITY",
    "ANIMALS",
    "TRANSPORTATION",
    "COLORS",
    "SHAPES",
    "NUMBERS",
  ];
  const activityTypes = [
    "STORYTELLING",
    "CRAFT",
    "MOVEMENT",
    "MUSIC",
    "EXPERIMENT",
    "FREE_PLAY",
    "OUTDOOR",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.duration < 5 || formData.duration > 120) {
      setError("Duration must be between 5 and 120 minutes.");
      setLoading(false);
      return;
    }

    if (formData.activityTypes.length === 0) {
      setError("At least one activity type is required.");
      setLoading(false);
      return;
    }

    if (formData.classroomSize < 1 || formData.classroomSize > 100) {
      setError("Classroom size must be between 1 and 100 students.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/openai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to generate lesson plan");
      }

      const encodedLessonPlan = encodeURIComponent(
        JSON.stringify(data.lessonPlan)
      );
      router.push(`/lesson-plans?lessonPlan=${encodedLessonPlan}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-teal-50 text-gray-800 min-h-screen p-8 sm:p-16">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 mb-8 text-center">
          Create Your Lesson Plan
        </h1>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Enter lesson plan title"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-teal-800 mb-2">
                  Age Group
                </label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, ageGroup: e.target.value })
                  }
                  className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  required
                >
                  {ageGroups.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-teal-800 mb-2">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  required
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-teal-800 mb-2">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) =>
                    setFormData({ ...formData, theme: e.target.value })
                  }
                  className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">Select a theme</option>
                  {themes.map((theme) => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-teal-800 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Number(e.target.value),
                    })
                  }
                  className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  min="5"
                  max="120"
                  required
                  placeholder="Enter duration in minutes"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Classroom Size (number of students)
              </label>
              <input
                type="number"
                value={formData.classroomSize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classroomSize: Number(e.target.value),
                  })
                }
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                min="1"
                max="100"
                required
                placeholder="Enter number of students"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Activity Types
              </label>
              <select
                multiple
                value={formData.activityTypes}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFormData({
                    ...formData,
                    activityTypes: selected,
                  });
                }}
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Hold Ctrl/Cmd to select multiple activity types
              </p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-400 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-500 transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Lesson Plan"}
            </button>
          </form>
        </div>
      </main>
      <footer className="text-center text-gray-600 mt-8">
        <p className="text-sm">© 2025 PlayPlanCraft. All rights reserved.</p>
      </footer>
    </div>
  );
}