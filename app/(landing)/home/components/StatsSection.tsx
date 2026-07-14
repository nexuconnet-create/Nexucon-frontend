"use client";

import React, { useEffect, useState, useRef } from "react";

function CountUp({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  formatting = true,
}: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  formatting?: boolean;
}) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationTriggered = useRef(false);

  useEffect(() => {
    const currentRef = elementRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animationTriggered.current) {
          animationTriggered.current = true;
          observer.unobserve(currentRef);

          let startTime: number | null = null;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            setCount(Math.floor(easeProgress * end));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [end, duration]);

  const displayValue = formatting ? count.toLocaleString() : count.toString();

  return (
    <span ref={elementRef} className="inline-block min-w-[2ch]">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

import { motion } from "framer-motion";

export default function StatsSection() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="w-full bg-[#022C4F] text-[#ffffff] py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <CountUp end={5000} suffix="+" />
          </h3>
          <p className="text-xs font-semibold tracking-widest capitalize text-[#ffffff]/80 mt-2">
            Verified Professionals
          </p>
        </div>
        <div>
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <CountUp end={2} suffix="B+" formatting={false} duration={1500} />
          </h3>
          <p className="text-xs font-semibold tracking-widest capitalize text-[#ffffff]/80 mt-2">
            Managed Project Value
          </p>
        </div>
        <div>
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <CountUp end={88} suffix="%" formatting={false} />
          </h3>
          <p className="text-xs font-semibold tracking-widest capitalize text-[#ffffff]/80 mt-2">
            Client Satisfaction Rate
          </p>
        </div>
      </div>
    </motion.section>
  );
}
