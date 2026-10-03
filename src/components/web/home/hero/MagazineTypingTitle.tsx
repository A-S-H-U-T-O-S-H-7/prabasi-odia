"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const TITLE = "Explore magazines";

export default function MagazineTypingTitle() {
  const reduceMotion = useReducedMotion();
  const [visibleLength, setVisibleLength] = useState(TITLE.length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    const atEnd = visibleLength === TITLE.length;
    const atStart = visibleLength === 0;
    const delay = atEnd && !deleting ? 1800 : atStart && deleting ? 450 : deleting ? 65 : 105;

    const timeout = window.setTimeout(() => {
      if (atEnd && !deleting) {
        setDeleting(true);
      } else if (atStart && deleting) {
        setDeleting(false);
      } else {
        setVisibleLength((length) => length + (deleting ? -1 : 1));
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [deleting, reduceMotion, visibleLength]);

  return (
    <span className="mt-1 grid font-serif text-lg font-bold leading-tight text-[#2A1636]">
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {TITLE}
      </span>
      <span className="col-start-1 row-start-1" aria-hidden="true">
        <span className={reduceMotion ? "" : "border-r-2 border-[#A75E37] motion-safe:animate-pulse"}>
          {reduceMotion ? TITLE : TITLE.slice(0, visibleLength)}
        </span>
      </span>
    </span>
  );
}
