import { getLessonPlans } from "../actions/getLessonPlans";
import Calendar from "../components/calendar/Calendar";

export default async function CalendarPage() {
  const { success, lessonPlans, error } = await getLessonPlans();

  if (!success || !lessonPlans) {
    return (
      <div className="bg-teal-50 text-gray-800 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen p-4 sm:p-8">
        <main className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-teal-800 text-center sm:text-left mb-6">
            Lesson Planner
          </h1>
          <p className="text-red-500 text-center">
            {error || "Failed to load lesson plans"}
          </p>
        </main>
      </div>
    );
  }

  return <Calendar initialLessonPlans={lessonPlans} />;
}
