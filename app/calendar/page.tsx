import { getLessonPlans } from "@/app/actions/getLessonPlans";
import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import Calendar from "../components/calendar/Calendar";
import CalendarLoadingSkeleton from "../components/calendar/CalendarLoadingSkeleton";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { success, lessonPlans, userRole, isOrganizationOwner, error } =
    await getLessonPlans();

  if (!success || !lessonPlans) {
    return <div>Error: {error}</div>;
  }

  return (
    <Suspense fallback={<CalendarLoadingSkeleton />}>
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
        <Calendar
          initialLessonPlans={lessonPlans}
          userRole={userRole || null}
          isOrganizationOwner={isOrganizationOwner || false}
          userId={user?.id || ""}
        />
      </section>
    </Suspense>
  );
}
