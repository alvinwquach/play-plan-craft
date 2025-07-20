"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  gradeLevel: string;
  subject: string;
  theme: string;
  duration: number;
  activityTypes: string[];
  classroomSize: number;
  learningIntention: string;
  successCriteria: string[];
}

export default function LessonPlanForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    gradeLevel: "PRESCHOOL",
    subject: "SCIENCE",
    theme: "",
    duration: 30,
    activityTypes: ["STORYTELLING"],
    classroomSize: 10,
    learningIntention: "",
    successCriteria: [],
  });
  const [successCriteriaInput, setSuccessCriteriaInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gradeLevels = [
    "INFANT",
    "TODDLER",
    "PRESCHOOL",
    "KINDERGARTEN",
    "GRADE_1",
    "GRADE_2",
    "GRADE_3",
    "GRADE_4",
    "GRADE_5",
    "GRADE_6",
    "GRADE_7",
    "GRADE_8",
    "GRADE_9",
    "GRADE_10",
    "GRADE_11",
    "GRADE_12",
  ];

  const allSubjects = [
    "LITERACY",
    "MATH",
    "SCIENCE",
    "ART",
    "MUSIC",
    "PHYSICAL_EDUCATION",
    "SOCIAL_EMOTIONAL",
    "HISTORY",
    "LITERATURE",
    "GEOGRAPHY",
    "STEM",
    "FOREIGN_LANGUAGE",
    "COMPUTER_SCIENCE",
    "CIVICS",
  ];

  const allThemes = [
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
    "CULTURE",
    "HISTORY",
    "SCIENCE_FICTION",
    "GLOBAL_ISSUES",
    "TECHNOLOGY",
    "LITERATURE",
  ];

  const allActivityTypes = [
    "STORYTELLING",
    "CRAFT",
    "MOVEMENT",
    "MUSIC",
    "EXPERIMENT",
    "FREE_PLAY",
    "OUTDOOR",
    "GROUP_DISCUSSION",
    "PROJECT",
    "PRESENTATION",
    "WRITING",
    "RESEARCH",
    "DEBATE",
    "CODING",
  ];

  const earlyGrades = ["INFANT", "TODDLER", "PRESCHOOL", "KINDERGARTEN"];
  const elementaryGrades = [
    "GRADE_1",
    "GRADE_2",
    "GRADE_3",
    "GRADE_4",
    "GRADE_5",
  ];
  const middleSchoolGrades = ["GRADE_6", "GRADE_7", "GRADE_8"];
  const highSchoolGrades = ["GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"];

  const getAvailableSubjects = (gradeLevel: string) => {
    if (earlyGrades.includes(gradeLevel)) {
      return [
        "LITERACY",
        "MATH",
        "SCIENCE",
        "ART",
        "MUSIC",
        "PHYSICAL_EDUCATION",
        "SOCIAL_EMOTIONAL",
      ];
    } else if (elementaryGrades.includes(gradeLevel)) {
      return [
        "LITERACY",
        "MATH",
        "SCIENCE",
        "ART",
        "MUSIC",
        "PHYSICAL_EDUCATION",
        "SOCIAL_EMOTIONAL",
        "HISTORY",
        "GEOGRAPHY",
      ];
    } else if (middleSchoolGrades.includes(gradeLevel)) {
      return [
        "LITERACY",
        "MATH",
        "SCIENCE",
        "ART",
        "MUSIC",
        "PHYSICAL_EDUCATION",
        "SOCIAL_EMOTIONAL",
        "HISTORY",
        "LITERATURE",
        "GEOGRAPHY",
        "STEM",
      ];
    } else if (highSchoolGrades.includes(gradeLevel)) {
      return allSubjects;
    }
    return [];
  };

  const getAvailableThemes = (gradeLevel: string) => {
    if (earlyGrades.includes(gradeLevel)) {
      return [
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
    } else if (elementaryGrades.includes(gradeLevel)) {
      return [
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
        "CULTURE",
        "HISTORY",
      ];
    } else if (middleSchoolGrades.includes(gradeLevel)) {
      return [
        "SEASONS",
        "NATURE",
        "HOLIDAYS",
        "EMOTIONS",
        "COMMUNITY",
        "ANIMALS",
        "TRANSPORTATION",
        "CULTURE",
        "HISTORY",
        "SCIENCE_FICTION",
        "TECHNOLOGY",
      ];
    } else if (highSchoolGrades.includes(gradeLevel)) {
      return allThemes;
    }
    return [];
  };

  const getAvailableActivityTypes = (gradeLevel: string) => {
    if (earlyGrades.includes(gradeLevel)) {
      return [
        "STORYTELLING",
        "CRAFT",
        "MOVEMENT",
        "MUSIC",
        "FREE_PLAY",
        "OUTDOOR",
      ];
    } else if (elementaryGrades.includes(gradeLevel)) {
      return [
        "STORYTELLING",
        "CRAFT",
        "MOVEMENT",
        "MUSIC",
        "EXPERIMENT",
        "FREE_PLAY",
        "OUTDOOR",
        "WRITING",
        "PROJECT",
      ];
    } else if (middleSchoolGrades.includes(gradeLevel)) {
      return [
        "STORYTELLING",
        "CRAFT",
        "MOVEMENT",
        "MUSIC",
        "EXPERIMENT",
        "OUTDOOR",
        "GROUP_DISCUSSION",
        "PROJECT",
        "PRESENTATION",
        "WRITING",
      ];
    } else if (highSchoolGrades.includes(gradeLevel)) {
      return allActivityTypes;
    }
    return [];
  };

  useEffect(() => {
    const availableSubjects = getAvailableSubjects(formData.gradeLevel);
    const availableThemes = getAvailableThemes(formData.gradeLevel);
    const availableActivityTypes = getAvailableActivityTypes(
      formData.gradeLevel
    );

    if (!availableSubjects.includes(formData.subject)) {
      setFormData((prev) => ({ ...prev, subject: availableSubjects[0] || "" }));
    }

    if (formData.theme && !availableThemes.includes(formData.theme)) {
      setFormData((prev) => ({ ...prev, theme: "" }));
    }

    const validActivityTypes = formData.activityTypes.filter((type) =>
      availableActivityTypes.includes(type)
    );

    if (validActivityTypes.length !== formData.activityTypes.length) {
      setFormData((prev) => ({
        ...prev,
        activityTypes:
          validActivityTypes.length > 0
            ? validActivityTypes
            : [availableActivityTypes[0]],
      }));
    }
  }, [
    formData.activityTypes,
    formData.gradeLevel,
    formData.subject,
    formData.theme,
  ]);

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

    const criteria = successCriteriaInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (criteria.length > 0 && !criteria.every((c) => c.startsWith("I can"))) {
      setError("All success criteria must start with &apos;I can&apos;.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/openai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          successCriteria: criteria,
        }),
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
    <div className="bg-teal-50 text-gray-800 h-screen p-0 overflow-hidden">
      <main className="max-w-2xl mx-auto h-full flex flex-col">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 py-6 text-center bg-white  z-10">
          Create Your Lesson Plan
        </h1>
        <div className="bg-white flex-1 overflow-y-auto p-6 sm:p-8 shadow-inner border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6 pb-12">
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
                  Grade Level
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, gradeLevel: e.target.value })
                  }
                  className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  required
                >
                  {gradeLevels.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade.replace("_", " ")}
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
                  {getAvailableSubjects(formData.gradeLevel).map((subject) => (
                    <option key={subject} value={subject}>
                      {subject.replace("_", " ")}
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
                  {getAvailableThemes(formData.gradeLevel).map((theme) => (
                    <option key={theme} value={theme}>
                      {theme.replace("_", " ")}
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
                {getAvailableActivityTypes(formData.gradeLevel).map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Hold Ctrl/Cmd to select multiple activity types
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Learning Intention (Optional)
              </label>
              <input
                type="text"
                value={formData.learningIntention}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    learningIntention: e.target.value,
                  })
                }
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Enter learning intention"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Success Criteria (Optional, one per line, start with 'I can')
              </label>
              <textarea
                value={successCriteriaInput}
                onChange={(e) => setSuccessCriteriaInput(e.target.value)}
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Enter success criteria, one per line (e.g., I can ...)"
                rows={5}
              />
            </div>
            <p className="text-sm text-gray-600">
              Note: Development goals and strategies will be automatically
              generated based on your input.
            </p>
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
        <footer className="text-center text-gray-600 text-sm py-4 bg-white shadow-inner">
          © 2025 PlayPlanCraft. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
