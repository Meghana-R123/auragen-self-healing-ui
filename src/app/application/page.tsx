
"use client";

import { useState } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";

export default function FinancialApplication() {
  const [submitted, setSubmitted] = useState(false);
  const [forceStandardLayout, setForceStandardLayout] = useState(false);

  const telemetry = useTelemetry();

  const adaptationEnabled = telemetry.settings.autoAdaptationEnabled;
  const thresholdReached =
    telemetry.cognitiveLoadScore >=
    telemetry.settings.cognitiveLoadThreshold;

  const isSimplified =
    adaptationEnabled &&
    thresholdReached &&
    telemetry.isHighFriction &&
    !forceStandardLayout;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#090d18] px-5 py-10 text-slate-100">
      <div className={`mx-auto ${isSimplified ? "max-w-2xl" : "max-w-4xl"}`}>

        <header className="mb-8">
          <a href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
            ← Back to AuraGen Dashboard
          </a>

          <div className="mt-6">
            <p className="text-sm font-medium text-indigo-400">
              AURAGEN · FINANCIAL SERVICES
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Financial Application
            </h1>

            <p className="mt-2 text-slate-400">
              {isSimplified
                ? "Let's complete this application one section at a time."
                : "Complete the form below to submit your application."}
            </p>
          </div>
        </header>

        {adaptationEnabled && thresholdReached && (
          <div className="mb-6 rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4">
            <p className="font-semibold text-indigo-300">
              {isSimplified
                ? "AuraGen has simplified this form"
                : "High interaction friction detected"}
            </p>

            <p className="mt-1 text-sm text-slate-300">
              {isSimplified
                ? "The form is now using a simplified single-column layout. Your entered information is preserved."
                : "You can activate the simplified layout to make this form easier to navigate."}
            </p>

            <button
              type="button"
              onClick={() => setForceStandardLayout((previous) => !previous)}
              className="mt-3 rounded-lg border border-indigo-400/40 px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-500/20"
            >
              {isSimplified ? "Return to standard layout" : "Use simplified layout"}
            </button>
          </div>
        )}

        {!adaptationEnabled && thresholdReached && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-300">
              High interaction friction detected
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Automatic UI Adaptation is disabled in Settings.
            </p>
          </div>
        )}

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8">
            <h2 className="text-2xl font-semibold text-emerald-400">
              Application submitted!
            </h2>

            <p className="mt-3 text-slate-300">
              Your demo application has passed browser validation.
              No information has been sent to a server.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium hover:bg-indigo-500"
            >
              Edit application
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* PERSONAL INFORMATION */}
            <section className={`rounded-2xl border border-white/10 bg-[#111a2b] ${isSimplified ? "p-5" : "p-6"}`}>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  Section 01
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Personal Information
                </h2>
                {!isSimplified && (
                  <p className="mt-1 text-sm text-slate-400">
                    Enter your basic personal details.
                  </p>
                )}
              </div>

              <div className={`grid gap-5 ${isSimplified ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    onFocus={() => telemetry.trackFocus("fullName")}
                    onClick={() => telemetry.trackClick("fullName")}
                    onBlur={() => telemetry.trackBlur("fullName")}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    onFocus={() => telemetry.trackFocus("email")}
                    onClick={() => telemetry.trackClick("email")}
                    onBlur={() => telemetry.trackBlur("email")}
                    placeholder="example@email.com"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    onFocus={() => telemetry.trackFocus("phone")}
                    onClick={() => telemetry.trackClick("phone")}
                    onBlur={() => telemetry.trackBlur("phone")}
                    placeholder="10-digit phone number"
                    pattern="[0-9]{10}"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    onFocus={() => telemetry.trackFocus("dateOfBirth")}
                    onClick={() => telemetry.trackClick("dateOfBirth")}
                    onBlur={() => telemetry.trackBlur("dateOfBirth")}
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div className={isSimplified ? "" : "sm:col-span-2"}>
                  <label className="mb-2 block text-sm text-slate-300">
                    Residential Address
                  </label>
                  <textarea
                    name="address"
                    onFocus={() => telemetry.trackFocus("address")}
                    onClick={() => telemetry.trackClick("address")}
                    onBlur={() => telemetry.trackBlur("address")}
                    rows={3}
                    placeholder="Enter your complete address"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </section>

            {/* EMPLOYMENT DETAILS */}
            <section className={`rounded-2xl border border-white/10 bg-[#111a2b] ${isSimplified ? "p-5" : "p-6"}`}>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  Section 02
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Employment Details
                </h2>
                {!isSimplified && (
                  <p className="mt-1 text-sm text-slate-400">
                    Tell us about your current employment.
                  </p>
                )}
              </div>

              <div className={`grid gap-5 ${isSimplified ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    onFocus={() => telemetry.trackFocus("employmentType")}
                    onClick={() => telemetry.trackClick("employmentType")}
                    onBlur={() => telemetry.trackBlur("employmentType")}
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>Select employment type</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self-employed</option>
                    <option value="business">Business Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    onFocus={() => telemetry.trackFocus("company")}
                    onClick={() => telemetry.trackClick("company")}
                    onBlur={() => telemetry.trackBlur("company")}
                    placeholder="Enter organization name"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    onFocus={() => telemetry.trackFocus("experience")}
                    onClick={() => telemetry.trackClick("experience")}
                    onBlur={() => telemetry.trackBlur("experience")}
                    min="0"
                    max="60"
                    placeholder="e.g. 5"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    name="income"
                    onFocus={() => telemetry.trackFocus("income")}
                    onClick={() => telemetry.trackClick("income")}
                    onBlur={() => telemetry.trackBlur("income")}
                    min="1"
                    placeholder="Enter monthly income"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </section>

            {/* FINANCIAL REQUIREMENTS */}
            <section className={`rounded-2xl border border-white/10 bg-[#111a2b] ${isSimplified ? "p-5" : "p-6"}`}>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  Section 03
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Financial Requirements
                </h2>
                {!isSimplified && (
                  <p className="mt-1 text-sm text-slate-400">
                    Provide details about your requested financial assistance.
                  </p>
                )}
              </div>

              <div className={`grid gap-5 ${isSimplified ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Requested Loan Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="loanAmount"
                    onFocus={() => telemetry.trackFocus("loanAmount")}
                    onClick={() => telemetry.trackClick("loanAmount")}
                    onBlur={() => telemetry.trackBlur("loanAmount")}
                    min="1000"
                    placeholder="Enter requested amount"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Loan Purpose
                  </label>
                  <select
                    name="loanPurpose"
                    onFocus={() => telemetry.trackFocus("loanPurpose")}
                    onClick={() => telemetry.trackClick("loanPurpose")}
                    onBlur={() => telemetry.trackBlur("loanPurpose")}
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>Select purpose</option>
                    <option value="education">Education</option>
                    <option value="home">Home</option>
                    <option value="business">Business</option>
                    <option value="personal">Personal Expenses</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Existing Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    name="existingEmi"
                    onFocus={() => telemetry.trackFocus("existingEmi")}
                    onClick={() => telemetry.trackClick("existingEmi")}
                    onBlur={() => telemetry.trackBlur("existingEmi")}
                    min="0"
                    placeholder="Enter 0 if none"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Preferred Repayment Period
                  </label>
                  <select
                    name="repaymentPeriod"
                    onFocus={() => telemetry.trackFocus("repaymentPeriod")}
                    onClick={() => telemetry.trackClick("repaymentPeriod")}
                    onBlur={() => telemetry.trackBlur("repaymentPeriod")}
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>Select duration</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                    <option value="60">60 months</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="rounded-xl border border-white/10 bg-[#111a2b] p-5">
              <label className="flex items-start gap-3 text-sm text-slate-300">
                <input type="checkbox" required className="mt-1 accent-indigo-500" />
                <span>
                  I confirm that the information provided is accurate and
                  consent to its use for this demonstration.
                </span>
              </label>
            </div>

            {/* TELEMETRY */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5">
              <h3 className="font-semibold text-indigo-300">
                Live Interaction Monitoring
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">Interactions</p>
                  <p className="text-2xl font-bold">
                    {telemetry.interactionCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Hesitations</p>
                  <p className="text-2xl font-bold">
                    {telemetry.hesitationCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Repeated Clicks</p>
                  <p className="text-2xl font-bold">
                    {telemetry.repeatedClickCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Cognitive Load</p>
                  <p className="text-2xl font-bold text-indigo-300">
                    {telemetry.cognitiveLoadScore}/100
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white transition hover:bg-indigo-500"
            >
              Submit Financial Application →
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          AuraGen · Development Prototype · Demonstration data only
        </p>
      </div>
    </main>
  );
}
