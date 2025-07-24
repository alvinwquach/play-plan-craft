"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import ical from "ical-generator";
import {
  FaRegCalendarAlt,
  FaFilePdf,
  FaRegFileWord,
  FaPrint,
  FaTrash,
} from "react-icons/fa";
import { CiShare2 } from "react-icons/ci";
import { SiGooglecalendar } from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
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
import { Activity, LessonPlan, Retailer, Supply } from "@/app/types/lessonPlan";
import { rescheduleLessonPlan } from "@/app/actions/rescheduleLessonPlan";

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
        <Text style={styles.bullet}>• Curriculum: {lessonPlan.curriculum}</Text>
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
        !Array.isArray(lessonPlan.alternateActivities) &&
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

interface HeaderToolbar {
  left: string;
  center: string;
  right: string;
}

interface CalendarProps {
  initialLessonPlans: LessonPlan[];
}

export default function Calendar({ initialLessonPlans }: CalendarProps) {
  const [lessonPlans, setLessonPlans] =
    useState<LessonPlan[]>(initialLessonPlans);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(true);
  const [headerToolbar, setHeaderToolbar] = useState<HeaderToolbar>({
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer>("google");
  const calendarRef = useRef<FullCalendar | null>(null);
  const today = new Date();

  const retailers = [
    { value: "google", label: "Google Shopping" },
    { value: "amazon", label: "Amazon" },
    { value: "walmart", label: "Walmart" },
  ] as const;

  const generateShoppingLink = (supply: Supply, retailer: string): string => {
    const queryParts = [supply.name];
    if (supply.note) {
      queryParts.push(supply.note);
    }
    queryParts.push("classroom");

    const query = queryParts.join(" ").toLowerCase().trim();
    const encodedQuery = encodeURIComponent(query);

    switch (retailer.toLowerCase()) {
      case "amazon":
        return `https://www.amazon.com/s?k=${encodedQuery}`;
      case "walmart":
        return `https://www.walmart.com/search?q=${encodedQuery}&typeahead=${encodedQuery}`;
      case "google":
      default:
        return `https://www.google.com/search?tbm=shop&q=${encodedQuery}`;
    }
  };
  const updateHeaderToolbar = (date: Date) => {
    const currentMonth = today.getMonth();
    const selectedMonth = date.getMonth();
    setCurrentMonth(currentMonth === selectedMonth);
  };

  useEffect(() => {
    const updateViewBasedOnScreenSize = () => {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;
      const screenConfigs = [
        {
          minWidth: 1280,
          view: "dayGridMonth",
          toolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          },
        },
        {
          minWidth: 1024,
          view: "dayGridMonth",
          toolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          },
        },
        {
          minWidth: 640,
          view: "timeGridWeek",
          toolbar: {
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
          },
        },
        {
          minWidth: 0,
          view: "timeGridDay",
          toolbar: {
            left: "prev,next today",
            center: "title",
            right: "timeGridDay",
          },
        },
      ];
      const matchedConfig = screenConfigs.find(
        (config) => window.innerWidth >= config.minWidth
      );
      if (matchedConfig) {
        calendarApi.changeView(matchedConfig.view);
        setHeaderToolbar(matchedConfig.toolbar);
      }
    };
    window.addEventListener("resize", updateViewBasedOnScreenSize);
    updateViewBasedOnScreenSize();
    return () =>
      window.removeEventListener("resize", updateViewBasedOnScreenSize);
  }, [currentMonth]);

  const events: EventInput[] = lessonPlans.map((lesson) => ({
    id: lesson.id || lesson.title,
    title: lesson.title,
    start: lesson.scheduledDate || new Date().toISOString(),
    end: lesson.scheduledDate
      ? new Date(
          new Date(lesson.scheduledDate).getTime() + lesson.duration * 60 * 1000
        ).toISOString()
      : new Date().toISOString(),
    extendedProps: { lesson },
  }));

  const formatGoogleCalendarDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const generateEventDescription = (lesson: LessonPlan): string => {
    return `
Title: ${lesson.title}

Learning Intention: ${lesson.learningIntention || "None"}

Success Criteria:
${
  lesson.successCriteria.length > 0
    ? lesson.successCriteria.join("\n- ")
    : "No success criteria specified."
}

Details:
Grade Level: ${lesson.gradeLevel.replace("_", " ")}
Subject: ${lesson.subject.replace("_", " ")}
Theme: ${lesson.theme ? lesson.theme.replace("_", " ") : "None"}
Status: ${lesson.status}
Duration: ${lesson.duration} minutes
Classroom Size: ${lesson.classroomSize} students
Scheduled: ${
      lesson.scheduledDate
        ? new Date(lesson.scheduledDate).toLocaleString()
        : "Not scheduled"
    }

Activities:
${
  lesson.activities.length > 0
    ? lesson.activities
        .map(
          (activity) =>
            `- ${activity.title} (${activity.activityType.replace(
              "_",
              " "
            )}): ${activity.description} (${activity.durationMins} minutes)`
        )
        .join("\n")
    : "No activities available."
}

Supplies:
${
  lesson.supplies.length > 0
    ? lesson.supplies
        .map(
          (supply) =>
            `- ${supply.name} (${supply.quantity} ${supply.unit}${
              supply.note ? `, Note: ${supply.note}` : ""
            }${
              supply.shoppingLink
                ? `, Shopping Link: ${supply.shoppingLink}`
                : ""
            })`
        )
        .join("\n")
    : "No supplies required."
}

Tags: ${lesson.tags.length > 0 ? lesson.tags.join(", ") : "No tags specified."}

Developmental Goals:
${
  lesson.developmentGoals.length > 0
    ? lesson.developmentGoals
        .map((goal) => `- ${goal.name}: ${goal.description}`)
        .join("\n")
    : "No developmental goals specified."
}

${
  lesson.gradeLevel === "PRESCHOOL" && lesson.drdpDomains
    ? `DRDP Domains:\n${
        lesson.drdpDomains.length > 0
          ? lesson.drdpDomains
              .map(
                (domain) =>
                  `- ${domain.code} - ${domain.name}: ${
                    domain.description
                  }. Strategies: ${domain.strategies.join("; ")}`
              )
              .join("\n")
          : "No DRDP domains generated for this plan."
      }`
    : ""
}

Standards Alignment:
${
  lesson.standards && lesson.standards.length > 0
    ? lesson.standards
        .map((standard) => `- ${standard.code}: ${standard.description}`)
        .join("\n")
    : "No standards specified."
}
`.trim();
  };

  const exportToICal = () => {
    const calendar = ical({ name: "PlayPlanCraft Lesson Plans" });

    lessonPlans.forEach((lesson) => {
      if (lesson.scheduledDate) {
        const start = new Date(lesson.scheduledDate);
        const end = new Date(start.getTime() + lesson.duration * 60 * 1000);
        const description = generateEventDescription(lesson);

        calendar.createEvent({
          start,
          end,
          summary: lesson.title,
          description,
          location: lesson.theme ? lesson.theme.replace("_", " ") : undefined,
        });
      }
    });

    const blob = new Blob([calendar.toString()], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lesson_plans.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("iCal file downloaded successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const exportToGoogleCalendar = (lesson?: LessonPlan) => {
    const lessonsToExport = lesson ? [lesson] : lessonPlans;

    lessonsToExport.forEach((lesson) => {
      if (lesson.scheduledDate) {
        const start = new Date(lesson.scheduledDate);
        const end = new Date(start.getTime() + lesson.duration * 60 * 1000);
        const description = generateEventDescription(lesson);

        const googleCalendarUrl = new URL(
          "https://www.google.com/calendar/render"
        );
        googleCalendarUrl.searchParams.append("action", "TEMPLATE");
        googleCalendarUrl.searchParams.append("text", lesson.title);
        googleCalendarUrl.searchParams.append(
          "dates",
          `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`
        );
        googleCalendarUrl.searchParams.append("details", description);
        if (lesson.theme) {
          googleCalendarUrl.searchParams.append(
            "location",
            lesson.theme.replace("_", " ")
          );
        }

        window.open(googleCalendarUrl.toString(), "_blank");

        toast.success(`Opened Google Calendar for "${lesson.title}"!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    });
  };

  const exportToPDF = async (lesson: LessonPlan) => {
    setPdfLoading(true);
    try {
      const updatedLesson = {
        ...lesson,
        supplies: lesson.supplies.map((supply) => ({
          ...supply,
          shoppingLink: generateShoppingLink(supply, selectedRetailer),
        })),
      };

      const blob = await pdf(
        <LessonPlannerPDF lessonPlan={updatedLesson} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${lesson.title.replace(/\s+/g, "_")}.pdf`;
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

  const printPDF = async (lesson: LessonPlan) => {
    setPrintLoading(true);
    try {
      const updatedLesson = {
        ...lesson,
        supplies: lesson.supplies.map((supply) => ({
          ...supply,
          shoppingLink: generateShoppingLink(supply, selectedRetailer),
        })),
      };

      const blob = await pdf(
        <LessonPlannerPDF lessonPlan={updatedLesson} />
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

  const exportToWord = async (lesson: LessonPlan) => {
    try {
      const doc = new DocxDocument({
        sections: [
          {
            children: [
              new Paragraph({
                text: lesson.title,
                heading: "Heading1",
              }),
              new Paragraph({
                text: "Learning Intention",
                heading: "Heading2",
              }),
              new Paragraph({
                text:
                  lesson.learningIntention ||
                  "No learning intention specified.",
              }),
              new Paragraph({
                text: "Success Criteria",
                heading: "Heading2",
              }),
              ...lesson.successCriteria.map(
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
                text: `Grade Level: ${lesson.gradeLevel.replace("_", " ")}`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Subject: ${lesson.subject.replace("_", " ")}`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Theme: ${
                  lesson.theme ? lesson.theme.replace("_", " ") : "None"
                }`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Status: ${lesson.status}`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Duration: ${lesson.duration} minutes`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Classroom Size: ${lesson.classroomSize} students`,
                bullet: { level: 0 },
              }),
              new Paragraph({
                text: `Curriculum: ${lesson.curriculum}`,
                bullet: { level: 0 },
              }),
              ...(lesson.scheduledDate
                ? [
                    new Paragraph({
                      text: `Scheduled: ${new Date(
                        lesson.scheduledDate
                      ).toLocaleString()}`,
                      bullet: { level: 0 },
                    }),
                  ]
                : []),
              new Paragraph({
                text: "Activities",
                heading: "Heading2",
              }),
              ...lesson.activities.flatMap((activity) => [
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
              ...(lesson.alternateActivities
                ? [
                    new Paragraph({
                      text: "Alternate Activities",
                      heading: "Heading2",
                    }),
                    ...Object.entries(lesson.alternateActivities).flatMap(
                      ([activityType, activities]) =>
                        activities.length > 0
                          ? [
                              new Paragraph({
                                text: activityType.replace("_", " "),
                                bullet: { level: 0 },
                              }),
                              ...activities.flatMap((activity: Activity) => [
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
              ...lesson.supplies.flatMap((supply) => [
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
              ...lesson.tags.map(
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
              ...lesson.developmentGoals.flatMap((goal) => [
                new Paragraph({
                  text: goal.name,
                  bullet: { level: 0 },
                }),
                new Paragraph({ text: goal.description }),
              ]),
              ...(lesson.gradeLevel === "PRESCHOOL" && lesson.drdpDomains
                ? [
                    new Paragraph({
                      text: "DRDP Domains",
                      heading: "Heading2",
                    }),
                    ...lesson.drdpDomains.flatMap((domain) => [
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
              ...(lesson.standards
                ? [
                    new Paragraph({
                      text: "Standards Alignment",
                      heading: "Heading2",
                    }),
                    ...lesson.standards.flatMap((standard) => [
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
              ...(lesson.sourceMetadata && lesson.sourceMetadata.length > 0
                ? [
                    new Paragraph({
                      text: "General Source Metadata",
                      heading: "Heading2",
                    }),
                    ...lesson.sourceMetadata.flatMap((source) => [
                      new Paragraph({
                        text: source.name,
                        bullet: { level: 0 },
                      }),
                      new Paragraph({ text: `URL: ${source.url}` }),
                      new Paragraph({ text: source.description }),
                    ]),
                  ]
                : []),
              ...(lesson.citationScore !== undefined
                ? [
                    new Paragraph({
                      text: "Citation Score",
                      heading: "Heading2",
                    }),
                    new Paragraph({
                      text: `${lesson.citationScore}% (indicates reliability of sources used)`,
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
      link.download = `${lesson.title.replace(/\s+/g, "_")}.docx`;
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

  const shareLessonPlan = async (lesson: LessonPlan) => {
    try {
      const shareUrl = `${window.location.origin}/lesson-plan/${lesson.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Lesson plan link copied to clipboard!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
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
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const lesson = info.event.extendedProps.lesson as LessonPlan;
    setSelectedLesson({
      ...lesson,
      supplies: lesson.supplies.map((supply) => ({
        ...supply,
        shoppingLink: generateShoppingLink(supply, selectedRetailer),
      })),
    });
    setIsModalOpen(true);
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const updatedLesson: LessonPlan = {
      ...info.event.extendedProps.lesson,
      scheduledDate: info.event.start?.toISOString(),
    };

    try {
      const response = await rescheduleLessonPlan(
        updatedLesson.id || updatedLesson.title,
        updatedLesson.scheduledDate!
      );

      if (response.success && response.lessonPlan) {
        const updatedPlans = lessonPlans.map((lp) =>
          lp.id === updatedLesson.id
            ? { ...updatedLesson, supplies: lp.supplies }
            : lp
        );
        setLessonPlans(updatedPlans);

        if (selectedLesson && selectedLesson.id === updatedLesson.id) {
          setSelectedLesson({
          ...updatedLesson,
          supplies: selectedLesson.supplies,
          });
          }         

        toast.success("Lesson rescheduled successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(response.error || "Failed to reschedule lesson", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        info.revert();
      }
    } catch (error) {
      console.error("Error rescheduling lesson:", error);
      toast.error("An error occurred while rescheduling the lesson.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      info.revert();
    }
  };

  const handleDateTimeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedLesson) return;

    const updatedLesson: LessonPlan = {
      ...selectedLesson,
      scheduledDate: e.target.value,
    };

    try {
      const response = await fetch(
        `/api/lesson-plan/${updatedLesson.id}/schedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scheduledDate: updatedLesson.scheduledDate,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedPlans = lessonPlans.map((lp) =>
          lp.id === updatedLesson.id
            ? { ...updatedLesson, supplies: lp.supplies }
            : lp
        );
        setLessonPlans(updatedPlans);
        setSelectedLesson({
          ...updatedLesson,
          supplies: selectedLesson.supplies,
        });

        toast.success("Lesson schedule updated!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(data.error || "Failed to update lesson schedule", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error updating lesson schedule:", error);
      toast.error("An error occurred while updating the lesson schedule.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleDeleteLesson = async () => {
    if (!selectedLesson) return;

    try {
      const response = await fetch(`/api/lesson-plan/${selectedLesson.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedPlans = lessonPlans.filter(
          (lp) => lp.id !== selectedLesson.id
        );
        setLessonPlans(updatedPlans);
        setIsModalOpen(false);
        setSelectedLesson(null);

        toast.success("Lesson plan deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(data.error || "Failed to delete lesson plan", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting lesson plan:", error);
      toast.error("An error occurred while deleting the lesson plan.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-teal-50 text-gray-800 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen p-4 sm:p-8">
        <main className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center mb-6 gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center sm:justify-end">
              <Link
                href="/lesson-plan"
                className="bg-teal-400 text-white py-2 px-4 rounded-full font-semibold hover:bg-teal-500 transition text-sm sm:text-base"
              >
                Create New Lesson
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={exportToICal}
                    className="bg-teal-400 text-white p-3 rounded-full hover:bg-teal-500 transition"
                  >
                    <FaRegCalendarAlt className="text-xl" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  Export to iCal
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => exportToGoogleCalendar()}
                    className="bg-teal-400 text-white p-3 rounded-full hover:bg-teal-500 transition"
                  >
                    <SiGooglecalendar className="text-xl" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  Add to Google Calendar
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={headerToolbar}
            events={events}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            editable={true}
            selectable={false}
            datesSet={(dateInfo) =>
              updateHeaderToolbar(dateInfo.view.currentStart)
            }
            slotMinTime="07:00:00"
            slotMaxTime="18:00:00"
            allDaySlot={false}
            eventColor="#2c7a7b"
            height="auto"
            themeSystem="bootstrap5"
          />
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedLesson?.title}</DialogTitle>
              </DialogHeader>
              {selectedLesson && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold text-teal-800 mb-4">
                      Learning Intention
                    </h2>
                    <p className="text-gray-600">
                      {selectedLesson.learningIntention || "None"}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-teal-800 mb-4">
                      Success Criteria
                    </h2>
                    {selectedLesson.successCriteria.length > 0 ? (
                      <ul className="text-gray-600 list-inside list-disc space-y-2">
                        {selectedLesson.successCriteria.map(
                          (criterion, index) => (
                            <li key={index}>{criterion}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-600">
                        No success criteria specified.
                      </p>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-teal-800 mb-4">
                      Details
                    </h2>
                    <ul className="text-gray-600 list-inside list-disc">
                      <li>
                        <strong>Grade Level:</strong>{" "}
                        {selectedLesson.gradeLevel.replace("_", " ")}
                      </li>
                      <li>
                        <strong>Subject:</strong>{" "}
                        {selectedLesson.subject.replace("_", " ")}
                      </li>
                      <li>
                        <strong>Theme:</strong>{" "}
                        {selectedLesson.theme
                          ? selectedLesson.theme.replace("_", " ")
                          : "None"}
                      </li>
                      <li>
                        <strong>Status:</strong> {selectedLesson.status}
                      </li>
                      <li>
                        <strong>Duration:</strong> {selectedLesson.duration}{" "}
                        minutes
                      </li>
                      <li>
                        <strong>Classroom Size:</strong>{" "}
                        {selectedLesson.classroomSize} students
                      </li>
                      <li>
                        <strong>Curriculum:</strong> {selectedLesson.curriculum}
                      </li>
                      {selectedLesson.scheduledDate && (
                        <li>
                          <strong>Scheduled:</strong>{" "}
                          {new Date(
                            selectedLesson.scheduledDate
                          ).toLocaleString()}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-teal-800 mb-4">
                      Activities
                    </h2>
                    {selectedLesson.activities.length > 0 ? (
                      <ul className="text-gray-600 list-inside list-disc space-y-4">
                        {selectedLesson.activities.map((activity, index) => (
                          <li key={index}>
                            <strong className="text-teal-800">
                              {activity.title} (
                              {activity.activityType.replace("_", " ")})
                            </strong>
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
                          setSelectedRetailer(e.target.value as Retailer)
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
                    {selectedLesson.supplies.length > 0 ? (
                      <ul className="text-gray-600 list-inside list-disc space-y-2">
                        {selectedLesson.supplies.map((supply, index) => (
                          <li key={index}>
                            <strong className="text-teal-800">
                              {supply.name} ({supply.quantity} {supply.unit})
                            </strong>
                            {supply.note && (
                              <p className="text-sm">
                                <strong>Note:</strong> {supply.note}
                              </p>
                            )}
                            <p className="text-sm">
                              <a
                                href={generateShoppingLink(
                                  supply,
                                  selectedRetailer
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-500 hover:underline"
                              >
                                Find {supply.name} on{" "}
                                {retailers.find(
                                  (r) => r.value === selectedRetailer
                                )?.label || "Retailer"}
                              </a>
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No supplies required.</p>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-teal-800 mb-4">
                      Tags
                    </h2>
                    {selectedLesson.tags.length > 0 ? (
                      <ul className="text-gray-600 list-inside list-disc space-y-2">
                        {selectedLesson.tags.map((tag, index) => (
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
                    {selectedLesson.developmentGoals.length > 0 ? (
                      <ul className="text-gray-600 list-inside list-disc space-y-4">
                        {selectedLesson.developmentGoals.map((goal, index) => (
                          <li key={index}>
                            <strong className="text-teal-800">
                              {goal.name}
                            </strong>
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
                  {selectedLesson.gradeLevel === "PRESCHOOL" &&
                    selectedLesson.drdpDomains && (
                      <div>
                        <h2 className="text-xl font-semibold text-teal-800 mb-4">
                          DRDP Domains
                        </h2>
                        {selectedLesson.drdpDomains.length > 0 ? (
                          <ul className="text-gray-600 list-inside list-disc space-y-4">
                            {selectedLesson.drdpDomains.map((domain, index) => (
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
                  {selectedLesson.standards && (
                    <div>
                      <h2 className="text-xl font-semibold text-teal-800 mb-4">
                        Standards Alignment
                      </h2>
                      {selectedLesson.standards.length > 0 ? (
                        <ul className="text-gray-600 list-inside list-disc space-y-4">
                          {selectedLesson.standards.map((standard, index) => (
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
                  {selectedLesson.sourceMetadata &&
                    selectedLesson.sourceMetadata.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-teal-800 mb-4">
                          General Source Metadata
                        </h2>
                        <ul className="text-gray-600 list-inside list-disc space-y-4">
                          {selectedLesson.sourceMetadata.map(
                            (source, index) => (
                              <li key={index}>
                                <strong className="text-teal-800">
                                  {source.name}
                                </strong>
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
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {selectedLesson.citationScore !== undefined && (
                    <div>
                      <h2 className="text-xl font-semibold text-teal-800 mb-4">
                        Citation Score
                      </h2>
                      <p className="text-gray-600">
                        {selectedLesson.citationScore}% (indicates reliability
                        of sources used)
                      </p>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-teal-800 mb-4">
                      Update Schedule
                    </h2>
                    <input
                      type="datetime-local"
                      value={selectedLesson.scheduledDate || ""}
                      onChange={handleDateTimeChange}
                      className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div className="flex justify-between items-end w-full mt-8 flex-wrap">
                    <div className="flex gap-4 flex-wrap">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => printPDF(selectedLesson)}
                            disabled={pdfLoading || printLoading}
                            className={`p-3 rounded-full transition ${
                              printLoading || pdfLoading
                                ? "bg-gray-200 text-gray-400"
                                : "bg-white text-teal-600 hover:text-teal-800 hover:bg-gray-100"
                            }`}
                          >
                            <FaPrint className="text-xl" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                          {printLoading ? "Preparing to print..." : "Print PDF"}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => exportToPDF(selectedLesson)}
                            disabled={pdfLoading || printLoading}
                            className={`p-3 rounded-full transition ${
                              pdfLoading || printLoading
                                ? "bg-gray-200 text-gray-400"
                                : "bg-white text-teal-600 hover:text-teal-800 hover:bg-gray-100"
                            }`}
                          >
                            <FaFilePdf className="text-xl" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                          {pdfLoading ? "Generating PDF..." : "Export to PDF"}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => exportToWord(selectedLesson)}
                            disabled={pdfLoading || printLoading}
                            className={`p-3 rounded-full transition ${
                              pdfLoading || printLoading
                                ? "bg-gray-200 text-gray-400"
                                : "bg-white text-teal-600 hover:text-teal-800 hover:bg-gray-100"
                            }`}
                          >
                            <FaRegFileWord className="text-xl" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                          Export to Word
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => shareLessonPlan(selectedLesson)}
                            disabled={pdfLoading || printLoading}
                            className={`p-3 rounded-full transition ${
                              pdfLoading || printLoading
                                ? "bg-gray-200 text-gray-400"
                                : "bg-white text-teal-600 hover:text-teal-800 hover:bg-gray-100"
                            }`}
                          >
                            <CiShare2 className="text-xl" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                          Share Lesson Plan
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleDeleteLesson}
                            className="bg-white text-red-500 p-2"
                          >
                            <FaTrash className="text-xl" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                          Delete Lesson Plan
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </div>
    </TooltipProvider>
  );
}
