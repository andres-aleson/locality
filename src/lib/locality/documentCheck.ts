import "server-only";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import type { SubmissionKind } from "./types";

// This is a *quality* check, not an authenticity check — it cannot tell a
// real document from a well-made fake. It only catches: unreadable/blurry
// photos, and photos that don't even superficially look like the right
// document type. Anything not obviously wrong still needs a human to review.

const LAPLACIAN_KERNEL = {
  width: 3,
  height: 3,
  kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
};

// Standard deviation of a Laplacian-filtered image approximates edge energy
// — sharp photos have lots of high-frequency edges, blurry ones don't.
// Tuned against synthetic clean vs. heavily-blurred fixtures (see the
// pipeline test run) with headroom on both sides.
const BLUR_SHARPNESS_THRESHOLD = 12;

const KEYWORDS: Record<SubmissionKind, string[]> = {
  residence: [
    "utility",
    "bill",
    "statement",
    "lease",
    "account",
    "service address",
    "billing",
    "amount due",
    "resident",
  ],
  license: ["license", "driver", "dob", "date of birth", "expires", "class", "endorsements"],
};

export interface DocumentCheckResult {
  blurry: boolean;
  sharpness: number;
  passed: boolean;
  extractedText: string;
  matchedKeywords: string[];
  reasons: string[];
}

export async function assessSharpness(buffer: Buffer): Promise<number> {
  const { channels } = await sharp(buffer).greyscale().convolve(LAPLACIAN_KERNEL).stats();
  return channels[0].stdev;
}

export async function extractText(buffer: Buffer): Promise<string> {
  // Serverless hosts (e.g. Vercel) have a read-only filesystem except /tmp —
  // without this, tesseract.js's default cache location fails to write when
  // it downloads the language data on first use.
  const worker = await createWorker("eng", 1, { cachePath: "/tmp" });
  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text;
  } finally {
    await worker.terminate();
  }
}

export async function runDocumentCheck(
  buffer: Buffer,
  kind: SubmissionKind
): Promise<DocumentCheckResult> {
  const sharpness = await assessSharpness(buffer);
  const blurry = sharpness < BLUR_SHARPNESS_THRESHOLD;

  if (blurry) {
    return {
      blurry: true,
      sharpness,
      passed: false,
      extractedText: "",
      matchedKeywords: [],
      reasons: ["Image is too blurry to read."],
    };
  }

  const extractedText = await extractText(buffer);
  const lower = extractedText.toLowerCase();
  const matchedKeywords = KEYWORDS[kind].filter((keyword) => lower.includes(keyword));

  const reasons: string[] = [];
  if (extractedText.trim().length < 20) {
    reasons.push("Very little readable text was found in the photo.");
  }
  if (matchedKeywords.length === 0) {
    reasons.push(`No expected ${kind} keywords were found — double-check the right document was uploaded.`);
  }

  return {
    blurry: false,
    sharpness,
    passed: reasons.length === 0,
    extractedText,
    matchedKeywords,
    reasons,
  };
}
