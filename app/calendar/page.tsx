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
import { LessonPlan } from "../types/lessonPlan";
import ical from "ical-generator";
import { FaRegCalendarAlt } from "react-icons/fa";
import { SiGooglecalendar } from "react-icons/si";
import { FaTrash } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface HeaderToolbar {
  left: string;
  center: string;
  right: string;
}

export default function Calendar() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(true);
  const [headerToolbar, setHeaderToolbar] = useState<HeaderToolbar>({
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  });
  const calendarRef = useRef<FullCalendar | null>(null);
  const today = new Date();

  useEffect(() => {
    const fetchLessonPlans = async () => {
      try {
        const res = await fetch("/api/lesson-plans");
        const data = await res.json();

        if (res.ok && data.success) {
          setLessonPlans(data.lessonPlans);
        } else {
          toast.error("Failed to load lesson plans");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("An error occurred while loading the calendar.");
      }
    };

    fetchLessonPlans();
  }, []);

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

  const handleEventClick = (info: EventClickArg) => {
    setSelectedLesson(info.event.extendedProps.lesson as LessonPlan);
    setIsModalOpen(true);
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const updatedLesson: LessonPlan = {
      ...info.event.extendedProps.lesson,
      scheduledDate: info.event.start?.toISOString(),
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
          lp.id === updatedLesson.id ? updatedLesson : lp
        );
        setLessonPlans(updatedPlans);

        if (selectedLesson && selectedLesson.id === updatedLesson.id) {
          setSelectedLesson(updatedLesson);
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
        toast.error(data.error || "Failed to reschedule lesson", {
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
          lp.id === updatedLesson.id ? updatedLesson : lp
        );
        setLessonPlans(updatedPlans);
        setSelectedLesson(updatedLesson);

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
      <div className="bg-teal-50 text-gray-800 min-h-screen p-4 sm:p-8">
        <main className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-teal-800 text-center sm:text-left">
              Lesson Planner
            </h1>
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center sm:justify-end">
              <Link
                href="/lesson-plans"
                className="bg-teal-400 text-white py-2 px-4 rounded-full font-semibold hover:bg-teal-500 transition text-sm sm:text-base"
              >
                Create New Lesson
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={exportToICal}
                    className="bg-teal-400 text-white p-3 rounded-full hover:bg-teal-500 transition"
                  >
                    <FaRegCalendarAlt className="text-xl" />
                  </Button>
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
                        <strong>Scheduled:</strong>{" "}
                        {selectedLesson.scheduledDate
                          ? new Date(
                              selectedLesson.scheduledDate
                            ).toLocaleString()
                          : "Not scheduled"}
                      </li>
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
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No standards specified.</p>
                      )}
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
                  <div className="flex justify-end gap-4 mt-6">
                    {/* <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => exportToGoogleCalendar(selectedLesson)}
                          className="bg-teal-500 text-white p-3 rounded-full hover:bg-teal-600 transition flex items-center justify-center w-12 h-12"
                          aria-label="Add to Google Calendar"
                        >
                          <SiGooglecalendar className="text-xl" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center">
                        Add to Google Calendar
                      </TooltipContent>
                    </Tooltip> */}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleDeleteLesson}
                          className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition flex items-center justify-center w-12 h-12"
                          aria-label="Delete Lesson Plan"
                        >
                          <FaTrash className="text-xl" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="center">
                        Delete Lesson Plan
                      </TooltipContent>
                    </Tooltip>
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
