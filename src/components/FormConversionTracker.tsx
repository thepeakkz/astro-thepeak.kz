"use client";

import { useEffect } from "react";

export default function FormConversionTracker() {
  useEffect(() => {
    const trackFormSubmission = (event: SubmitEvent) => {
      if (!(event.target instanceof HTMLFormElement)) {
        return;
      }

      window.gtag_report_conversion?.();
    };

    document.addEventListener("submit", trackFormSubmission);

    return () => {
      document.removeEventListener("submit", trackFormSubmission);
    };
  }, []);

  return null;
}
