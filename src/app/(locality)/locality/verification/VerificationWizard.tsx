"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LocalityLogo } from "@/components/locality/Logo";
import { EncryptionNotice } from "@/components/locality/EncryptionNotice";
import {
  completeVerificationStep,
  acceptTermsOfService,
  updateProfile,
} from "@/lib/locality/actions";
import { SCHOOLS } from "@/lib/locality/seed";
import type { User, VerificationSteps } from "@/lib/locality/types";

const STEP_ORDER: (keyof VerificationSteps)[] = [
  "phone",
  "email",
  "address",
  "school",
  "license",
  "parent",
];

const GRADES = [
  "Kindergarten",
  "1st grade",
  "2nd grade",
  "3rd grade",
  "4th grade",
  "5th grade",
  "6th grade",
  "7th grade",
  "8th grade",
  "9th grade",
  "10th grade",
  "11th grade",
  "12th grade",
];

function StatusIcon({ status }: { status: "pending" | "verifying" | "done" }) {
  if (status === "done") {
    return (
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 10.5 8 14.5 16 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === "verifying") {
    return (
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-sky-500 border-t-transparent text-sky-500 dark:border-sky-400 dark:border-t-transparent">
        <span className="sr-only">Verifying…</span>
        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent dark:border-sky-400 dark:border-t-transparent" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-500">
      <span className="h-2 w-2 rounded-full bg-current" />
    </span>
  );
}

export function VerificationWizard({
  initialProfile,
  initialVerification,
  initialTosAccepted,
  initialAccountApproved,
}: {
  initialProfile: User;
  initialVerification: VerificationSteps;
  initialTosAccepted: boolean;
  initialAccountApproved: boolean;
}) {
  const router = useRouter();
  const [verification, setVerification] = useState(initialVerification);
  const [tosAccepted, setTosAccepted] = useState(initialTosAccepted);
  const [tosPending, setTosPending] = useState(false);
  const [verifyingStep, setVerifyingStep] = useState<keyof VerificationSteps | null>(null);
  const [name, setName] = useState(initialProfile.name);

  const [phone, setPhone] = useState(initialProfile.phone);
  const [email, setEmail] = useState(initialProfile.email);
  const [address, setAddress] = useState(initialProfile.address);
  const [licenseConfirmed, setLicenseConfirmed] = useState(false);
  const [childName, setChildName] = useState("");
  const [childGrade, setChildGrade] = useState(GRADES[0]);
  const [childSchoolId, setChildSchoolId] = useState(SCHOOLS[0].id);

  const isVerified = Object.values(verification).every(Boolean);
  const doneCount = STEP_ORDER.filter((s) => verification[s]).length;
  const accountApproved = initialAccountApproved || (isVerified && tosAccepted);

  async function handleAcceptTos() {
    setTosPending(true);
    try {
      await acceptTermsOfService();
      setTosAccepted(true);
    } finally {
      setTosPending(false);
    }
  }

  async function runVerify(step: keyof VerificationSteps, fields?: Parameters<typeof completeVerificationStep>[1]) {
    setVerifyingStep(step);
    await completeVerificationStep(step, fields);
    setVerification((prev) => ({ ...prev, [step]: true }));
    setVerifyingStep(null);
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <LocalityLogo />
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Let&apos;s verify you&apos;re a real, local parent
        </h1>
        <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">
          Every family on Locality completes this before joining a Circle.
        </p>
        <EncryptionNotice className="max-w-sm text-left" />
      </div>

      {!tosAccepted ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Before you continue, please read and agree to our{" "}
            <Link href="/locality/terms" target="_blank" className="font-medium text-sky-600 underline dark:text-sky-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/locality/privacy" target="_blank" className="font-medium text-sky-600 underline dark:text-sky-400">
              Privacy Policy
            </Link>
            . These explain that Locality currently relies on self-reported information rather than
            document verification, and what that means for you and your family.
          </p>
          <button
            onClick={handleAcceptTos}
            disabled={tosPending}
            className="self-start rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
          >
            I agree — continue
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="parent-name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Your name
            </label>
            <input
              id="parent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name.trim() && updateProfile({ name: name.trim() })}
              placeholder="First and last name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(doneCount / STEP_ORDER.length) * 100}%` }}
              />
            </div>
            <span className="flex-none text-xs font-medium text-slate-500 dark:text-slate-400">
              {doneCount}/{STEP_ORDER.length}
            </span>
          </div>

          {accountApproved && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-600/20 bg-emerald-50 px-6 py-6 text-center dark:border-emerald-400/20 dark:bg-emerald-500/10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white dark:bg-emerald-500">
                ✓ Account created
              </span>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                You&apos;re all set. Your profile now carries the Identity Verified, Parent Verified,
                and Driver Verified badges.
              </p>
              <button
                onClick={() => router.push("/locality/app/circle")}
                className="mt-1 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                Continue to join a community →
              </button>
            </div>
          )}

          <ol className="flex flex-col gap-4">
            {/* Phone */}
            <li className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <StatusIcon status={verification.phone ? "done" : verifyingStep === "phone" ? "verifying" : "pending"} />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Phone number</h2>
                  {verification.phone ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{phone || "Confirmed"}</p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(209) 555-0100"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                      />
                      <button
                        disabled={!phone.trim() || verifyingStep === "phone"}
                        onClick={() => runVerify("phone", { phone: phone.trim() })}
                        className="flex-none rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>

            {/* Email */}
            <li className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <StatusIcon status={verification.email ? "done" : verifyingStep === "email" ? "verifying" : "pending"} />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Email address</h2>
                  {verification.email ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{email || "Confirmed"}</p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                      />
                      <button
                        disabled={!email.trim() || verifyingStep === "email"}
                        onClick={() => runVerify("email", { email: email.trim() })}
                        className="flex-none rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>

            {/* Address */}
            <li className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <StatusIcon status={verification.address ? "done" : verifyingStep === "address" ? "verifying" : "pending"} />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Mountain House address
                  </h2>
                  {verification.address ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{address || "Confirmed"}</p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Self-reported — Locality does not independently verify your address.
                      </p>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Bethany Dr, Mountain House, CA"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                      />
                      <button
                        disabled={!address.trim() || verifyingStep === "address"}
                        onClick={() => runVerify("address", { address: address.trim() })}
                        className="self-start rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>

            {/* School connection */}
            <li className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <StatusIcon status={verification.school ? "done" : verifyingStep === "school" ? "verifying" : "pending"} />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">School connection</h2>
                  {verification.school ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {childName || "Confirmed"} ·{" "}
                      {SCHOOLS.find((s) => s.id === childSchoolId)?.name ?? "your school"}
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      <select
                        value={childSchoolId}
                        onChange={(e) => setChildSchoolId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                      >
                        {SCHOOLS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.gradeRange})
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          placeholder="Child's first name"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                        />
                        <select
                          value={childGrade}
                          onChange={(e) => setChildGrade(e.target.value)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                        >
                          {GRADES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        disabled={!childName.trim() || verifyingStep === "school"}
                        onClick={() =>
                          runVerify("school", { childName: childName.trim(), childGrade, schoolId: childSchoolId })
                        }
                        className="self-start rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>

            {/* Driver's license */}
            <li className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <StatusIcon status={verification.license ? "done" : verifyingStep === "license" ? "verifying" : "pending"} />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Driver&apos;s license</h2>
                  {verification.license ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Self-reported</p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Every Locality parent is a potential driver, so we ask up front. Locality does
                        not independently verify your license, insurance, or vehicle registration —
                        see our{" "}
                        <Link href="/locality/terms" target="_blank" className="font-medium text-sky-600 underline dark:text-sky-400">
                          Terms of Service
                        </Link>
                        .
                      </p>
                      <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={licenseConfirmed}
                          onChange={(e) => setLicenseConfirmed(e.target.checked)}
                          className="mt-0.5 h-4 w-4 flex-none rounded border-slate-300 dark:border-slate-700"
                        />
                        I confirm I hold a valid driver&apos;s license, current auto insurance, and
                        vehicle registration.
                      </label>
                      <button
                        disabled={!licenseConfirmed || verifyingStep === "license"}
                        onClick={() => runVerify("license")}
                        className="self-start rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
                      >
                        Confirm &amp; verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>

            {/* Parent verification */}
            <li className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <StatusIcon status={verification.parent ? "done" : verifyingStep === "parent" ? "verifying" : "pending"} />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Parent verification</h2>
                  {verification.parent ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Guardian status confirmed
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Confirms you&apos;re the parent or legal guardian of the child listed above.
                      </p>
                      <button
                        disabled={verifyingStep === "parent"}
                        onClick={() => runVerify("parent")}
                        className="self-start rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
                      >
                        Confirm &amp; verify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          </ol>
        </>
      )}
    </main>
  );
}
