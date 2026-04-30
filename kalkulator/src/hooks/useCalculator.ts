"use client";

import { useState } from "react";
import { calculate, type Operator } from "@/lib/calculate";

const MAX_DIGITS = 5;

export function useCalculator() {
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);

  function inputNumber(num: string) {
    if (waitingForNext) {
      setDisplay(num);
      setWaitingForNext(false);
      return;
    }
    if (display.replace("-", "").length >= MAX_DIGITS) return;
    setDisplay(display === "0" ? num : display + num);
  }

  function chooseOperator(op: Operator) {
    const current = parseFloat(display);

    if (previous === null) {
      setPrevious(current);
    } else if (operator) {
      const result = calculate(previous, current, operator);
      setDisplay(String(result));
      setPrevious(result);
    }

    setOperator(op);
    setWaitingForNext(true);
  }

  function handleEquals() {
    const current = parseFloat(display);
    if (previous !== null && operator) {
      const result = calculate(previous, current, operator);
      setDisplay(String(result));
      setPrevious(null);
      setOperator(null);
      setWaitingForNext(true);
    }
  }

  function clear() {
    setDisplay("0");
    setPrevious(null);
    setOperator(null);
    setWaitingForNext(false);
  }

  return {
    display,
    previous,
    operator,
    inputNumber,
    chooseOperator,
    handleEquals,
    clear,
  };
}
