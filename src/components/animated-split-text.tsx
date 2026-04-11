'use client'

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

type AnimatedSplitTextProps = {
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
  delay?: number;
  mode?: "words" | "chars";
  text: string;
};

export default function AnimatedSplitText({
  as = "span",
  className,
  delay = 0,
  mode = "words",
  text,
}: AnimatedSplitTextProps) {
  const textRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const segments =
    mode === "chars" ? Array.from(text) : text.split(" ").filter(Boolean);

  useEffect(() => {
    if (!textRef.current || prefersReducedMotion) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-segment]",
        {
          opacity: 0,
          y: 28,
          rotateX: -80,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          delay,
          stagger: mode === "chars" ? 0.02 : 0.06,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
    }, textRef);

    return () => {
      context.revert();
    };
  }, [delay, mode, prefersReducedMotion, text]);

  const content = (
    <>
      {segments.map((segment, index) => (
        <span
          data-segment
          key={`${segment}-${index}`}
          style={{
            display: "inline-block",
            paddingRight: mode === "words" ? "0.24em" : 0,
            whiteSpace: segment === " " ? "pre" : undefined,
            transformOrigin: "50% 100%",
          }}
        >
          {segment}
        </span>
      ))}
    </>
  );

  if (as === "h1") {
    return (
      <h1 className={className} ref={textRef as React.RefObject<HTMLHeadingElement>}>
        {content}
      </h1>
    );
  }

  if (as === "h2") {
    return (
      <h2 className={className} ref={textRef as React.RefObject<HTMLHeadingElement>}>
        {content}
      </h2>
    );
  }

  if (as === "p") {
    return (
      <p className={className} ref={textRef as React.RefObject<HTMLParagraphElement>}>
        {content}
      </p>
    );
  }

  return (
    <span className={className} ref={textRef as React.RefObject<HTMLSpanElement>}>
      {content}
    </span>
  );
}
