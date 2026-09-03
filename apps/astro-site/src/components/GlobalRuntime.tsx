import { useEffect, useState } from "react";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import LeadPopup from "@/components/LeadPopup";
import UtmTracker from "@/components/UtmTracker";

export default function GlobalRuntime() {
  const isTest =
    typeof process !== "undefined" &&
    (process.env.PLAYWRIGHT_TEST === "1" || process.env.CI === "true");
  const [enhancementsReady, setEnhancementsReady] = useState(isTest);

  useEffect(() => {
    if (isTest) return;
    const timeoutId = window.setTimeout(() => setEnhancementsReady(true), 3_000);
    return () => window.clearTimeout(timeoutId);
  }, [isTest]);

  return (
    <>
      <UtmTracker />
      <AnalyticsTracker />
      {enhancementsReady ? <LeadPopup /> : null}
    </>
  );
}
