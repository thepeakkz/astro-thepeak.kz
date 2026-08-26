"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// Google Analytics and Meta Pixel don't need to compete with the critical
// render path. Mount them only once the browser is idle or the visitor has
// interacted, so their JS execution never counts against LCP/TBT.
export default function DeferredAnalyticsScripts() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const load = () => setShouldLoad(true);
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const idleId = idleWindow.requestIdleCallback?.(load, { timeout: 4_000 });
    const timeoutId = idleId === undefined ? window.setTimeout(load, 3_000) : undefined;

    window.addEventListener("pointerdown", load, { once: true, passive: true });
    window.addEventListener("scroll", load, { once: true, passive: true });
    window.addEventListener("keydown", load, { once: true });

    return () => {
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", load);
      window.removeEventListener("scroll", load);
      window.removeEventListener("keydown", load);
    };
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-HCKHMPWG4L" strategy="lazyOnload" />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-HCKHMPWG4L');
        `}
      </Script>
      <Script id="google-engagement-event" strategy="lazyOnload">
        {`
            // Helper function to delay opening a URL until a gtag event is sent.
            // Call it in response to an action that should navigate to a URL.
            function gtagSendEvent(url) {
              var callback = function () {
                if (typeof url === 'string') {
                  window.location = url;
                }
              };
              gtag('event', 'user_engagement', {
                'event_callback': callback,
                'event_timeout': 2000,
              });
              return false;
            }

            function gtag_report_conversion(url) {
              return gtagSendEvent(url);
            }
        `}
      </Script>
      <Script id="meta-pixel" strategy="lazyOnload">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '869063512449970');
          fbq('track', 'PageView');
        `}
      </Script>
    </>
  );
}
