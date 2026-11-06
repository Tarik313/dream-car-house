"use server";

import { getBackendOrigin, getShowroomBranches, getSiteSettings } from "@/lib/server/api";

export interface AppointmentSubmissionInput {
  fullName: string;
  phone: string;
  interest?: string;
  branch?: string;
  date?: string;
  notes?: string;
  submissionKey?: string;
}

export interface AppointmentSubmissionResult {
  ok: boolean;
  error?: string;
  data?: {
    id?: number | string;
    fullName: string;
    branchLabel: string;
    date: string;
    waUrl: string;
    duplicatePrevented?: boolean;
  };
}

export async function submitAppointmentEnquiryAction(
  input: AppointmentSubmissionInput
): Promise<AppointmentSubmissionResult> {
  try {

    // 1. Sanitize & Validate inputs
    const fullName = (input.fullName || "").trim().replace(/[<>]/g, "");
    if (!fullName || fullName.length < 2) {
      return { ok: false, error: "Please enter your full name (minimum 2 characters)." };
    }
    if (fullName.length > 100) {
      return { ok: false, error: "Name must be 100 characters or fewer." };
    }

    const rawPhone = (input.phone || "").trim();
    // Validate phone number: 8 to 20 chars, optional + followed by digits, spaces, hyphens
    const phoneRe = /^[+0-9\s-]{8,20}$/;
    if (!rawPhone || !phoneRe.test(rawPhone)) {
      return {
        ok: false,
        error: "Please enter a valid phone number (at least 8 digits with country code or local format).",
      };
    }
    const cleanPhone = rawPhone;

    const interest = (input.interest || "Brand New & Reconditioned Import").trim().replace(/[<>]/g, "");
    const branchKey = (input.branch || "kakrail").trim().toLowerCase();
    const date = (input.date || "").trim();
    const notes = (input.notes || "").trim().replace(/[<>]/g, "").slice(0, 500);

    // Resolve branch label and phone dynamically
    let branchLabel = branchKey;
    let targetPhone = "";
    try {
      const branches = await getShowroomBranches();
      const matched = branches.find(
        (b) => b.branch_id?.toLowerCase() === branchKey || String(b.id) === branchKey
      );
      if (matched) {
        branchLabel = `${matched.name}${matched.address ? ` (${matched.address})` : ""}`;
        if (matched.hotline) targetPhone = matched.hotline;
      }
    } catch {
      // ignore
    }

    if (!targetPhone) {
      try {
        const settings = await getSiteSettings();
        targetPhone = settings?.whatsapp || settings?.hotline || "";
      } catch {
        // ignore
      }
    }

    // 2. Generate WhatsApp URL
    const waAppointmentMsg = encodeURIComponent(
      `Hello DREAM CAR HOUSE Concierge,\n\nI have confirmed a VIP Private Consultation request:\n\n• Name: ${fullName}\n• Phone: ${cleanPhone}\n• Interest: ${interest}\n• Showroom Branch: ${branchLabel}\n• Preferred Date: ${date || "Earliest Available"}\n• Notes: ${notes || "General VIP Tour"}`
    );
    const cleanDigits = targetPhone.replace(/[^0-9]/g, "");
    let waPhone = cleanDigits;
    if (waPhone.startsWith("0")) {
      waPhone = "88" + waPhone;
    } else if (!waPhone.startsWith("880") && waPhone.length === 10) {
      waPhone = "880" + waPhone;
    }
    const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${waAppointmentMsg}` : "";

    // 3. Persistent backend idempotency key
    const submissionKey =
      input.submissionKey ||
      `appt_${cleanPhone.replace(/[^0-9]/g, "")}_${branchKey}_${(date || "any").replace(/[^a-zA-Z0-9]/g, "")}`;

    // 4. Determine Django topic
    const isSelling = interest.toLowerCase().includes("sell") || interest.toLowerCase().includes("trade");
    const topic = isSelling ? "SELLING" : "BUYING";

    const vehicleSummary = `VIP Reservation: ${branchLabel.split(" (")[0]} [${interest}]`;
    const messageBody = `Preferred Date: ${date || "Earliest Available"}\nNotes / Specific Query: ${
      notes || "None specified"
    }\nSubmitted via VIP Consultation Reservation Modal.`;

    // 5. Submit to Django ContactMessage endpoint with atomic backend idempotency
    const backendOrigin = getBackendOrigin();
    const res = await fetch(`${backendOrigin}/api/v1/home/contact/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": submissionKey,
      },
      body: JSON.stringify({
        topic,
        name: fullName,
        phone: cleanPhone,
        email: "",
        vehicle: vehicleSummary.slice(0, 150),
        enquiry: messageBody.slice(0, 3000),
        preferred_contact: "WHATSAPP",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 409) {
        return {
          ok: false,
          error: "A reservation with different details was already submitted under this reference. Please refresh or retry.",
        };
      }
      let errMsg = "Unable to record your consultation reservation. Please try again or contact us directly.";
      try {
        const errorData = await res.json();
        if (errorData?.errors && typeof errorData.errors === "object") {
          const firstErrKey = Object.keys(errorData.errors)[0];
          const firstErrVal = errorData.errors[firstErrKey];
          errMsg = Array.isArray(firstErrVal) ? firstErrVal[0] : String(firstErrVal);
        } else if (errorData?.message) {
          errMsg = errorData.message;
        } else if (errorData?.error?.message) {
          errMsg = errorData.error.message;
        }
      } catch {
        // Fall back to default message
      }
      return { ok: false, error: errMsg };
    }

    const payload = await res.json();
    const recordId = payload?.data?.id || payload?.id || `APP-${Date.now()}`;

    return {
      ok: true,
      data: {
        id: recordId,
        fullName,
        branchLabel,
        date: date || "Earliest Available",
        waUrl,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { ok: false, error: errorMsg };
  }
}
