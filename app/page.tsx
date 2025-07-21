"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaChalkboardTeacher,
  FaClipboardList,
  FaCalendarAlt,
} from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(".animate-on-scroll");
    elements.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          delay: i * 0.2,
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

  return (
    <div className="relative bg-teal-50 text-gray-800 min-h-screen p-8 pt-56 sm:pt-64 pb-20 sm:p-16 overflow-hidden">
      <div className="absolute top-20 left-20 sm:top-24 sm:left-32 lg:top-24 lg:left-36 z-0 w-28 h-28">
        <div className="relative w-full h-full flex items-center justify-center">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "12px solid #fde68a",
                transform: `rotate(${i * 30}deg) translateY(-40px)`,
                transformOrigin: "center center",
              }}
            ></div>
          ))}
          <div className="w-16 h-16 bg-yellow-300 rounded-full shadow-md z-10" />
        </div>
      </div>
      <main
        ref={sectionRef}
        className="relative z-10 max-w-7xl mx-auto flex flex-col items-center gap-16"
      >
        <div className="text-center space-y-6 animate-on-scroll">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-800 leading-tight">
            Empower Your Teaching with PlayPlanCraft
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            PlayPlanCraft is your AI-powered teaching assistant that saves you
            time by automating lesson planning, supply management, and
            scheduling, letting you focus on what truly matters—teaching.
          </p>
          <Link
            href="lesson-plan"
            className="mt-8 inline-block bg-teal-400 text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-teal-500 transition"
          >
            Start Planning Your Lesson
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-on-scroll">
            <FaChalkboardTeacher className="text-4xl text-teal-600 mb-4" />
            <h3 className="text-2xl font-semibold text-teal-800 mb-4">
              AI Powered Lesson Builder
            </h3>
            <ul className="text-sm text-gray-600 list-inside list-disc space-y-1">
              <li>
                Generates personalized lesson plans based on age, subject, and
                theme.
              </li>
              <li>
                Saves you hours of planning while ensuring high-quality lessons.
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-on-scroll">
            <FaClipboardList className="text-4xl text-teal-600 mb-4" />
            <h3 className="text-2xl font-semibold text-teal-800 mb-4">
              Auto Generated Supply List & Smart Shopping
            </h3>
            <ul className="text-sm text-gray-600 list-inside list-disc space-y-1">
              <li>
                Automatically creates a list of materials for each lesson.
              </li>
              <li>
                Includes shopping links from trusted retailers for convenience.
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-on-scroll">
            <FaCalendarAlt className="text-4xl text-teal-600 mb-4" />
            <h3 className="text-2xl font-semibold text-teal-800 mb-4">
              Weekly Lesson Planner
            </h3>
            <ul className="text-sm text-gray-600 list-inside list-disc space-y-1">
              <li>Schedule your lessons with ease.</li>
              <li>
                Organize lessons by simply dragging and dropping them into your
                schedule.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
