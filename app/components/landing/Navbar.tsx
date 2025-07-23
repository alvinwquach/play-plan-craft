"use client";

import Link from "next/link";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    const elements = gsap.utils.toArray<HTMLElement>(".animate-on-scroll");
    elements.forEach((el, i) => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: 50,
          scale: 0.95,
        },
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
    <div className="relative bg-teal-50 text-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6">
        <div className="flex justify-end gap-4">
          <Link
            href="/login"
            className="bg-white border border-teal-400 text-teal-600 hover:bg-teal-100 px-5 py-2 rounded-full text-sm font-semibold transition shadow-sm hover:shadow-md"
          >
            Log In
          </Link>
          <Link
            href="/login"
            className="bg-teal-400 text-white hover:bg-teal-500 px-5 py-2 rounded-full text-sm font-semibold transition shadow-md hover:shadow-lg"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
