"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { FaChalkboardTeacher, FaUserFriends } from "react-icons/fa";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createEducatorOrganization,
  requestAssistantRole,
} from "../actions/createEducatorOrganization";

gsap.registerPlugin(ScrollTrigger);

export default function Onboarding() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"EDUCATOR" | "ASSISTANT" | null>(null);
  const [educatorEmail, setEducatorEmail] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log("Session:", session);
      if (sessionError) {
        console.error("Error checking session:", sessionError);
        toast.error(`Failed to check session: ${sessionError.message}`, {
          position: "top-right",
        });
        return;
      }
      if (!session) {
        router.push("/login");
      } else {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role, organizationId, pendingApproval")
          .eq("id", session.user.id)
          .single();
        if (error) {
          console.error("Error checking user role in onboarding:", error);
          toast.error(`Failed to fetch user data: ${error.message}`, {
            position: "top-right",
          });
        } else if (userData?.role) {
          router.push(
            userData.pendingApproval ? "/pending-approval" : "/lesson-plan"
          );
        }
      }
    };
    checkSession();
    gsap.fromTo(
      ".animate-on-load",
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    );
  }, [router, supabase]);

  const handleEducatorSubmit = async () => {
    setLoading(true);
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) {
      if (userError.code !== "EDUCATOR_NOT_FOUND") {
        console.error("Organization creation/join error:", userError);
      }
      toast.error(userError.message ?? "Something went wrong.", {
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    const { error } = await createEducatorOrganization(
      user.user.id,
      user.user.email!,
      educatorEmail
    );
    if (error) {
      console.error("Organization creation/join error:", error);
      toast.error(`${error.message}`, {
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    console.log(
      educatorEmail
        ? "Requested to join educator's organization. Redirecting to /pending-approval"
        : "Organization successfully created. Redirecting to /lesson-plan"
    );
    toast.success(
      educatorEmail
        ? "Request to join organization sent successfully!"
        : "Organization created successfully!",
      {
        position: "top-right",
      }
    );
    router.push(educatorEmail ? "/pending-approval" : "/lesson-plan");
    setLoading(false);
  };

  const handleAssistantSubmit = async () => {
    setLoading(true);
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User fetch error:", userError);
      toast.error(
        `Failed to fetch user: ${
          userError?.message ?? "Unknown error"
        } (Code: ${userError?.code ?? "N/A"})`,
        {
          position: "top-right",
        }
      );
      setLoading(false);
      return;
    }

    const { error } = await requestAssistantRole(user.user.id, educatorEmail);
    if (error) {
      console.error("Assistant role request error:", error);
      toast.error(`${error.message}`, {
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    console.log("Assistant role requested. Redirecting to /pending-approval");
    toast.success("Assistant role request sent successfully!", {
      position: "top-right",
    });
    router.push("/pending-approval");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full animate-on-load">
        <h1 className="text-3xl font-bold text-teal-800 mb-6 text-center">
          Welcome to Play Plan Craft
        </h1>
        {!role && (
          <div className="space-y-6">
            <p className="text-gray-600 mb-6 text-center">
              Choose your role to get started
            </p>
            <button
              onClick={() => setRole("EDUCATOR")}
              disabled={loading}
              className="w-full bg-teal-500 text-white py-3 px-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-teal-600 transition-all duration-300 hover:scale-105 disabled:bg-teal-300"
            >
              <FaChalkboardTeacher className="text-xl" />
              Educator
            </button>
            <button
              onClick={() => setRole("ASSISTANT")}
              disabled={loading}
              className="w-full bg-yellow-400 text-teal-900 py-3 px-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-yellow-300 transition-all duration-300 hover:scale-105 disabled:bg-yellow-200"
            >
              <FaUserFriends className="text-xl" />
              Assistant
            </button>
          </div>
        )}
        {role === "EDUCATOR" && (
          <div className="space-y-6 animate-on-load">
            <div>
              <p className="text-gray-600 mb-2 text-center">
                As an educator, you have two options:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600 text-center">
                <li>
                  <strong>Join an existing organization:</strong> Enter another
                  educator&apos;`s email below to request to join their
                  organization. Note that joining an organization restricts you
                  from rescheduling or deleting lesson plans, but you can add
                  lesson plans to the shared organization calendar.
                </li>
                <li>
                  <strong>Create your own organization:</strong> Leave the email
                  field blank to create your own organization. This allows you
                  to manage your own lesson plans and invite co-teachers and
                  assistants to join your organization.
                </li>
              </ul>
              <label
                htmlFor="educatorEmail"
                className="block text-gray-700 font-medium sr-only"
              >
                Enter another educator&apos;`s email to join their organization
                (optional)
              </label>
              <input
                id="educatorEmail"
                type="email"
                value={educatorEmail}
                onChange={(e) => setEducatorEmail(e.target.value)}
                className="mt-2 w-full p-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="educator@example.com"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setRole(null)}
                disabled={loading}
                className="w-1/2 bg-gray-300 text-gray-800 py-3 px-4 rounded-full font-semibold hover:bg-gray-400 transition-all duration-300"
              >
                Back
              </button>
              <button
                onClick={handleEducatorSubmit}
                disabled={loading}
                className="w-1/2 bg-teal-500 text-white py-3 px-4 rounded-full font-semibold hover:bg-teal-600 transition-all duration-300 disabled:bg-teal-300"
              >
                Submit
              </button>
            </div>
          </div>
        )}
        {role === "ASSISTANT" && (
          <div className="space-y-4 animate-on-load">
            <label
              htmlFor="educatorEmail"
              className="block text-gray-700 font-medium"
            >
              Enter your educator&apos;`s email
            </label>
            <input
              id="educatorEmail"
              type="email"
              value={educatorEmail}
              onChange={(e) => setEducatorEmail(e.target.value)}
              className="w-full p-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="educator@example.com"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setRole(null)}
                disabled={loading}
                className="w-1/2 bg-gray-300 text-gray-800 py-3 px-4 rounded-full font-semibold hover:bg-gray-400 transition-all duration-300"
              >
                Back
              </button>
              <button
                onClick={handleAssistantSubmit}
                disabled={loading || !educatorEmail}
                className="w-1/2 bg-teal-500 text-white py-3 px-4 rounded-full font-semibold hover:bg-teal-600 transition-all duration-300 disabled:bg-teal-300"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}