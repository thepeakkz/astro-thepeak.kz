import { useEffect, type ScriptHTMLAttributes } from "react";

type ScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & {
  id?: string;
  strategy?: "afterInteractive" | "beforeInteractive" | "lazyOnload" | "worker";
};

export default function Script({ children, dangerouslySetInnerHTML, id, src, strategy, ...props }: ScriptProps) {
  useEffect(() => {
    if (id && document.getElementById(id)) return;
    const mount = () => {
      const script = document.createElement("script");
      if (id) script.id = id;
      if (src) script.src = src;
      for (const [key, value] of Object.entries(props)) {
        if (value != null && typeof value !== "function") script.setAttribute(key, String(value));
      }
      if (dangerouslySetInnerHTML?.__html) script.text = String(dangerouslySetInnerHTML.__html);
      else if (typeof children === "string") script.text = children;
      document.head.appendChild(script);
    };
    if (strategy === "lazyOnload") window.addEventListener("load", mount, { once: true });
    else mount();
    return () => {
      if (strategy === "lazyOnload") window.removeEventListener("load", mount);
    };
  }, [children, dangerouslySetInnerHTML, id, props, src, strategy]);
  return null;
}
