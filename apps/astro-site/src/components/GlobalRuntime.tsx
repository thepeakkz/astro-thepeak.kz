import { useEffect, useState } from "react";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import LeadPopup from "@/components/LeadPopup";
import UtmTracker from "@/components/UtmTracker";

export default function GlobalRuntime() {
  const [enhancementsReady, setEnhancementsReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setEnhancementsReady(true), 3_000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <UtmTracker />
      <AnalyticsTracker />
      {enhancementsReady ? <LeadPopup /> : null}
    </>
  );
}
