import LessonPlanForm from "../components/LessonPlanForm";

export default function LessonPlanPage() {
  return (
    <div className="bg-teal-50 text-gray-800 min-h-screen p-8 pb-20 sm:p-16">
      <LessonPlanForm />
      <footer className="text-center text-gray-600 mt-16">
        <p className="text-sm">© 2025 PlayPlanCraft. All rights reserved.</p>
      </footer>
    </div>
  );
}
