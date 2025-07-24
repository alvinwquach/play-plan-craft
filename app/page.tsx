"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaChalkboardTeacher,
  FaClipboardList,
  FaCalendarAlt,
  FaCheckCircle,
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
    <div className="bg-gradient-to-b from-teal-50 to-white text-gray-800 min-h-screen overflow-hidden">
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-16 flex flex-col-reverse md:flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 min-h-[75vh]">
        <div className="flex flex-col md:flex-row items-center lg:items-start gap-10 lg:gap-16 w-full">
          <div className="md:w-1/2 w-full text-center md:text-left space-y-6 animate-on-scroll">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-teal-800 leading-tight uppercase pt-24">
              Revolutionize <br />
              your classroom <br />
              <span className="text-yellow-500">experience</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-md mx-auto md:mx-0">
              From Infants to Grade 12, PlayPlanCraft gives every educator the
              power to create, schedule, and manage effective lessons with ease.
            </p>
            <Link
              href="/lesson-plan"
              className="inline-block bg-teal-500 text-white py-4 px-8 rounded-full text-lg font-semibold hover:bg-teal-600 transition-all duration-300 hover:scale-105 shadow-md"
            >
              Start Planning Now
            </Link>
          </div>

          {/* Right: Sun Graphic */}
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
                    transform: `rotate(${i * 30}deg) translateY(-80px)`,
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
      <main
        ref={sectionRef}
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center gap-20"
      >
        <section className="text-center max-w-3xl animate-on-scroll bg-white rounded-xl shadow-2xl p-12 w-full">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-800">
            Tools Tailored for Teachers at Every Level
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Whether you&apos;re nurturing infants or managing high school
            projects, our AI-driven platform has you covered.
          </p>
        </section>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full">
          <div className="bg-white p-8 rounded-xl shadow-xl border border-teal-100 animate-on-scroll hover:shadow-2xl transition-all duration-300 group">
            <FaChalkboardTeacher className="text-5xl text-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-semibold text-teal-800 mb-4">
              AI Lesson Builder
            </h3>
            <ul className="text-gray-700 list-disc list-inside space-y-1">
              <li>Generate engaging, age-appropriate lessons.</li>
              <li>Tailor content to your teaching style.</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-xl border border-yellow-200 animate-on-scroll hover:shadow-2xl transition-all duration-300 group">
            <FaClipboardList className="text-5xl text-yellow-500 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-semibold text-yellow-700 mb-4">
              Smart Supply Lists
            </h3>
            <ul className="text-yellow-800 list-disc list-inside space-y-1">
              <li>Auto-generate materials for every lesson.</li>
              <li>Links to trusted education vendors.</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-xl border border-blue-200 animate-on-scroll hover:shadow-2xl transition-all duration-300 group">
            <FaCalendarAlt className="text-5xl text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-semibold text-blue-800 mb-4">
              Calendar & Weekly Planner
            </h3>
            <ul className="text-blue-700 list-disc list-inside space-y-1">
              <li>Drag-and-drop schedule builder.</li>
              <li>Sync with Google Calendar or iCal.</li>
            </ul>
          </div>
        </section>
        <section className="bg-gradient-to-br from-white to-teal-50 rounded-xl shadow-2xl p-12 w-full animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-teal-800">
            Why Educators Love PlayPlanCraft
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              "Time-saving AI tools",
              "Beautiful lesson exports",
              "Standards-aligned plans",
              "User-friendly drag-and-drop interface",
              "Instant material lists",
              "Collaborate with co-teachers",
            ].map((text, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <FaCheckCircle className="text-teal-500 text-2xl mt-1" />
                <span className="text-lg text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="text-center animate-on-scroll mt-20 pb-24">
          <h3 className="text-3xl sm:text-4xl font-bold text-teal-700 mb-4">
            Ready to Transform Your Planning?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Start creating better lessons today with tools built for real
            teachers.
          </p>
          <Link
            href="/lesson-plan"
            className="inline-block bg-yellow-400 text-teal-900 py-4 px-10 rounded-full text-lg font-semibold shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300"
          >
            Try It Free
          </Link>
        </section>
      </main>
    </div>
  );
}
