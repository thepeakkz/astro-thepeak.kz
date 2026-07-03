"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createTouchpoint,
  getDeviceType,
  parseUtmAttribution,
  serializeUtmAttribution,
  updateAttribution,
  UTM_COOKIE_MAX_AGE,
  UTM_COOKIE_NAME,
} from "@/lib/utm";

export default function UtmTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const isInitialVisit = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(query);
    const page = `${pathname}${query ? `?${query}` : ""}`;
    const landingPage = `${window.location.origin}${page}`;
    const touchpoint = createTouchpoint(params, landingPage, document.referrer);
    const cookieValue = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${UTM_COOKIE_NAME}=`))
      ?.slice(UTM_COOKIE_NAME.length + 1);
    const hasCampaignData = Object.keys(touchpoint.params).length > 0 ||
      Object.keys(touchpoint.clickIds).length > 0;
    const attribution = updateAttribution(
      parseUtmAttribution(cookieValue),
      touchpoint,
      getDeviceType(navigator.userAgent),
      page,
      isInitialVisit.current || hasCampaignData
    );

    isInitialVisit.current = false;

    document.cookie = [
      `${UTM_COOKIE_NAME}=${serializeUtmAttribution(attribution)}`,
      `Max-Age=${UTM_COOKIE_MAX_AGE}`,
      "Path=/",
      "SameSite=Lax",
      window.location.protocol === "https:" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");
  }, [pathname, query]);

  return null;
}
