export default function Home() {
  return (
    <div className="bg-teal-50 text-gray-800 min-h-screen p-8 pb-20 sm:p-16">
      <main className="max-w-7xl mx-auto flex flex-col items-center gap-16">
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-800 leading-tight">
            Empower Your Teaching with PlayPlanCraft
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            PlayPlanCraft is your AI-powered teaching assistant that saves you
            time by automating lesson planning, supply management, and
            scheduling, letting you focus on what truly matters—teaching.
          </p>
          <a
            href="#start-planning"
            className="mt-8 bg-teal-400 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-500 transition"
          >
            Start Planning Your Lesson
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold text-teal-800 mb-4">
              AI Powered Lesson Builder
            </h3>
            <ul className="text-sm text-gray-600 list-inside list-disc">
              <li>
                Generates personalized lesson plans based on age, subject, and
                theme.
              </li>
              <li>
                Saves you hours of planning while ensuring high-quality lessons.
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold text-teal-800 mb-4">
              Auto Generated Supply List & Smart Shopping Assistance
            </h3>
            <ul className="text-sm text-gray-600 list-inside list-disc">
              <li>
                Automatically creates a list of materials for each lesson.
              </li>
              <li>
                Sends reminders when supplies are running low, and links to
                trusted retailers.
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold text-teal-800 mb-4">
              Weekly Lesson Planner (Drag-and-Drop)
            </h3>
            <ul className="text-sm text-gray-600 list-inside list-disc">
              <li>
                Organize lessons by simply dragging and dropping them into your
                schedule.
              </li>
              <li>
                Plan your week visually with ease and never forget a topic
                again.
              </li>
            </ul>
          </div>
        </div>
      </main>
      <footer className="text-center text-gray-600 mt-16">
        <p className="text-sm">© 2025 PlayPlanCraft. All rights reserved.</p>
      </footer>
    </div>
  );
}
