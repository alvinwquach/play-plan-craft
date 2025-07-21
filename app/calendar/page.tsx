"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
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

export default function Calendar() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedPlans = localStorage.getItem("lessonPlans");
    if (storedPlans) {
      setLessonPlans(JSON.parse(storedPlans));
    }
  }, []);

  const events = lessonPlans.map((lesson) => ({
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

  const handleEventClick = (info: any) => {
    setSelectedLesson(info.event.extendedProps.lesson);
    setIsModalOpen(true);
  };

  const handleEventDrop = (info: any) => {
    const updatedLesson = {
      ...info.event.extendedProps.lesson,
      scheduledDate: info.event.start.toISOString(),
    };
    const updatedPlans = lessonPlans.map((lp) =>
      lp.id === updatedLesson.id ? updatedLesson : lp
    );
    setLessonPlans(updatedPlans);
    localStorage.setItem("lessonPlans", JSON.stringify(updatedPlans));
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
  };

  return (
    <div className="bg-teal-50 text-gray-800 min-h-screen p-8 sm:p-16">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 text-center">
            Weekly Lesson Planner
          </h1>
          <Link
            href="/lesson-plans/form"
            className="bg-teal-400 text-white py-2 px-4 rounded-full font-semibold hover:bg-teal-500 transition"
          >
            Create New Lesson
          </Link>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Added interactionPlugin
          initialView="timeGridWeek"
          editable={true}
          selectable={false}
          events={events}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          allDaySlot={false}
          eventColor="#2c7a7b"
          height="auto"
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
                    onChange={(e) => {
                      if (!selectedLesson) return;
                      const updatedLesson = {
                        ...selectedLesson,
                        scheduledDate: e.target.value,
                      };
                      setSelectedLesson(updatedLesson);
                      const updatedPlans = lessonPlans.map((lp) =>
                        lp.id === updatedLesson.id ? updatedLesson : lp
                      );
                      setLessonPlans(updatedPlans);
                      localStorage.setItem(
                        "lessonPlans",
                        JSON.stringify(updatedPlans)
                      );
                      toast.success("Lesson schedule updated!", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                      });
                    }}
                    className="block w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <footer className="text-center text-gray-600 mt-8">
        <p className="text-sm">© 2025 PlayPlanCraft. All rights reserved.</p>
      </footer>
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
  );
}
