"use client";

import { useCalculator } from "@/hooks/useCalculator";
import Button from "./Button";
import Display from "./Display";

export default function Calculator() {
  const {
    display,
    previous,
    operator,
    inputNumber,
    chooseOperator,
    handleEquals,
    clear,
  } = useCalculator();

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Kalkulator
      </h1>

      <Display value={display} previous={previous} operator={operator} />

      <div className="grid grid-cols-4 gap-3">
        <Button label="AC" variant="clear" onClick={clear} className="col-span-2" />
        <Button label="÷" variant="operator" onClick={() => chooseOperator("/")} />
        <Button label="×" variant="operator" onClick={() => chooseOperator("*")} />

        <Button label="7" onClick={() => inputNumber("7")} />
        <Button label="8" onClick={() => inputNumber("8")} />
        <Button label="9" onClick={() => inputNumber("9")} />
        <Button label="−" variant="operator" onClick={() => chooseOperator("-")} />

        <Button label="4" onClick={() => inputNumber("4")} />
        <Button label="5" onClick={() => inputNumber("5")} />
        <Button label="6" onClick={() => inputNumber("6")} />
        <Button label="+" variant="operator" onClick={() => chooseOperator("+")} />

        <Button label="1" onClick={() => inputNumber("1")} />
        <Button label="2" onClick={() => inputNumber("2")} />
        <Button label="3" onClick={() => inputNumber("3")} />
        <Button label="=" variant="equals" onClick={handleEquals} className="row-span-2" />

        <Button label="0" onClick={() => inputNumber("0")} className="col-span-3" />
      </div>
    </div>
  );
}
