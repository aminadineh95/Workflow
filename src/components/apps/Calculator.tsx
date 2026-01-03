import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Delete, Divide, Equal, Minus, Plus, X, RotateCcw, Percent } from 'lucide-react';

type CalculatorMode = 'basic' | 'scientific';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [mode, setMode] = useState<CalculatorMode>('basic');
  const [hasResult, setHasResult] = useState(false);

  const handleNumber = (num: string) => {
    if (hasResult) {
      setDisplay(num);
      setEquation('');
      setHasResult(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
    setHasResult(false);
  };

  const handleEquals = () => {
    try {
      const expression = equation + display;
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');
      const result = eval(sanitized);
      setDisplay(String(result));
      setEquation('');
      setHasResult(true);
    } catch {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setHasResult(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const handleNegate = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleScientific = (func: string) => {
    const num = parseFloat(display);
    let result: number;
    
    switch (func) {
      case 'sin':
        result = Math.sin(num * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(num * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(num * Math.PI / 180);
        break;
      case 'sqrt':
        result = Math.sqrt(num);
        break;
      case 'pow2':
        result = Math.pow(num, 2);
        break;
      case 'log':
        result = Math.log10(num);
        break;
      case 'ln':
        result = Math.log(num);
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      case 'abs':
        result = Math.abs(num);
        break;
      case 'factorial':
        result = factorial(num);
        break;
      default:
        result = num;
    }
    
    setDisplay(String(result));
    setHasResult(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const basicButtons = [
    { label: '%', action: handlePercent, className: 'bg-secondary/50' },
    { label: 'CE', action: handleClear, className: 'bg-secondary/50' },
    { label: 'C', action: handleClear, className: 'bg-secondary/50' },
    { label: '⌫', action: handleBackspace, className: 'bg-secondary/50' },
    { label: '1/x', action: () => setDisplay(String(1 / parseFloat(display))), className: 'bg-secondary/50' },
    { label: 'x²', action: () => handleScientific('pow2'), className: 'bg-secondary/50' },
    { label: '√', action: () => handleScientific('sqrt'), className: 'bg-secondary/50' },
    { label: '÷', action: () => handleOperator('÷'), className: 'bg-secondary/50' },
    { label: '7', action: () => handleNumber('7') },
    { label: '8', action: () => handleNumber('8') },
    { label: '9', action: () => handleNumber('9') },
    { label: '×', action: () => handleOperator('×'), className: 'bg-secondary/50' },
    { label: '4', action: () => handleNumber('4') },
    { label: '5', action: () => handleNumber('5') },
    { label: '6', action: () => handleNumber('6') },
    { label: '−', action: () => handleOperator('−'), className: 'bg-secondary/50' },
    { label: '1', action: () => handleNumber('1') },
    { label: '2', action: () => handleNumber('2') },
    { label: '3', action: () => handleNumber('3') },
    { label: '+', action: () => handleOperator('+'), className: 'bg-secondary/50' },
    { label: '±', action: handleNegate },
    { label: '0', action: () => handleNumber('0') },
    { label: '.', action: handleDecimal },
    { label: '=', action: handleEquals, className: 'bg-primary text-primary-foreground hover:bg-primary/90' },
  ];

  const scientificButtons = [
    { label: 'sin', action: () => handleScientific('sin') },
    { label: 'cos', action: () => handleScientific('cos') },
    { label: 'tan', action: () => handleScientific('tan') },
    { label: 'log', action: () => handleScientific('log') },
    { label: 'ln', action: () => handleScientific('ln') },
    { label: 'π', action: () => handleScientific('pi') },
    { label: 'e', action: () => handleScientific('e') },
    { label: '|x|', action: () => handleScientific('abs') },
    { label: 'n!', action: () => handleScientific('factorial') },
  ];

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <button
          onClick={() => setMode('basic')}
          className={cn(
            "px-3 py-1 text-sm rounded-md transition-colors",
            mode === 'basic' ? "bg-primary/10 text-primary" : "hover:bg-secondary"
          )}
        >
          Standard
        </button>
        <button
          onClick={() => setMode('scientific')}
          className={cn(
            "px-3 py-1 text-sm rounded-md transition-colors",
            mode === 'scientific' ? "bg-primary/10 text-primary" : "hover:bg-secondary"
          )}
        >
          Scientific
        </button>
      </div>

      {/* Display */}
      <div className="p-4 text-right">
        <div className="text-sm text-muted-foreground h-5 truncate">{equation}</div>
        <div className="text-4xl font-light truncate">{display}</div>
      </div>

      {/* Scientific Buttons */}
      {mode === 'scientific' && (
        <div className="grid grid-cols-5 gap-1 px-2 pb-2">
          {scientificButtons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className="py-2 text-sm rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Basic Buttons */}
      <div className="flex-1 grid grid-cols-4 gap-1 p-2">
        {basicButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={cn(
              "flex items-center justify-center text-lg rounded-md hover:bg-secondary/70 transition-colors",
              btn.className || "bg-card hover:bg-secondary/50"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
