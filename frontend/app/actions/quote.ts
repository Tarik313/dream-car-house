"use server";

import { getBackendOrigin } from "@/lib/server/api";

export interface QuoteSubmissionInput {
  carId: number | string;
  name: string;
  email: string;
  phone: string;
}

export interface QuoteSubmissionResult {
  ok: boolean;
  error?: string;
  data?: {
    id?: number | string;
  };
}

export async function submitInventoryQuoteAction(
  input: QuoteSubmissionInput
): Promise<QuoteSubmissionResult> {
  try {
    const name = (input.name || "").trim().replace(/[<>]/g, "");
    if (!name || name.length < 2) {
      return { ok: false, error: "Please enter your full name (minimum 2 characters)." };
    }

    const email = (input.email || "").trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }

    const rawPhone = (input.phone || "").trim();
    const phoneRe = /^[+0-9\s-]{8,20}$/;
    if (!rawPhone || !phoneRe.test(rawPhone)) {
      return {
        ok: false,
        error: "Please enter a valid phone number (at least 8 digits).",
      };
    }

    const carId = parseInt(String(input.carId), 10);
    if (isNaN(carId) || carId <= 0) {
      return { ok: false, error: "Invalid vehicle identification." };
    }

    const backendOrigin = getBackendOrigin();
    const res = await fetch(`${backendOrigin}/api/v1/inventory/quote/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        car: carId,
        name,
        email,
        phone: rawPhone,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      let errMsg = "Unable to submit your quotation request. Please try again or reach out on WhatsApp.";
      try {
        const errorData = await res.json();
        if (errorData?.message) errMsg = errorData.message;
      } catch {
        // fallback
      }
      return { ok: false, error: errMsg };
    }

    const json = await res.json();
    return {
      ok: true,
      data: {
        id: json?.data?.id || json?.id,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { ok: false, error: errorMsg };
  }
}
