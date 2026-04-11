'use client'

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

type RevealOptions = {
  selector?: string;
  y?: number;
  delay?: number;
  duration?: number;
  stagger?: number;
};

export function useGsapReveal<T extends HTMLElement>(
  options?: RevealOptions,
): RefObject<T | null> {
  const scopeRef = useRef<T | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const selector = options?.selector ?? "[data-reveal]";
  const y = options?.y ?? 20;
  const delay = options?.delay ?? 0;
  const duration = options?.duration ?? 0.8;
  const stagger = options?.stagger ?? 0.1;

  useEffect(() => {
    if (!scopeRef.current || prefersReducedMotion) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        selector,
        {
          opacity: 0,
          y,
        },
        {
          opacity: 1,
          y: 0,
          delay,
          duration,
          stagger,
          ease: "power3.out",
          clearProps: "transform",
        },
      );
    }, scopeRef);

    return () => {
      context.revert();
    };
  }, [delay, duration, prefersReducedMotion, selector, stagger, y]);

  return scopeRef;
}
