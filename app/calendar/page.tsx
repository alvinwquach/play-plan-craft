import { getLessonPlans } from "@/app/actions/getLessonPlans";
import { createClient } from "@/utils/supabase/server";
import Calendar from "../components/calendar/Calendar";

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
    <Calendar
      initialLessonPlans={lessonPlans}
      userRole={userRole || null}
      isOrganizationOwner={isOrganizationOwner || false}
      userId={user?.id || ""}
    />
  );
}
