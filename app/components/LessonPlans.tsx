"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { Document as DocxDocument, Paragraph, Packer } from "docx";
import { FaRegFileWord, FaFilePdf, FaPrint } from "react-icons/fa";
import { CiShare2 } from "react-icons/ci";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonPlan, Supply, Activity } from "../types/lessonPlan";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf" },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#333",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1a5f5f",
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderBottom: "1px solid #e0e0e0",
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a5f5f",
  },
  text: {
    marginBottom: 6,
    lineHeight: 1.6,
  },
  bullet: {
    marginLeft: 12,
    marginBottom: 6,
  },
  link: {
    color: "#0066cc",
    textDecoration: "underline",
  },
  subSection: {
    marginLeft: 20,
  },
});

const LessonPlannerPDF = ({ lessonPlan }: { lessonPlan: LessonPlan }) => (
  <Document
    title={lessonPlan.title}
    author="PlayPlanCraft"
    creator="PlayPlanCraft Lesson Planner"
    subject="Lesson Plan"
  >
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{lessonPlan.title}</Text>
      <View style={styles.section}>
        <Text style={styles.heading}>Learning Intention</Text>
        <Text style={styles.text}>
          {lessonPlan.learningIntention || "No learning intention specified."}
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Success Criteria</Text>
        {lessonPlan.successCriteria.length > 0 ? (
          lessonPlan.successCriteria.map((criterion, index) => (
            <Text key={index} style={styles.bullet}>
              • {criterion}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No success criteria specified.</Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Details</Text>
        <Text style={styles.bullet}>
          • Grade Level: {lessonPlan.gradeLevel.replace("_", " ")}
        </Text>
        <Text style={styles.bullet}>
          • Subject: {lessonPlan.subject.replace("_", " ")}
        </Text>
        <Text style={styles.bullet}>
          • Theme:{" "}
          {lessonPlan.theme ? lessonPlan.theme.replace("_", " ") : "None"}
        </Text>
        <Text style={styles.bullet}>• Status: {lessonPlan.status}</Text>
        <Text style={styles.bullet}>
          • Duration: {lessonPlan.duration} minutes
        </Text>
        <Text style={styles.bullet}>
          • Classroom Size: {lessonPlan.classroomSize} students
        </Text>
        {lessonPlan.scheduledDate && (
          <Text style={styles.bullet}>
            • Scheduled: {new Date(lessonPlan.scheduledDate).toLocaleString()}
          </Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Activities</Text>
        {lessonPlan.activities.length > 0 ? (
          lessonPlan.activities.map((activity, index) => (
            <View key={index} style={styles.bullet}>
              <Text style={styles.text}>
                {activity.title} ({activity.activityType.replace("_", " ")})
              </Text>
              <Text style={[styles.text, styles.subSection]}>
                {activity.description}
              </Text>
              <Text style={[styles.text, styles.subSection]}>
                Duration: {activity.durationMins} minutes
              </Text>
              <Text style={[styles.text, styles.subSection]}>
                Scores: Engagement ({activity.engagementScore}%), Alignment (
                {activity.alignmentScore}%), Feasibility (
                {activity.feasibilityScore}%)
              </Text>
              {activity.source && (
                <View style={styles.subSection}>
                  <Text style={styles.text}>
                    Source: {activity.source.name}
                  </Text>
                  <Text style={[styles.text, styles.link]}>
                    {activity.source.url}
                  </Text>
                  <Text style={styles.text}>{activity.source.description}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.text}>No activities available.</Text>
        )}
      </View>
      {lessonPlan.alternateActivities &&
        Object.keys(lessonPlan.alternateActivities).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Alternate Activities</Text>
            {Object.entries(lessonPlan.alternateActivities).map(
              ([activityType, activities], index) =>
                activities.length > 0 ? (
                  <View key={index} style={styles.bullet}>
                    <Text style={styles.text}>
                      {activityType.replace("_", " ")}
                    </Text>
                    {activities.map((activity, aIndex) => (
                      <View key={aIndex} style={styles.subSection}>
                        <Text style={styles.text}>
                          {activity.title} (
                          {activity.activityType.replace("_", " ")})
                        </Text>
                        <Text style={styles.text}>{activity.description}</Text>
                        <Text style={styles.text}>
                          Duration: {activity.durationMins} minutes
                        </Text>
                        <Text style={styles.text}>
                          Scores: Engagement ({activity.engagementScore}%),
                          Alignment ({activity.alignmentScore}%), Feasibility (
                          {activity.feasibilityScore}%)
                        </Text>
                        {activity.source && (
                          <>
                            <Text style={styles.text}>
                              Source: {activity.source.name}
                            </Text>
                            <Text style={[styles.text, styles.link]}>
                              {activity.source.url}
                            </Text>
                            <Text style={styles.text}>
                              {activity.source.description}
                            </Text>
                          </>
                        )}
                      </View>
                    ))}
                  </View>
                ) : null
            )}
          </View>
        )}
      <View style={styles.section}>
        <Text style={styles.heading}>Supplies</Text>
        {lessonPlan.supplies.length > 0 ? (
          lessonPlan.supplies.map((supply, index) => (
            <View key={index} style={styles.bullet}>
              <Text style={styles.text}>
                {supply.name} ({supply.quantity} {supply.unit})
              </Text>
              {supply.note && (
                <Text style={styles.text}>Note: {supply.note}</Text>
              )}
              {supply.shoppingLink && (
                <Text style={[styles.text, styles.link]}>
                  Shopping Link: {supply.shoppingLink}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.text}>No supplies required.</Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Tags</Text>
        {lessonPlan.tags.length > 0 ? (
          lessonPlan.tags.map((tag, index) => (
            <Text key={index} style={styles.bullet}>
              • {tag}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No tags specified.</Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Developmental Goals</Text>
        {lessonPlan.developmentGoals.length > 0 ? (
          lessonPlan.developmentGoals.map((goal, index) => (
            <View key={index} style={styles.bullet}>
              <Text style={styles.text}>{goal.name}</Text>
              <Text style={styles.text}>{goal.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No developmental goals specified.</Text>
        )}
      </View>
      {lessonPlan.gradeLevel === "PRESCHOOL" && lessonPlan.drdpDomains && (
        <View style={styles.section}>
          <Text style={styles.heading}>DRDP Domains</Text>
          {lessonPlan.drdpDomains.length > 0 ? (
            lessonPlan.drdpDomains.map((domain, index) => (
              <View key={index} style={styles.bullet}>
                <Text style={styles.text}>
                  {domain.code} - {domain.name}
                </Text>
                <Text style={styles.text}>{domain.description}</Text>
                {domain.strategies.map((strategy, sIndex) => (
                  <Text key={sIndex} style={[styles.bullet, styles.subSection]}>
                    • {strategy}
                  </Text>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.text}>
              No DRDP domains generated for this plan.
            </Text>
          )}
        </View>
      )}
      {lessonPlan.standards && lessonPlan.standards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Standards Alignment</Text>
          {lessonPlan.standards.map((standard, index) => (
            <View key={index} style={styles.bullet}>
              <Text style={styles.text}>{standard.code}</Text>
              <Text style={styles.text}>{standard.description}</Text>
              {standard.source && (
                <Text style={[styles.text, styles.link]}>
                  Source: {standard.source.name} ({standard.source.url})
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
      {lessonPlan.sourceMetadata && lessonPlan.sourceMetadata.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>General Source Metadata</Text>
          {lessonPlan.sourceMetadata.map((source, index) => (
            <View key={index} style={styles.bullet}>
              <Text style={styles.text}>{source.name}</Text>
              <Text style={[styles.text, styles.link]}>{source.url}</Text>
              <Text style={styles.text}>{source.description}</Text>
            </View>
          ))}
        </View>
      )}
      {lessonPlan.citationScore !== undefined && (
        <View style={styles.section}>
          <Text style={styles.heading}>Citation Score</Text>
          <Text style={styles.text}>
            {lessonPlan.citationScore}% (indicates reliability of sources used)
          </Text>
        </View>
      )}
    </Page>
  </Document>
);

const LessonPlanSkeleton = () => (
  <div className="bg-teal-50 text-gray-800 min-h-screen p-8 sm:p-16">
    <main className="max-w-2xl mx-auto">
      <Skeleton className="h-12 w-3/4 mx-auto mb-8 bg-gray-200" />
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-8">
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-full bg-gray-200" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-3/4 bg-gray-200" />
          <Skeleton className="h-4 w-3/4 mt-2 bg-gray-200" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-1/2 bg-gray-200" />
          <Skeleton className="h-4 w-1/2 mt-2 bg-gray-200" />
          <Skeleton className="h-4 w-1/2 mt-2 bg-gray-200" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-full mt-2 bg-gray-200" />
          <Skeleton className="h-4 w-full mt-2 bg-gray-200" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-3/4 bg-gray-200" />
          <Skeleton className="h-10 w-full mt-2 bg-gray-200" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-3/4 bg-gray-200" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-full bg-gray-200" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-full bg-gray-200" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/4 mb-4 bg-gray-200" />
          <Skeleton className="h-4 w-full bg-gray-200" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Skeleton className="h-6 w-6 bg-gray-200" />
          <Skeleton className="h-6 w-6 bg-gray-200" />
          <Skeleton className="h-6 w-6 bg-gray-200" />
          <Skeleton className="h-6 w-6 bg-gray-200" />
        </div>
        <Skeleton className="h-12 w-full bg-gray-200" />
      </div>
    </main>
  </div>
);

export default function LessonPlans() {
  const searchParams = useSearchParams();
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<
    "google" | "amazon" | "walmart" | "lakeshore"
  >("google");
  const [expandedActivityTypes, setExpandedActivityTypes] = useState<
    Set<string>
  >(new Set());

  const retailers = [
    { value: "google", label: "Google Shopping" },
    { value: "amazon", label: "Amazon" },
    { value: "walmart", label: "Walmart" },
    { value: "lakeshore", label: "Lakeshore Learning" },
  ] as const;

  const generateShoppingLink = (supply: Supply, retailer: string): string => {
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

  const toggleActivityType = (activityType: string) => {
    setExpandedActivityTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityType)) {
        newSet.delete(activityType);
      } else {
        newSet.add(activityType);
      }
      return newSet;
    });
  };

  const selectActivity = (activityType: string, selectedActivity: Activity) => {
    if (!lessonPlan) return;

    const updatedActivities = lessonPlan.activities.map((activity) =>
      activity.activityType === activityType ? selectedActivity : activity
    );

    const allSupplies = updatedActivities.flatMap((act) => act.supplies || []);
    const uniqueSupplies = Array.from(
      new Map(
        allSupplies.map((supply) => [
          supply.name,
          {
            ...supply,
            shoppingLink: generateShoppingLink(supply, selectedRetailer),
          },
        ])
      ).values()
    );

    setLessonPlan({
      ...lessonPlan,
      activities: updatedActivities,
      supplies: uniqueSupplies,
    });

    toast.success(
      `Selected "${selectedActivity.title}" for ${activityType.replace(
        "_",
        " "
      )}`,
      {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  const exportToPDF = async () => {
    if (!lessonPlan) return;

    setPdfLoading(true);
    try {
      const updatedLessonPlan = {
        ...lessonPlan,
        supplies: lessonPlan.supplies.map((supply) => ({
          ...supply,
          shoppingLink: generateShoppingLink(supply, selectedRetailer),
        })),
      };

      const blob = await pdf(
        <LessonPlannerPDF lessonPlan={updatedLessonPlan} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${lessonPlan.title.replace(/\s+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exported successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error(
        `Failed to generate PDF: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const printPDF = async () => {
    if (!lessonPlan) return;

    setPrintLoading(true);
    try {
      const updatedLessonPlan = {
        ...lessonPlan,
        supplies: lessonPlan.supplies.map((supply) => ({
          ...supply,
          shoppingLink: generateShoppingLink(supply, selectedRetailer),
        })),
      };

      const blob = await pdf(
        <LessonPlannerPDF lessonPlan={updatedLessonPlan} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
      } else {
        throw new Error("Failed to open print window");
      }
      toast.success("PDF opened for printing!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error generating PDF for printing:", err);
      toast.error(
        `Failed to print PDF: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setPrintLoading(false);
    }
  };

  const exportToWord = async () => {
    if (!lessonPlan) return;

    try {
      const doc = new DocxDocument({
        sections: [
          {
            children: [
              new Paragraph({
                text: lessonPlan.title,
                heading: "Heading1",
              }),
              new Paragraph({
                text: "Learning Intention",
                heading: "Heading2",
              }),
              new Paragraph({
                text:
                  lessonPlan.learningIntention ||
                  "No learning intention specified.",
              }),
              new Paragraph({
                text: "Success Criteria",
                heading: "Heading2",
              }),
              ...lessonPlan.successCriteria.map(
                (criterion) =>
                  new Paragraph({
                    text: criterion,
                    bullet: { level: 0 },
                  })
              ),
              new Paragraph({
                text: "Details",
                heading: "Heading2",
              }),
              new Paragraph({
                text: `Grade Level: ${lessonPlan.gradeLevel.replace("_", " ")}`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Subject: ${lessonPlan.subject.replace("_", " ")}`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Theme: ${
                  lessonPlan.theme ? lessonPlan.theme.replace("_", " ") : "None"
                }`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Status: ${lessonPlan.status}`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Duration: ${lessonPlan.duration} minutes`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Classroom Size: ${lessonPlan.classroomSize} students`,
                bullet: { level: 0 },
              }),
              ...(lessonPlan.scheduledDate
                ? [
                    new Paragraph({
                      text: `Scheduled: ${new Date(
                        lessonPlan.scheduledDate
                      ).toLocaleString()}`,
                      bullet: { level: 0 },
                    }),
                  ]
                : []),
              new Paragraph({
                text: "Activities",
                heading: "Heading2",
              }),
              ...lessonPlan.activities.flatMap((activity) => [
                new Paragraph({
                  text: `${activity.title} (${activity.activityType.replace(
                    "_",
                    " "
                  )})`,
                  bullet: { level: 0 },
                }),
                new Paragraph({ text: activity.description }),
                new Paragraph({
                  text: `Duration: ${activity.durationMins} minutes`,
                }),
                new Paragraph({
                  text: `Scores: Engagement (${activity.engagementScore}%), Alignment (${activity.alignmentScore}%), Feasibility (${activity.feasibilityScore}%)`,
                }),
                ...(activity.source
                  ? [
                      new Paragraph({
                        text: `Source: ${activity.source.name}`,
                      }),
                      new Paragraph({
                        text: `URL: ${activity.source.url}`,
                      }),
                      new Paragraph({
                        text: activity.source.description,
                      }),
                    ]
                  : [new Paragraph({ text: "No source provided." })]),
              ]),
              ...(lessonPlan.alternateActivities
                ? [
                    new Paragraph({
                      text: "Alternate Activities",
                      heading: "Heading2",
                    }),
                    ...Object.entries(lessonPlan.alternateActivities).flatMap(
                      ([activityType, activities]) =>
                        activities.length > 0
                          ? [
                              new Paragraph({
                                text: activityType.replace("_", " "),
                                bullet: { level: 0 },
                              }),
                              ...activities.flatMap((activity) => [
                                new Paragraph({
                                  text: `${
                                    activity.title
                                  } (${activity.activityType.replace(
                                    "_",
                                    " "
                                  )})`,
                                  bullet: { level: 1 },
                                }),
                                new Paragraph({ text: activity.description }),
                                new Paragraph({
                                  text: `Duration: ${activity.durationMins} minutes`,
                                }),
                                new Paragraph({
                                  text: `Scores: Engagement (${activity.engagementScore}%), Alignment (${activity.alignmentScore}%), Feasibility (${activity.feasibilityScore}%)`,
                                }),
                                ...(activity.source
                                  ? [
                                      new Paragraph({
                                        text: `Source: ${activity.source.name}`,
                                      }),
                                      new Paragraph({
                                        text: `URL: ${activity.source.url}`,
                                      }),
                                      new Paragraph({
                                        text: activity.source.description,
                                      }),
                                    ]
                                  : [
                                      new Paragraph({
                                        text: "No source provided.",
                                      }),
                                    ]),
                              ]),
                            ]
                          : []
                    ),
                  ]
                : []),
              new Paragraph({
                text: "Supplies",
                heading: "Heading2",
              }),
              ...lessonPlan.supplies.flatMap((supply) => [
                new Paragraph({
                  text: `${supply.name} (${supply.quantity} ${supply.unit})`,
                  bullet: { level: 0 },
                }),
                ...(supply.note
                  ? [new Paragraph({ text: `Note: ${supply.note}` })]
                  : []),
                ...(supply.shoppingLink
                  ? [
                      new Paragraph({
                        text: `Shopping Link: ${supply.shoppingLink}`,
                      }),
                    ]
                  : []),
              ]),
              new Paragraph({
                text: "Tags",
                heading: "Heading2",
              }),
              ...lessonPlan.tags.map(
                (tag) =>
                  new Paragraph({
                    text: tag,
                    bullet: { level: 0 },
                  })
              ),
              new Paragraph({
                text: "Developmental Goals",
                heading: "Heading2",
              }),
              ...lessonPlan.developmentGoals.flatMap((goal) => [
                new Paragraph({
                  text: goal.name,
                  bullet: { level: 0 },
                }),
                new Paragraph({ text: goal.description }),
              ]),
              ...(lessonPlan.gradeLevel === "PRESCHOOL" &&
              lessonPlan.drdpDomains
                ? [
                    new Paragraph({
                      text: "DRDP Domains",
                      heading: "Heading2",
                    }),
                    ...lessonPlan.drdpDomains.flatMap((domain) => [
                      new Paragraph({
                        text: `${domain.code} - ${domain.name}`,
                        bullet: { level: 0 },
                      }),
                      new Paragraph({ text: domain.description }),
                      ...domain.strategies.map(
                        (strategy) =>
                          new Paragraph({
                            text: strategy,
                            bullet: { level: 1 },
                          })
                      ),
                    ]),
                  ]
                : []),
              ...(lessonPlan.standards
                ? [
                    new Paragraph({
                      text: "Standards Alignment",
                      heading: "Heading2",
                    }),
                    ...lessonPlan.standards.flatMap((standard) => [
                      new Paragraph({
                        text: standard.code,
                        bullet: { level: 0 },
                      }),
                      new Paragraph({ text: standard.description }),
                      ...(standard.source
                        ? [
                            new Paragraph({
                              text: `Source: ${standard.source.name} (${standard.source.url})`,
                            }),
                          ]
                        : []),
                    ]),
                  ]
                : []),
              ...(lessonPlan.sourceMetadata &&
              lessonPlan.sourceMetadata.length > 0
                ? [
                    new Paragraph({
                      text: "General Source Metadata",
                      heading: "Heading2",
                    }),
                    ...lessonPlan.sourceMetadata.flatMap((source) => [
                      new Paragraph({
                        text: source.name,
                        bullet: { level: 0 },
                      }),
                      new Paragraph({ text: `URL: ${source.url}` }),
                      new Paragraph({ text: source.description }),
                    ]),
                  ]
                : []),
              ...(lessonPlan.citationScore !== undefined
                ? [
                    new Paragraph({
                      text: "Citation Score",
                      heading: "Heading2",
                    }),
                    new Paragraph({
                      text: `${lessonPlan.citationScore}% (indicates reliability of sources used)`,
                    }),
                  ]
                : []),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${lessonPlan.title.replace(/\s+/g, "_")}.docx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Word document exported successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error generating Word document:", err);
      toast.error(
        `Failed to generate Word document: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  const shareLessonPlan = () => {
    if (!lessonPlan) return;

    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success("Link copied to clipboard!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      })
      .catch((err) => {
        console.error("Error copying link:", err);
        toast.error(
          `Failed to copy link: ${
            err instanceof Error ? err.message : "Unknown error"
          }`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      });
  };

  useEffect(() => {
    const fetchLessonPlan = async () => {
      setLoading(true);
      setError(null);

      const lessonPlanData = searchParams.get("lessonPlan");
      if (lessonPlanData) {
        try {
          const parsed = JSON.parse(decodeURIComponent(lessonPlanData));
          const updatedSupplies = parsed.supplies.map((supply: Supply) => ({
            ...supply,
            shoppingLink: generateShoppingLink(supply, selectedRetailer),
          }));
          setLessonPlan({ ...parsed, supplies: updatedSupplies });
        } catch (err) {
          console.error("Error parsing lesson plan:", err);
          setError(
            err instanceof Error
              ? `Parse error: ${err.message}`
              : "Failed to parse lesson plan data"
          );
        }
      }
      setLoading(false);
    };

    fetchLessonPlan();
  }, [searchParams, selectedRetailer]);

  if (loading) {
    return <LessonPlanSkeleton />;
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
      <TooltipProvider>
        <main className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 mb-8 text-center">
            {lessonPlan.title}
          </h1>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-teal-800 mb-4">
                Learning Intention
              </h2>
              <p className="text-gray-600">
                {lessonPlan.learningIntention ||
                  "No learning intention specified."}
              </p>
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
                  {lessonPlan.gradeLevel.replace("_", " ")}
                </li>
                <li>
                  <strong>Subject:</strong>{" "}
                  {lessonPlan.subject.replace("_", " ")}
                </li>
                <li>
                  <strong>Theme:</strong>{" "}
                  {lessonPlan.theme
                    ? lessonPlan.theme.replace("_", " ")
                    : "None"}
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
                {lessonPlan.scheduledDate && (
                  <li>
                    <strong>Scheduled:</strong>{" "}
                    {new Date(lessonPlan.scheduledDate).toLocaleString()}
                  </li>
                )}
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
                      <div className="flex items-center justify-between">
                        <strong className="text-teal-800">
                          {activity.title} (
                          {activity.activityType.replace("_", " ")})
                        </strong>
                        {lessonPlan.alternateActivities?.[
                          activity.activityType
                        ] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleActivityType(activity.activityType)
                            }
                            className="flex items-center gap-1"
                          >
                            {expandedActivityTypes.has(
                              activity.activityType
                            ) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span>Alternatives</span>
                          </Button>
                        )}
                      </div>
                      <p>{activity.description}</p>
                      <p className="text-sm">
                        <strong>Duration:</strong> {activity.durationMins}{" "}
                        minutes
                      </p>
                      <p className="text-sm">
                        <strong>Scores:</strong> Engagement (
                        {activity.engagementScore}%), Alignment (
                        {activity.alignmentScore}%), Feasibility (
                        {activity.feasibilityScore}%)
                      </p>
                      {activity.source ? (
                        <p className="text-sm">
                          <strong>Source:</strong>{" "}
                          <a
                            href={activity.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-500 hover:underline"
                          >
                            {activity.source.name}
                          </a>
                          <br />
                          {activity.source.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No source provided.
                        </p>
                      )}
                      {lessonPlan.alternateActivities?.[
                        activity.activityType
                      ] &&
                        expandedActivityTypes.has(activity.activityType) && (
                          <div className="ml-6 mt-2 space-y-2">
                            <h3 className="text-sm font-semibold text-teal-800">
                              Alternate Activities for{" "}
                              {activity.activityType.replace("_", " ")}
                            </h3>
                            <ul className="list-inside list-disc space-y-2">
                              {lessonPlan.alternateActivities[
                                activity.activityType
                              ].map((altActivity, altIndex) => (
                                <li
                                  key={altIndex}
                                  className="border-t pt-2 mt-2"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <strong className="text-teal-800">
                                        {altActivity.title}
                                      </strong>
                                      <p>{altActivity.description}</p>
                                      <p className="text-sm">
                                        <strong>Duration:</strong>{" "}
                                        {altActivity.durationMins} minutes
                                      </p>
                                      <p className="text-sm">
                                        <strong>Scores:</strong> Engagement (
                                        {altActivity.engagementScore}%),
                                        Alignment ({altActivity.alignmentScore}
                                        %), Feasibility (
                                        {altActivity.feasibilityScore}%)
                                      </p>
                                      {altActivity.source ? (
                                        <p className="text-sm">
                                          <strong>Source:</strong>{" "}
                                          <a
                                            href={altActivity.source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-teal-500 hover:underline"
                                          >
                                            {altActivity.source.name}
                                          </a>
                                          <br />
                                          {altActivity.source.description}
                                        </p>
                                      ) : (
                                        <p className="text-sm text-gray-500">
                                          No source provided.
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        selectActivity(
                                          activity.activityType,
                                          altActivity
                                        )
                                      }
                                    >
                                      Select
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
                              retailers.find(
                                (r) => r.value === selectedRetailer
                              )?.label
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
                <ul className="text-gray-600 list-inside list-disc space-y-4">
                  {lessonPlan.developmentGoals.map((goal, index) => (
                    <li key={index}>
                      <strong className="text-teal-800">{goal.name}</strong>
                      <p>{goal.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">
                  No developmental goals specified.
                </p>
              )}
            </div>
            {lessonPlan.gradeLevel === "PRESCHOOL" &&
              lessonPlan.drdpDomains && (
                <div>
                  <h2 className="text-xl font-semibold text-teal-800 mb-4">
                    DRDP Domains
                  </h2>
                  {lessonPlan.drdpDomains.length > 0 ? (
                    <ul className="text-gray-600 list-inside list-disc space-y-4">
                      {lessonPlan.drdpDomains.map((domain, index) => (
                        <li key={index}>
                          <strong className="text-teal-800">
                            {domain.code} - {domain.name}
                          </strong>
                          <p>{domain.description}</p>
                          <ul className="list-inside list-disc ml-4 space-y-2">
                            {domain.strategies.map((strategy, sIndex) => (
                              <li key={sIndex}>{strategy}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">
                      No DRDP domains generated for this plan.
                    </p>
                  )}
                </div>
              )}
            {lessonPlan.standards && (
              <div>
                <h2 className="text-xl font-semibold text-teal-800 mb-4">
                  Standards Alignment
                </h2>
                {lessonPlan.standards.length > 0 ? (
                  <ul className="text-gray-600 list-inside list-disc space-y-4">
                    {lessonPlan.standards.map((standard, index) => (
                      <li key={index}>
                        <strong className="text-teal-800">
                          {standard.code}
                        </strong>
                        <p>{standard.description}</p>
                        {standard.source && (
                          <p className="text-sm">
                            <a
                              href={standard.source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-500 hover:underline"
                            >
                              Source: {standard.source.name}
                            </a>
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No standards specified.</p>
                )}
              </div>
            )}
            {lessonPlan.sourceMetadata &&
              lessonPlan.sourceMetadata.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-teal-800 mb-4">
                    General Source Metadata
                  </h2>
                  <ul className="text-gray-600 list-inside list-disc space-y-4">
                    {lessonPlan.sourceMetadata.map((source, index) => (
                      <li key={index}>
                        <strong className="text-teal-800">{source.name}</strong>
                        <p>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-500 hover:underline"
                          >
                            {source.url}
                          </a>
                        </p>
                        <p>{source.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            {lessonPlan.citationScore !== undefined && (
              <div>
                <h2 className="text-xl font-semibold text-teal-800 mb-4">
                  Citation Score
                </h2>
                <p className="text-gray-600">
                  {lessonPlan.citationScore}% (indicates reliability of sources
                  used)
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={exportToPDF}
                    disabled={pdfLoading || printLoading}
                    aria-label="Export to PDF"
                  >
                    <FaFilePdf
                      className={`h-6 w-6 ${
                        pdfLoading || printLoading
                          ? "text-gray-400"
                          : "text-teal-600 hover:text-teal-800"
                      } transition-colors`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{pdfLoading ? "Generating PDF..." : "Export to PDF"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={printPDF}
                    disabled={pdfLoading || printLoading}
                    aria-label="Print PDF"
                  >
                    <FaPrint
                      className={`h-6 w-6 ${
                        printLoading || pdfLoading
                          ? "text-gray-400"
                          : "text-teal-600 hover:text-teal-800"
                      } transition-colors`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{printLoading ? "Preparing to print..." : "Print PDF"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={exportToWord}
                    disabled={pdfLoading || printLoading}
                    aria-label="Export to Word"
                  >
                    <FaRegFileWord
                      className={`h-6 w-6 ${
                        pdfLoading || printLoading
                          ? "text-gray-400"
                          : "text-teal-600 hover:text-teal-800"
                      } transition-colors`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export to Word</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={shareLessonPlan}
                    disabled={pdfLoading || printLoading}
                    aria-label="Share Lesson Plan"
                  >
                    <CiShare2
                      className={`h-6 w-6 ${
                        pdfLoading || printLoading
                          ? "text-gray-400"
                          : "text-teal-600 hover:text-teal-800"
                      } transition-colors`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share Lesson Plan</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-teal-400 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-500 transition"
            >
              Back to Form
            </button>
          </div>
        </main>
      </TooltipProvider>
      <footer className="text-center text-gray-600 mt-8">
        <p className="text-sm">© 2025 PlayPlanCraft. All rights reserved.</p>
      </footer>
      <ToastContainer />
    </div>
  );
}
