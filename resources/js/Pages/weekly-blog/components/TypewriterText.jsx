import { useEffect, useState } from "react";

/* ── Hero typewriter line ── */
export default function TypewriterText({ text, delay = 0 }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 38);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);
  return (
    <span>
      {displayed}
      <span
        style={{
          borderRight: "2px solid #f59e0b",
          animation: "blink 0.8s step-end infinite",
          marginLeft: displayed.length < text.length ? 0 : -2,
        }}
      />
    </span>
  );
}
