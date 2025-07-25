"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FaChevronDown,
  FaCheckCircle,
  FaChalkboardTeacher,
  FaClipboardList,
  FaCalendarAlt,
  FaRocket,
  FaUsers,
  FaMagic,
} from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  const featureRefs = useRef<HTMLDivElement[]>([]);
  const howRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    featureRefs.current.forEach((el, i) => {
      if (el) {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: "top 90%" },
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: i * 0.1,
          ease: "power2.out",
        });
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: howRefs.current[0], start: "top 80%" },
    });

    howRefs.current.forEach((el) => {
      if (el) {
        tl.from(el.querySelector(".icon"), {
          opacity: 0,
          y: 40,
          scale: 0.8,
          duration: 0.6,
          ease: "back.out(1.7)",
        })
          .from(
            el.querySelector("h3"),
            { opacity: 0, x: -50, duration: 0.4 },
            "-=0.3"
          )
          .from(
            el.querySelector("p"),
            { opacity: 0, x: 50, duration: 0.4 },
            "-=0.3"
          );
      }
    });
  }, []);

  const features = [
    "Time‑saving AI tools",
    "Beautiful lesson exports",
    "Standards‑aligned plans",
    "User‑friendly drag‑and‑drop interface",
    "Instant material lists",
    "Collaborate with co‑teachers",
  ];

  const howItWorks = [
    {
      icon: <FaRocket className="icon text-4xl text-teal-600 mb-4" />,
      title: "Create",
      desc: "Instantly generate age‑appropriate lesson plans with AI.",
    },
    {
      icon: <FaUsers className="icon text-4xl text-yellow-500 mb-4" />,
      title: "Collaborate",
      desc: "Invite co‑teachers and refine plans together live.",
    },
    {
      icon: <FaMagic className="icon text-4xl text-blue-500 mb-4" />,
      title: "Automate",
      desc: "Sync calendars, export PDFs, and auto‑generate material lists.",
    },
  ];

  const faqs = [
    {
      question: "Is PlayPlanCraft free to use?",
      answer: "Yes! You can sign up for free and start planning immediately.",
    },
    {
      question: "Can I collaborate with other educators?",
      answer:
        "Absolutely. Invite co‑teachers and assistants to plan together in real time.",
    },
    {
      question: "Does it support different age groups?",
      answer: "Yes. PlayPlanCraft spans from infants through Grade 12.",
    },
  ];

  const benefits = [
    {
      icon: <FaChalkboardTeacher className="text-4xl text-teal-600 mb-4" />,
      title: "Designed for Educators",
      desc: "Built by teachers, for teachers — intuitive tools that fit your workflow.",
    },
    {
      icon: <FaClipboardList className="text-4xl text-yellow-500 mb-4" />,
      title: "Organized & Efficient",
      desc: "All your plans and materials in one place.",
    },
    {
      icon: <FaCalendarAlt className="text-4xl text-blue-500 mb-4" />,
      title: "Integrated Scheduling",
      desc: "Automatically sync lessons with your calendar.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white text-gray-800 min-h-screen overflow-x-hidden">
      <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-12 min-h-[85vh]">
        <div className="text-center md:text-left space-y-6 animate-on-scroll md:w-1/2">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight text-teal-800">
            {user ? (
              <>
                Welcome Back!
                <br />
                Plan Your Next Lesson
              </>
            ) : (
              <>
                AI‑Powered
                <br />
                Lesson Planning
              </>
            )}
          </h1>
          <p className="text-lg text-gray-600">
            {user
              ? "Create, schedule, and collaborate on lessons quickly."
              : "Create, schedule, and collaborate on personalized, age‑appropriate lesson plans — from infants to Grade 12."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            {user ? (
              <Link
                href="/lesson-plan"
                className="bg-teal-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-teal-700 transition"
              >
                Schedule Lesson Plan
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
        <div className="animate-on-scroll md:w-1/2 relative flex justify-center items-center">
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
                  transformOrigin: "center",
                  filter: "drop-shadow(0 0 4px rgba(253,230,138,0.5))",
                }}
              />
            ))}
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-yellow-400 rounded-full shadow-xl animate-pulse z-10" />
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-teal-800 text-center">
          Why Choose PlayPlanCraft?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mt-8">
          {benefits.map((b, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              {b.icon}
              <h3 className="text-xl font-semibold text-teal-700 mb-3">
                {b.title}
              </h3>
              <p className="text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-800">
            Why Educators Love PlayPlanCraft
          </h2>
          <p className="text-lg text-gray-600 mt-4">
            Simplify your planning, streamline materials, and sync schedules —
            all in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) featureRefs.current[i] = el;
              }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-teal-100 rounded-full shrink-0">
                <FaCheckCircle className="text-teal-600" size={20} />
              </div>
              <p className="text-gray-800 text-base font-medium leading-snug">
                {f}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-teal-50 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-800">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 mt-4">
            A streamlined process from plan to action — animated step‑by‑step.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {howItWorks.map((step, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) howRefs.current[i] = el;
              }}
              className="bg-white rounded-xl p-6 text-center"
            >
              {step.icon}
              <h3 className="text-xl font-bold text-teal-700">{step.title}</h3>
              <p className="text-gray-600 mt-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-8">
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
      <section className="bg-gradient-to-br from-white to-teal-50 text-center py-24 px-6">
        <h3 className="text-3xl sm:text-4xl font-bold text-teal-700 mb-6">
          {user
            ? "Ready to plan your next lesson?"
            : "Start Building Your First Plan Today"}
        </h3>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          {user
            ? "Let’s create something great!"
            : "Join teachers across the globe creating developmentally aligned plans with ease."}
        </p>
        <Link
          href={user ? "/lesson-plan" : "/login"}
          className="bg-yellow-400 text-teal-900 px-8 py-4 rounded-full text-lg font-bold shadow hover:bg-yellow-300 transition"
        >
          {user ? "Go to Lesson Plans" : "Get Started Free"}
        </Link>
      </section>
    </div>
  );
}
