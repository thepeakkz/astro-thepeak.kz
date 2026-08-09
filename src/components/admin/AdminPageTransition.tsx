"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const routeOrder = ["/admin", "/admin/cases", "/admin/trash", "/admin/analytics"];

function routeRank(pathname: string) {
  if (pathname.startsWith("/admin/pages/")) return 2;
  const exactIndex = routeOrder.indexOf(pathname);
  return exactIndex === -1 ? 0 : exactIndex;
}

export default function AdminPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const reduceMotion = useReducedMotion();
  const direction = routeRank(pathname) >= routeRank(previousPathname.current) ? 1 : -1;

  useEffect(() => {
    previousPathname.current = pathname;
  }, [pathname]);

  if (pathname.startsWith("/admin/login")) return children;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="peak-admin__page-transition"
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: direction * 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: direction * -6 }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
