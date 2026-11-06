"use server";

import { getBackendOrigin, getSiteSettings } from "@/lib/server/api";

export interface SellCarSubmissionInput {
  name: string;
  phone: string;
  carName: string;
  carModel: string;
  carYear: string;
  mileage: number | string;
  offeredPrice?: number | string;
  notes?: string;
  images?: File[];
}

export interface SellCarSubmissionResult {
  ok: boolean;
  error?: string;
  data?: {
    id?: number | string;
    waUrl?: string;
  };
}

export async function submitSellCarAction(
  input: SellCarSubmissionInput | FormData
): Promise<SellCarSubmissionResult> {
  try {
    let name = "";
    let rawPhone = "";
    let carName = "";
    let carModel = "";
    let carYear = "";
    let rawMileage = "";
    let rawOfferedPrice = "";
    let notes = "";
    let imageFiles: File[] = [];

    if (typeof FormData !== "undefined" && input instanceof FormData) {
      name = String(input.get("name") || "");
      rawPhone = String(input.get("phone") || "");
      carName = String(input.get("carName") || "");
      carModel = String(input.get("carModel") || "");
      carYear = String(input.get("carYear") || "");
      rawMileage = String(input.get("mileage") || "");
      rawOfferedPrice = String(input.get("offeredPrice") || "");
      notes = String(input.get("notes") || "");
      const allImages = input.getAll("images");
      imageFiles = allImages.filter((item): item is File => item instanceof File && item.size > 0);
    } else {
      const obj = input as SellCarSubmissionInput;
      name = obj.name || "";
      rawPhone = obj.phone || "";
      carName = obj.carName || "";
      carModel = obj.carModel || "";
      carYear = obj.carYear || "";
      rawMileage = String(obj.mileage || "");
      rawOfferedPrice = String(obj.offeredPrice || "");
      notes = obj.notes || "";
      if (Array.isArray(obj.images)) {
        imageFiles = obj.images.filter((item): item is File => item instanceof File && item.size > 0);
      }
    }

    name = name.trim().replace(/[<>]/g, "");
    if (!name || name.length < 2) {
      return { ok: false, error: "Please enter your name (minimum 2 characters)." };
    }

    rawPhone = rawPhone.trim();
    const phoneRe = /^[+0-9\s-]{8,20}$/;
    if (!rawPhone || !phoneRe.test(rawPhone)) {
      return {
        ok: false,
        error: "Please enter a valid phone number (at least 8 digits with country code or local format).",
      };
    }

    carName = carName.trim().replace(/[<>]/g, "");
    if (!carName) {
      return { ok: false, error: "Please enter vehicle manufacturer or brand." };
    }

    carModel = carModel.trim().replace(/[<>]/g, "");
    if (!carModel) {
      return { ok: false, error: "Please enter vehicle model." };
    }

    carYear = carYear.trim().replace(/[<>]/g, "");
    if (!carYear) {
      return { ok: false, error: "Please enter production year." };
    }

    const cleanMileage = rawMileage.replace(/[^0-9]/g, "");
    const mileageNum = parseInt(cleanMileage, 10);
    if (isNaN(mileageNum) || mileageNum < 0) {
      return { ok: false, error: "Please enter valid mileage in km." };
    }

    let offeredPriceNum: number | null = null;
    if (rawOfferedPrice) {
      const parsedPrice = parseInt(String(rawOfferedPrice).replace(/[^0-9]/g, ""), 10);
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        offeredPriceNum = parsedPrice;
      }
    }

    // Resolve concierge phone for WhatsApp link
    let targetPhone = "";
    try {
      const settings = await getSiteSettings();
      targetPhone = settings?.whatsapp || settings?.hotline || "";
    } catch {
      // ignore
    }

    const waMsg = encodeURIComponent(
      `Hello DREAM CAR HOUSE Valuation Desk,\n\nI have submitted my luxury car for trade-in / valuation:\n\n• Name: ${name}\n• Phone: ${rawPhone}\n• Brand: ${carName}\n• Model: ${carModel}\n• Year: ${carYear}\n• Mileage: ${mileageNum.toLocaleString()} km${
        offeredPriceNum ? `\n• Expected Price: BDT ${offeredPriceNum.toLocaleString()}` : ""
      }${notes ? `\n• Notes: ${notes}` : ""}${
        imageFiles.length > 0 ? `\n• Attached Images: ${imageFiles.length} photos uploaded` : ""
      }`
    );

    const cleanDigits = targetPhone.replace(/[^0-9]/g, "");
    let waPhone = cleanDigits;
    if (waPhone.startsWith("0")) {
      waPhone = "88" + waPhone;
    } else if (!waPhone.startsWith("880") && waPhone.length === 10) {
      waPhone = "880" + waPhone;
    }
    const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${waMsg}` : "";

    // Prepare multipart/form-data for Django Backend endpoint /api/v1/home/sell-car/
    const origin = getBackendOrigin();
    const backendFormData = new FormData();
    backendFormData.append("name", name);
    backendFormData.append("phone", rawPhone);
    backendFormData.append("car_name", carName);
    backendFormData.append("car_model", carModel);
    backendFormData.append("car_year", carYear);
    backendFormData.append("mileage", String(mileageNum));
    if (offeredPriceNum) {
      backendFormData.append("offered_price", String(offeredPriceNum));
    }

    // Attach uploaded vehicle images (max 10 images)
    for (const img of imageFiles.slice(0, 10)) {
      backendFormData.append("images", img);
    }

    const res = await fetch(`${origin}/api/v1/home/sell-car/`, {
      method: "POST",
      body: backendFormData,
      cache: "no-store",
    });

    if (!res.ok) {
      let errMsg = "Unable to submit your car details. Please try again or reach out on WhatsApp.";
      try {
        const errorData = await res.json();
        if (errorData?.errors && typeof errorData.errors === "object") {
          const firstErrKey = Object.keys(errorData.errors)[0];
          const firstErrVal = errorData.errors[firstErrKey];
          errMsg = Array.isArray(firstErrVal) ? firstErrVal[0] : String(firstErrVal);
        } else if (errorData?.images && Array.isArray(errorData.images)) {
          errMsg = errorData.images[0];
        } else if (errorData?.message) {
          errMsg = errorData.message;
        }
      } catch {
        // fallback
      }
      return { ok: false, error: errMsg };
    }

    const resJson = await res.json();
    const recordId = resJson?.id || resJson?.data?.id || `SELL-${Date.now()}`;

    return {
      ok: true,
      data: {
        id: recordId,
        waUrl,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return { ok: false, error: errorMsg };
  }
}
