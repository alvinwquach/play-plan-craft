"use client";

import { useState, useEffect, useCallback, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Source, Curriculum } from "../types/lessonPlan";
import { createLessonPlan } from "../actions/createLessonPlan";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  standardsFramework: string;
  standards: string[];
  scheduledDate: string;
  preferredSources: Source[];
  curriculum: Curriculum;
}

const formatLabel = (value: string): string => {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function LessonPlanForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    gradeLevel: "PRESCHOOL",
    subject: "SCIENCE",
    theme: "",
    duration: 30,
    activityTypes: [],
    classroomSize: 10,
    learningIntention: "",
    successCriteria: [],
    standardsFramework: "",
    standards: [],
    scheduledDate: "",
    preferredSources: [
      {
        name: "Khan Academy",
        url: "https://www.khanacademy.org",
        description: "Used for activity ideas and educational content.",
      },
    ],
    curriculum: "US",
  });
  const [successCriteriaInput, setSuccessCriteriaInput] = useState<string>("");
  const [standardsInput, setStandardsInput] = useState<string>("");
  const [sourceInputs, setSourceInputs] = useState<
    { name: string; url: string; description: string }[]
  >([
    {
      name: "Khan Academy",
      url: "https://www.khanacademy.org",
      description: "Used for activity ideas and educational content.",
    },
  ]);
  const [customTheme, setCustomTheme] = useState<string>("");
  const [customActivityType, setCustomActivityType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;

    const messages = [
      "Contacting AI service...",
      "Generating lesson plan activities...",
      "Aligning with curriculum standards...",
      "Saving lesson plan to database...",
    ];

    const toastIds = messages.map((message) =>
      toast.loading(message, {
        position: "top-right",
        autoClose: false,
      })
    );

    return () => {
      toastIds.forEach((id) => toast.dismiss(id));
    };
  }, [loading]);

  const gradeLevels = useMemo(
    () => [
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
    ],
    []
  );

  const allSubjects = useMemo(
    () => ({
      US: [
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
      ],
      AUS: [
        "ENGLISH",
        "MATHEMATICS",
        "SCIENCE",
        "THE_ARTS",
        "HEALTH_PE",
        "SOCIAL_EMOTIONAL",
        "HUMANITIES_SOCIAL_SCIENCES",
        "TECHNOLOGIES",
        "LANGUAGES",
        "CIVICS_CITIZENSHIP",
      ],
    }),
    []
  );

  const allThemes = useMemo(
    () => ({
      US: [
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
      ],
      AUS: [
        "SEASONS",
        "NATURE",
        "INDIGENOUS_CULTURE",
        "COMMUNITY",
        "ANIMALS",
        "TRANSPORT",
        "COLOURS",
        "SHAPES",
        "NUMBERS",
        "AUSTRALIAN_HISTORY",
        "SUSTAINABILITY",
        "TECHNOLOGY",
        "GLOBAL_ISSUES",
        "LITERATURE",
      ],
    }),
    []
  );

  const allActivityTypes = useMemo(
    () => ({
      US: [
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
      ],
      AUS: [
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
        "INDIGENOUS_STORY",
      ],
    }),
    []
  );

  const standardsFrameworks = useMemo(
    () => ({
      US: ["COMMON_CORE", "NGSS", "STATE_SPECIFIC"],
      AUS: ["ACARA"],
    }),
    []
  );

  const earlyGrades = useMemo(
    () => ["INFANT", "TODDLER", "PRESCHOOL", "KINDERGARTEN"],
    []
  );
  const elementaryGrades = useMemo(
    () => ["GRADE_1", "GRADE_2", "GRADE_3", "GRADE_4", "GRADE_5"],
    []
  );
  const middleSchoolGrades = useMemo(
    () => ["GRADE_6", "GRADE_7", "GRADE_8"],
    []
  );
  const highSchoolGrades = useMemo(
    () => ["GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"],
    []
  );

  const getAvailableSubjects = useCallback(
    (gradeLevel: string, curriculum: string) => {
      if (earlyGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
              "LITERACY",
              "MATH",
              "SCIENCE",
              "ART",
              "MUSIC",
              "PHYSICAL_EDUCATION",
              "SOCIAL_EMOTIONAL",
            ]
          : [
              "ENGLISH",
              "MATHEMATICS",
              "SCIENCE",
              "THE_ARTS",
              "HEALTH_PE",
              "SOCIAL_EMOTIONAL",
            ];
      } else if (elementaryGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
              "LITERACY",
              "MATH",
              "SCIENCE",
              "ART",
              "MUSIC",
              "PHYSICAL_EDUCATION",
              "SOCIAL_EMOTIONAL",
              "HISTORY",
              "GEOGRAPHY",
            ]
          : [
              "ENGLISH",
              "MATHEMATICS",
              "SCIENCE",
              "THE_ARTS",
              "HEALTH_PE",
              "SOCIAL_EMOTIONAL",
              "HUMANITIES_SOCIAL_SCIENCES",
              "TECHNOLOGIES",
            ];
      } else if (middleSchoolGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
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
            ]
          : [
              "ENGLISH",
              "MATHEMATICS",
              "SCIENCE",
              "THE_ARTS",
              "HEALTH_PE",
              "SOCIAL_EMOTIONAL",
              "HUMANITIES_SOCIAL_SCIENCES",
              "TECHNOLOGIES",
              "LANGUAGES",
            ];
      } else if (highSchoolGrades.includes(gradeLevel)) {
        return curriculum === "US" ? allSubjects.US : allSubjects.AUS;
      }
      return [];
    },
    [
      allSubjects,
      earlyGrades,
      elementaryGrades,
      middleSchoolGrades,
      highSchoolGrades,
    ]
  );

  const getAvailableThemes = useCallback(
    (gradeLevel: string, curriculum: string) => {
      if (earlyGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
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
            ]
          : [
              "SEASONS",
              "NATURE",
              "INDIGENOUS_CULTURE",
              "COMMUNITY",
              "ANIMALS",
              "TRANSPORT",
              "COLOURS",
              "SHAPES",
              "NUMBERS",
            ];
      } else if (elementaryGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
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
            ]
          : [
              "SEASONS",
              "NATURE",
              "INDIGENOUS_CULTURE",
              "COMMUNITY",
              "ANIMALS",
              "TRANSPORT",
              "COLOURS",
              "SHAPES",
              "NUMBERS",
              "AUSTRALIAN_HISTORY",
              "SUSTAINABILITY",
            ];
      } else if (middleSchoolGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
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
            ]
          : [
              "SEASONS",
              "NATURE",
              "INDIGENOUS_CULTURE",
              "COMMUNITY",
              "ANIMALS",
              "TRANSPORT",
              "AUSTRALIAN_HISTORY",
              "SUSTAINABILITY",
              "TECHNOLOGY",
            ];
      } else if (highSchoolGrades.includes(gradeLevel)) {
        return curriculum === "US" ? allThemes.US : allThemes.AUS;
      }
      return [];
    },
    [
      allThemes,
      earlyGrades,
      elementaryGrades,
      middleSchoolGrades,
      highSchoolGrades,
    ]
  );

  const getAvailableActivityTypes = useCallback(
    (gradeLevel: string, curriculum: string) => {
      if (earlyGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
              "STORYTELLING",
              "CRAFT",
              "MOVEMENT",
              "MUSIC",
              "FREE_PLAY",
              "OUTDOOR",
            ]
          : [
              "STORYTELLING",
              "CRAFT",
              "MOVEMENT",
              "MUSIC",
              "FREE_PLAY",
              "OUTDOOR",
              "INDIGENOUS_STORY",
            ];
      } else if (elementaryGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
              "STORYTELLING",
              "CRAFT",
              "MOVEMENT",
              "MUSIC",
              "EXPERIMENT",
              "FREE_PLAY",
              "OUTDOOR",
              "WRITING",
              "PROJECT",
            ]
          : [
              "STORYTELLING",
              "CRAFT",
              "MOVEMENT",
              "MUSIC",
              "EXPERIMENT",
              "FREE_PLAY",
              "OUTDOOR",
              "WRITING",
              "PROJECT",
              "INDIGENOUS_STORY",
            ];
      } else if (middleSchoolGrades.includes(gradeLevel)) {
        return curriculum === "US"
          ? [
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
            ]
          : [
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
              "INDIGENOUS_STORY",
            ];
      } else if (highSchoolGrades.includes(gradeLevel)) {
        return curriculum === "US" ? allActivityTypes.US : allActivityTypes.AUS;
      }
      return [];
    },
    [
      allActivityTypes,
      earlyGrades,
      elementaryGrades,
      middleSchoolGrades,
      highSchoolGrades,
    ]
  );

  useEffect(() => {
    const availableSubjects = getAvailableSubjects(
      formData.gradeLevel,
      formData.curriculum
    );
    const availableThemes = getAvailableThemes(
      formData.gradeLevel,
      formData.curriculum
    );
    const availableActivityTypes = getAvailableActivityTypes(
      formData.gradeLevel,
      formData.curriculum
    );
    const availableStandardsFrameworks =
      standardsFrameworks[formData.curriculum];

    if (!availableSubjects.includes(formData.subject)) {
      setFormData((prev) => ({ ...prev, subject: availableSubjects[0] || "" }));
    }

    if (
      formData.theme &&
      formData.theme !== "OTHER" &&
      !availableThemes.includes(formData.theme)
    ) {
      setFormData((prev) => ({ ...prev, theme: "" }));
      setCustomTheme("");
    }

    const validActivityTypes = formData.activityTypes.filter(
      (type) =>
        availableActivityTypes.includes(type) ||
        !allActivityTypes[formData.curriculum].includes(type)
    );

    if (validActivityTypes.length !== formData.activityTypes.length) {
      setFormData((prev) => ({
        ...prev,
        activityTypes: validActivityTypes,
      }));
    }

    if (!availableStandardsFrameworks.includes(formData.standardsFramework)) {
      setFormData((prev) => ({
        ...prev,
        standardsFramework: "",
        standards: [],
      }));
    }
  }, [
    formData.activityTypes,
    formData.gradeLevel,
    formData.subject,
    formData.theme,
    formData.curriculum,
    formData.standardsFramework,
    getAvailableSubjects,
    getAvailableThemes,
    getAvailableActivityTypes,
    standardsFrameworks,
    allActivityTypes,
  ]);

  const handleAddSource = () => {
    setSourceInputs((prev) => [
      ...prev,
      { name: "", url: "", description: "" },
    ]);
  };

  const handleRemoveSource = (index: number) => {
    setSourceInputs((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      preferredSources: prev.preferredSources.filter((_, i) => i !== index),
    }));
  };

  const handleSourceChange = (
    index: number,
    field: keyof Source,
    value: string
  ) => {
    setSourceInputs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setFormData((prev) => ({
      ...prev,
      preferredSources: sourceInputs.map((input, i) =>
        i === index ? { ...input, [field]: value } : input
      ),
    }));
  };

  const handleAddCustomActivityType = () => {
    if (customActivityType.trim()) {
      setFormData((prev) => ({
        ...formData,
        activityTypes: [...prev.activityTypes, customActivityType.trim()],
      }));
      setCustomActivityType("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate other fields
    if (!formData.scheduledDate) {
      setError("Scheduled date and time are required.");
      setLoading(false);
      return;
    }

    const scheduledDate = new Date(formData.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
      setError("Invalid scheduled date and time.");
      setLoading(false);
      return;
    }

    const now = new Date();
    if (scheduledDate < now) {
      setError("Scheduled date and time cannot be in the past.");
      setLoading(false);
      return;
    }

    if (formData.duration < 5 || formData.duration > 120) {
      setError("Duration must be between 5 and 120 minutes.");
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

    const standards = standardsInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => ({
        code: line,
        description: line,
      }));
    if (formData.standardsFramework && standards.length === 0) {
      setError(
        "At least one standard is required when a standards framework is selected."
      );
      setLoading(false);
      return;
    }

    const invalidSource = formData.preferredSources.find(
      (source) =>
        source.url &&
        !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(source.url)
    );
    if (invalidSource) {
      setError(`Invalid URL for source: ${invalidSource.name || "Unnamed"}`);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      if (formData.title) formDataToSend.append("title", formData.title);
      formDataToSend.append("gradeLevel", formData.gradeLevel);
      formDataToSend.append("subject", formData.subject);
      if (formData.theme === "OTHER") {
        if (customTheme) formDataToSend.append("theme", customTheme);
      } else if (formData.theme) {
        formDataToSend.append("theme", formData.theme);
      }
      formDataToSend.append("duration", formData.duration.toString());
      if (formData.activityTypes.length > 0) {
        formDataToSend.append(
          "activityTypes",
          formData.activityTypes.join(",")
        );
      }
      formDataToSend.append("classroomSize", formData.classroomSize.toString());
      if (formData.learningIntention) {
        formDataToSend.append("learningIntention", formData.learningIntention);
      }
      if (criteria.length > 0) {
        formDataToSend.append("successCriteria", criteria.join(","));
      }
      if (formData.standardsFramework) {
        formDataToSend.append(
          "standardsFramework",
          formData.standardsFramework
        );
      }
      if (standards.length > 0) {
        formDataToSend.append("standards", JSON.stringify(standards));
      }
      if (formData.preferredSources.length > 0) {
        formDataToSend.append(
          "preferredSources",
          JSON.stringify(formData.preferredSources)
        );
      }
      formDataToSend.append("curriculum", formData.curriculum);
      if (formData.scheduledDate) {
        formDataToSend.append("scheduledDate", formData.scheduledDate);
      }

      const result = await createLessonPlan(formDataToSend);

      if (result.success) {
        toast.success("Lesson plan created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        router.push("/calendar");
      } else {
        throw new Error(result.error || "Failed to create lesson plan");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "An error occurred", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-teal-50 text-gray-800 h-screen p-0 overflow-hidden">
      <main className="max-w-2xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center py-6 px-8 bg-white z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 text-center">
              Create Your Lesson Plan
            </h1>
            <p className="text-sm text-gray-600 text-center mt-2">
              Whether you&apos;re nurturing infants or managing high school
              you&apos;re nurturing infants or managing high school projects,
              our AI-driven platform has you covered.
            </p>
          </div>
        </div>
        <div className="bg-white flex-1 overflow-y-auto p-6 sm:p-8 shadow-inner border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6 pb-12">
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Curriculum
              </label>
              <select
                value={formData.curriculum}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    curriculum: e.target.value as Curriculum,
                  })
                }
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              >
                <option value="US">United States</option>
                <option value="AUS">Australia</option>
              </select>
            </div>
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
                      {grade}
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
                  {getAvailableSubjects(
                    formData.gradeLevel,
                    formData.curriculum
                  ).map((subject) => (
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
                  Theme (Optional)
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => {
                    setFormData({ ...formData, theme: e.target.value });
                    if (e.target.value !== "OTHER") {
                      setCustomTheme("");
                    }
                  }}
                  className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">Select a theme</option>
                  {getAvailableThemes(
                    formData.gradeLevel,
                    formData.curriculum
                  ).map((theme) => (
                    <option key={theme} value={theme}>
                      {formatLabel(theme)}
                    </option>
                  ))}
                  <option value="OTHER">Other</option>
                </select>
                {formData.theme === "OTHER" && (
                  <input
                    type="text"
                    value={customTheme}
                    onChange={(e) => {
                      setCustomTheme(e.target.value);
                      setFormData({ ...formData, theme: "OTHER" });
                    }}
                    className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 mt-2"
                    placeholder="Enter custom theme"
                  />
                )}
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
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scheduledDate: e.target.value,
                  })
                }
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
                placeholder="Select date and time"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Activity Types (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {getAvailableActivityTypes(
                  formData.gradeLevel,
                  formData.curriculum
                ).map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={type}
                      value={type}
                      checked={formData.activityTypes.includes(type)}
                      onChange={(e) => {
                        const selectedTypes = e.target.checked
                          ? [...formData.activityTypes, type]
                          : formData.activityTypes.filter(
                              (item) => item !== type
                            );
                        setFormData({
                          ...formData,
                          activityTypes: selectedTypes,
                        });
                      }}
                      className="h-4 w-4 text-teal-400 focus:ring-teal-400"
                    />
                    <label htmlFor={type} className="ml-2 text-gray-600">
                      {formatLabel(type)}
                    </label>
                  </div>
                ))}
                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customActivityType}
                      onChange={(e) => setCustomActivityType(e.target.value)}
                      className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter custom activity type"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomActivityType}
                      className="text-teal-500 hover:text-teal-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
                {formData.activityTypes
                  .filter(
                    (type) =>
                      !getAvailableActivityTypes(
                        formData.gradeLevel,
                        formData.curriculum
                      ).includes(type)
                  )
                  .map((type, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`custom-${type}`}
                        value={type}
                        checked={formData.activityTypes.includes(type)}
                        onChange={(e) => {
                          const selectedTypes = e.target.checked
                            ? [...formData.activityTypes, type]
                            : formData.activityTypes.filter(
                                (item) => item !== type
                              );
                          setFormData({
                            ...formData,
                            activityTypes: selectedTypes,
                          });
                        }}
                        className="h-4 w-4 text-teal-400 focus:ring-teal-400"
                      />
                      <label
                        htmlFor={`custom-${type}`}
                        className="ml-2 text-gray-600"
                      >
                        {formatLabel(type)}
                      </label>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select multiple activity types or add custom ones.
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
                Success Criteria (Optional, one per line, start with &apos;I
                can&apos;)
              </label>
              <textarea
                value={successCriteriaInput}
                onChange={(e) => setSuccessCriteriaInput(e.target.value)}
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Enter success criteria, one per line (e.g., I can ...)"
                rows={5}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Standards Framework (Optional)
              </label>
              <select
                value={formData.standardsFramework}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    standardsFramework: e.target.value,
                    standards: [],
                  })
                }
                className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="">Select a standards framework</option>
                {standardsFrameworks[formData.curriculum].map((framework) => (
                  <option key={framework} value={framework}>
                    {framework.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            {formData.standardsFramework && (
              <div>
                <label className="block text-sm font-semibold text-teal-800 mb-2">
                  Standards (Optional, one per line, e.g.,{" "}
                  {formData.curriculum === "US"
                    ? "CCSS.MATH.CONTENT.2.OA.A.1"
                    : "AC9M4N01"}
                  )
                </label>
                <textarea
                  value={standardsInput}
                  onChange={(e) => setStandardsInput(e.target.value)}
                  className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder={`Enter standards, one per line (e.g., ${
                    formData.curriculum === "US"
                      ? "CCSS.MATH.CONTENT.2.OA.A.1"
                      : "AC9M4N01"
                  })`}
                  rows={5}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-teal-800 mb-2">
                Preferred Sources (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Add trusted sources for activities and lesson content (e.g.,{" "}
                {formData.curriculum === "US"
                  ? "Khan Academy, NSTA"
                  : "ACARA, Scootle"}
                ). If none provided, default sources will be used.
              </p>
              {sourceInputs.map((source, index) => (
                <div key={index} className="space-y-2 mb-4">
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) =>
                      handleSourceChange(index, "name", e.target.value)
                    }
                    className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder={`Source Name (e.g., ${
                      formData.curriculum === "US" ? "Khan Academy" : "ACARA"
                    })`}
                  />
                  <input
                    type="url"
                    value={source.url}
                    onChange={(e) =>
                      handleSourceChange(index, "url", e.target.value)
                    }
                    className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder={`Source URL (e.g., ${
                      formData.curriculum === "US"
                        ? "https://www.khanacademy.org"
                        : "https://www.australiancurriculum.edu.au"
                    })`}
                  />
                  <input
                    type="text"
                    value={source.description}
                    onChange={(e) =>
                      handleSourceChange(index, "description", e.target.value)
                    }
                    className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Description (e.g., Used for activity ideas)"
                  />
                  {sourceInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove Source
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSource}
                className="text-teal-500 hover:text-teal-700 text-sm"
              >
                + Add Source
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Note: Development goals, strategies, standards alignment, and
              source metadata will be automatically generated based on your
              input and the {formData.curriculum} curriculum.
            </p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-400 text-white py-3 px-4 rounded-full text-lg font-semibold hover:bg-teal-500 transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate and Schedule Lesson Plan"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}