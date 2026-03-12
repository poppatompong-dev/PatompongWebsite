"use client";

import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
}

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    let totalMilSecDur = 1000;
    let incrementTime = (totalMilSecDur / end) * 2;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}