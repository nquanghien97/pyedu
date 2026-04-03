'use client';

import { useState, useRef, useEffect } from 'react';

export default function StepCard({
  step,
  icon,
  title,
  description,
  delay,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center text-center"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center shadow-lg shadow-[#3b82f6]/30">
          <div className="text-white">{icon}</div>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-sm font-bold text-[#3b82f6] border-2 border-[#3b82f6]">
          {step}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}