"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaChalkboardTeacher,
  FaClipboardList,
  FaCalendarAlt,
  FaCheckCircle,
  FaUsers,
  FaMagic,
  FaRocket,
  FaChevronDown,
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const sectionRef = useRef(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(".animate-on-scroll");
    elements.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          delay: i * 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  const faqs = [
    {
      question: "Is PlayPlanCraft free to use?",
      answer: "Yes! You can sign up for free and start planning immediately.",
    },
    {
      question: "Can I collaborate with other educators?",
      answer:
        "Absolutely. You can invite co-teachers and assistants to build and manage plans together in real time.",
    },
    {
      question: "Does it support different age groups?",
      answer:
        "Yes. PlayPlanCraft is designed to support lesson planning from Infants all the way through Grade 12.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white text-gray-800 min-h-screen overflow-x-hidden">
      <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-12 min-h-[85vh]">
        <div className="text-center md:text-left space-y-6 animate-on-scroll md:w-1/2">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight text-teal-800">
            AI-Powered <br /> Lesson Planning
          </h1>
          <p className="text-lg text-gray-600">
            Create, schedule, and collaborate on personalized, age-appropriate
            lesson plans — from infants to Grade 12.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/login"
              className="bg-teal-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-teal-600 transition"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="text-teal-600 border border-teal-400 px-6 py-3 rounded-full text-lg font-semibold hover:bg-teal-50 transition"
            >
              Log In
            </Link>
          </div>
        </div>
        <div className="animate-on-scroll md:w-1/2 relative flex justify-center items-center">
          <div className="md:w-1/2 w-full flex justify-center md:justify-end items-center animate-on-scroll">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "20px solid #fde68a",
                    transform: `rotate(${i * 30}deg) translateY(-76px)`,
                    transformOrigin: "center center",
                    filter: "drop-shadow(0 0 4px rgba(253,230,138,0.5))",
                  }}
                />
              ))}
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-yellow-400 rounded-full shadow-xl animate-pulse z-10" />
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-16 animate-on-scroll">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-800">
            Why Educators Love PlayPlanCraft
          </h2>
          <p className="text-lg text-gray-600 mt-4">
            Simplify your planning, streamline your materials, and sync your
            schedule — all in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: (
                <FaChalkboardTeacher className="text-5xl text-teal-600 mb-4" />
              ),
              title: "AI Lesson Builder",
              bullets: [
                "Generate engaging, age-appropriate plans.",
                "Tailored to your teaching style.",
              ],
            },
            {
              icon: (
                <FaClipboardList className="text-5xl text-yellow-500 mb-4" />
              ),
              title: "Auto Material Lists",
              bullets: [
                "Smart shopping links for every lesson.",
                "Connected to real vendors.",
              ],
            },
            {
              icon: <FaCalendarAlt className="text-5xl text-blue-500 mb-4" />,
              title: "Calendar & Sync",
              bullets: [
                "Drag-and-drop weekly planner.",
                "Syncs with Google Calendar & iCal.",
              ],
            },
          ].map(({ icon, title, bullets }, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg hover:shadow-2xl transition group"
            >
              {icon}
              <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
              <ul className="list-disc list-inside mt-3 space-y-1 text-gray-700">
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-teal-50 py-20 px-6 animate-on-scroll">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-800">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-left">
            {[
              {
                icon: <FaRocket className="text-3xl text-teal-600 mb-4" />,
                title: "Create",
                desc: "Use our AI to instantly generate lesson plans tailored to your subject and students.",
              },
              {
                icon: <FaUsers className="text-3xl text-yellow-500 mb-4" />,
                title: "Collaborate",
                desc: "Work with co-teachers and assistants in real-time to refine and manage plans.",
              },
              {
                icon: <FaMagic className="text-3xl text-blue-500 mb-4" />,
                title: "Automate",
                desc: "Automatically sync lessons with calendars, export PDFs, and build supply lists.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow hover:shadow-md transition"
              >
                {step.icon}
                <h3 className="text-xl font-bold text-teal-700 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-8 animate-on-scroll">
        <h2 className="text-3xl sm:text-4xl font-bold text-teal-800 text-center">
          Frequently Asked Questions
        </h2>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border-b border-gray-200 py-4 cursor-pointer"
            onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">
                {faq.question}
              </h3>
              <FaChevronDown
                className={`transition-transform ${
                  openFAQ === i ? "rotate-180" : ""
                }`}
              />
            </div>
            {openFAQ === i && (
              <p className="mt-2 text-gray-600 text-base">{faq.answer}</p>
            )}
          </div>
        ))}
      </section>
      <section className="bg-gradient-to-br from-white to-teal-50 text-center py-24 px-6 animate-on-scroll mb-8">
        <h3 className="text-3xl sm:text-4xl font-bold text-teal-700 mb-6">
          Start Building Your First Plan Today
        </h3>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          Join teachers across the globe creating developmentally aligned plans
          with ease.
        </p>
        <Link
          href="/login"
          className="bg-yellow-400 text-teal-900 px-8 py-4 rounded-full text-lg font-bold shadow hover:bg-yellow-300 transition"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
}
