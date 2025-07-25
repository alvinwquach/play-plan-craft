"use client";

import { useQuery } from "@apollo/client";
import { Suspense } from "react";
import Calendar from "../components/calendar/Calendar";
import CalendarLoadingSkeleton from "../components/calendar/CalendarLoadingSkeleton";
import { GET_LESSON_PLANS } from "../graphql/queries/getLessonPlans";

export default function CalendarPage() {
  const { loading, error, data } = useQuery(GET_LESSON_PLANS);

  if (loading) {
    return <CalendarLoadingSkeleton />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const { lessonPlans, userRole, isOrganizationOwner } = data.lessonPlans;

  return (
    <Suspense fallback={<CalendarLoadingSkeleton />}>
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
        <Calendar
          initialLessonPlans={lessonPlans}
          userRole={userRole || null}
          isOrganizationOwner={isOrganizationOwner || false}
          userId={lessonPlans[0]?.created_by_id || ""}
        />
      </section>
    </Suspense>
  );
}
