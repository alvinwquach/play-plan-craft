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
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
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
    <div className="relative bg-teal-50 text-gray-800 min-h-screen overflow-hidden pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6"></div>
      <section className="pt-24 pb-32 px-6 sm:px-12 max-w-4xl mx-auto animate-on-scroll">
        <div className="text-left space-y-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-teal-800 leading-tight uppercase max-w-md">
            <div>Revolutionize</div>
            <div>your classroom</div>
            <div className="text-yellow-500">experience</div>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-lg">
            From Infants to Grade 12, PlayPlanCraft gives every educator
            powerful tools to create, schedule, and manage effective lessons
            with ease.
          </p>
          <div className="mt-10">
            <Link
              href="/lesson-plan"
              className="bg-teal-500 text-white py-4 px-8 rounded-full text-lg font-semibold hover:bg-teal-600 transition-all duration-300 hover:scale-105"
            >
              Start Planning Now
            </Link>
          </div>
        </div>
      </section>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-0 w-32 h-32 pointer-events-none select-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: "16px solid #fde68a",
                transform: `rotate(${i * 30}deg) translateY(-45px)`,
                transformOrigin: "center center",
                filter: "drop-shadow(0 0 8px rgba(253, 230, 138, 0.3))",
              }}
            />
          ))}
          <div className="w-20 h-20 bg-yellow-400 rounded-full shadow-lg z-10 animate-pulse" />
        </div>
      </div>
      <main
        ref={sectionRef}
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center gap-20"
      >
        <section className="text-center max-w-3xl animate-on-scroll bg-white rounded-xl shadow-lg p-10 w-full">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-800">
            Tools Tailored for Teachers at Every Level
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Whether you're nurturing infants or managing high school projects,
            our AI-driven platform has you covered.
          </p>
        </section>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
          <div className="bg-teal-50 p-8 rounded-xl shadow-xl border border-teal-200 animate-on-scroll hover:shadow-2xl transition-all duration-300 group">
            <FaChalkboardTeacher className="text-5xl text-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-semibold text-teal-800 mb-4">
              AI Powered Lesson Builder
            </h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1">
              <li>
                Generate engaging, age-appropriate lessons by subject or theme.
              </li>
              <li>
                Personalize plans for your teaching style and student needs.
              </li>
            </ul>
          </div>
          <div className="bg-yellow-50 p-8 rounded-xl shadow-xl border border-yellow-300 animate-on-scroll hover:shadow-2xl transition-all duration-300 group">
            <FaClipboardList className="text-5xl text-yellow-500 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-semibold text-yellow-700 mb-4">
              Smart Supply Lists
            </h3>
            <ul className="text-yellow-800 list-disc list-inside space-y-1">
              <li>
                Automatically compiles materials based on your lesson plan.
              </li>
              <li>Includes shopping links from trusted educational vendors.</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-8 rounded-xl shadow-xl border border-blue-300 animate-on-scroll hover:shadow-2xl transition-all duration-300 group">
            <FaCalendarAlt className="text-5xl text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">
              Calendar Sync & Weekly Planner
            </h3>
            <ul className="text-blue-700 list-disc list-inside space-y-1">
              <li>Visually map out lessons with drag-and-drop scheduling.</li>
              <li>Sync with Google Calendar and iCal seamlessly.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
