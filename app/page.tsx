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
  FaGlobe,
} from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  const heroRef = useRef<HTMLElement>(null);
  const featureRefs = useRef<HTMLDivElement[]>([]);
  const howRefs = useRef<HTMLDivElement[]>([]);
  const benefitRefs = useRef<HTMLDivElement[]>([]);
  const ctaRef = useRef<HTMLElement>(null);

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
    if (heroRef.current) {
      gsap.from(heroRef.current.querySelectorAll(".hero-content"), {
        opacity: 0,
        y: 60,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
      });
    }

    featureRefs.current.forEach((el, i) => {
      if (el) {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reset",
          },
          opacity: 0,
          y: 40,
          scale: 0.95,
          duration: 0.8,
          delay: i * 0.15,
          ease: "power2.out",
        });
      }
    });

    howRefs.current.forEach((el, i) => {
      if (el) {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reset",
          },
          opacity: 0,
          y: 50,
          scale: 0.9,
          duration: 1,
          delay: i * 0.2,
          ease: "back.out(1.4)",
        });
      }
    });

    benefitRefs.current.forEach((el, i) => {
      if (el) {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reset",
          },
          opacity: 0,
          x: i % 2 === 0 ? -50 : 50,
          duration: 0.8,
          delay: i * 0.1,
          ease: "power2.out",
        });
      }
    });

    if (ctaRef.current) {
      gsap.from(ctaRef.current.querySelectorAll(".cta-content"), {
        scrollTrigger: { trigger: ctaRef.current, start: "top 90%" },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }
  }, []);

  const features = [
    "Time-saving AI tools",
    "Beautiful lesson exports",
    "Standards-aligned plans",
    "User-friendly drag-and-drop interface",
    "Instant material lists",
    "Collaborate with co-teachers",
  ];

  const howItWorks = [
    {
      icon: <FaRocket className="icon text-4xl text-coral-600 mb-4" />,
      title: "Create",
      desc: "Instantly generate age-appropriate lesson plans with AI, tailored to your curriculum.",
      bgColor: "bg-coral-50",
      borderColor: "border-coral-200",
    },
    {
      icon: <FaUsers className="icon text-4xl text-amber-500 mb-4" />,
      title: "Collaborate",
      desc: "Invite co-teachers and refine plans together in real-time with live updates.",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      icon: <FaMagic className="icon text-4xl text-teal-500 mb-4" />,
      title: "Automate",
      desc: "Sync calendars, export PDFs, and auto-generate material lists effortlessly.",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
  ];

  const faqs = [
    {
      question: "Is Play Plan Craft free to use?",
      answer:
        "Yes! Sign up for free and start planning immediately with our core features.",
    },
    {
      question: "Can I collaborate with other educators?",
      answer:
        "Absolutely. Invite co-teachers and assistants to plan together in real time.",
    },
    {
      question: "Does it support different age groups?",
      answer:
        "Yes. Play Plan Craft supports lesson planning for infants through Grade 12.",
    },
    {
      question: "Can I export my lesson plans?",
      answer:
        "Yes, export plans as PDFs or sync them directly to your calendar for easy access.",
    },
  ];

  const benefits = [
    {
      icon: <FaChalkboardTeacher className="text-4xl text-teal-600 mb-4" />,
      title: "Designed for Educators",
      desc: "Built by teachers, for teachers — intuitive tools that fit your workflow.",
    },
    {
      icon: <FaClipboardList className="text-4xl text-amber-500 mb-4" />,
      title: "Organized & Efficient",
      desc: "All your plans and materials in one place, accessible anytime.",
    },
    {
      icon: <FaCalendarAlt className="text-4xl text-coral-600 mb-4" />,
      title: "Integrated Scheduling",
      desc: "Automatically sync lessons with your calendar for seamless planning.",
    },
  ];

  const keyBenefits = [
    {
      title: "AI-Driven Customization",
      desc: "Generate lesson plans tailored to specific subjects, age groups, and learning objectives in seconds.",
      icon: <FaMagic className="text-4xl text-teal-600 mb-4" />,
    },
    {
      title: "Cross-Platform Access",
      desc: "Plan on-the-go with mobile and desktop compatibility, synced across all your devices.",
      icon: <FaGlobe className="text-4xl text-teal-500 mb-4" />,
    },
  ];

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white text-gray-800 min-h-screen overflow-x-hidden font-sans">
      <div className="bg-gradient-to-br from-teal-100 to-coral-100 w-full">
        <section
          ref={heroRef}
          className="max-w-6xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-12 min-h-[80vh]"
        >
          <div className="hero-content text-center md:text-left space-y-6 md:w-1/2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-teal-900 font-heading">
              {user ? (
                <>
                  Welcome Back!
                  <br />
                  Plan Your Next Lesson
                </>
              ) : (
                <>
                  AI-Powered
                  <br />
                  Lesson Planning
                </>
              )}
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto md:mx-0">
              {user
                ? "Create, schedule, and collaborate on lessons quickly with AI-driven tools."
                : "Effortlessly create, schedule, and collaborate on personalized lesson plans for all ages, from infants to Grade 12."}
            </p>
            <div className="hero-content flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {user ? (
                <Link
                  href="/lesson-plan"
                  className="bg-teal-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Schedule Lesson Plan
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="bg-teal-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-teal-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="bg-teal-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-teal-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
      </div>
      <div className="bg-white w-full">
        <section className="max-w-5xl mx-auto px-6 py-20 space-y-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-900 text-center font-heading">
            Why Choose Play Plan Craft?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1"
              >
                {b.icon}
                <h3 className="text-xl font-semibold text-teal-800 mb-3 font-heading">
                  {b.title}
                </h3>
                <p className="text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="bg-teal-50 w-full">
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-teal-900 font-heading">
              Why Educators Love Play Plan Craft
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              Simplify your workflow with powerful tools designed to make lesson
              planning faster, smarter, and more collaborative.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) featureRefs.current[i] = el;
                }}
                className="flex items-center gap-4 p-4 bg-teal-100 rounded-lg hover:bg-teal-200 transition"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-teal-300 rounded-full shrink-0">
                  <FaCheckCircle className="text-teal-700" size={20} />
                </div>
                <p className="text-gray-800 text-base font-medium">{f}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="bg-white w-full">
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-teal-900 font-heading">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              A seamless process from planning to execution, powered by AI and
              collaboration.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {howItWorks.map((step, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) howRefs.current[i] = el;
                }}
                className={`${step.bgColor} rounded-xl p-6 text-center border ${step.borderColor} shadow-md hover:shadow-xl transition-transform hover:-translate-y-1`}
              >
                {step.icon}
                <h3 className="text-xl font-bold text-teal-800 font-heading">
                  {step.title}
                </h3>
                <p className="text-gray-600 mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="bg-amber-50 w-full">
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-teal-900 font-heading">
              Key Benefits of Play Plan Craft
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              Discover how Play Plan Craft empowers educators with cutting-edge
              tools and seamless integration.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {keyBenefits.map((benefit, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) benefitRefs.current[i] = el;
                }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1"
              >
                {benefit.icon}
                <h3 className="text-xl font-semibold text-teal-800 mb-3 font-heading">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="bg-white w-full">
        <section className="max-w-4xl mx-auto px-6 py-20 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-900 text-center font-heading">
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border-b border-gray-200 py-4 cursor-pointer"
              onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-teal-800 font-heading">
                  {faq.question}
                </h3>
                <FaChevronDown
                  className={`transition-transform ${
                    openFAQ === i ? "rotate-180" : ""
                  } text-teal-600`}
                />
              </div>
              {openFAQ === i && (
                <p className="mt-2 text-gray-600 text-base">{faq.answer}</p>
              )}
            </div>
          ))}
        </section>
      </div>
      <div className="bg-gradient-to-br from-teal-100 to-coral-100 w-full">
        <section ref={ctaRef} className="text-center py-24 px-6">
          <h3 className="cta-content text-3xl sm:text-4xl font-bold text-teal-900 mb-6 font-heading">
            {user
              ? "Ready to Plan Your Next Lesson?"
              : "Start Building Your First Plan Today"}
          </h3>
          <p className="cta-content text-lg text-gray-600 max-w-xl mx-auto mb-8">
            {user
              ? "Let’s create something extraordinary for your students!"
              : "Join educators worldwide in creating engaging, standards-aligned lesson plans with ease."}
          </p>
          <Link
            href={user ? "/lesson-plan" : "/signup"}
            className="cta-content bg-amber-400 text-teal-900 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-amber-300 transition-transform hover:scale-105"
          >
            {user ? "Go to Lesson Plans" : "Get Started Free"}
          </Link>
        </section>
      </div>
    </div>
  );
}