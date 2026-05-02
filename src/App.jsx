import { useState, useEffect, useRef } from "react";

// ── KaTeX via CDN ──────────────────────────────────────────
function useKatex() {
  const [ready, setReady] = useState(!!window.katex);
  useEffect(() => {
    if (window.katex) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);
  return ready;
}

function Tex({ src, display = false }) {
  const ref = useRef(null);
  const ready = useKatex();
  useEffect(() => {
    if (!ready || !ref.current) return;
    try {
      window.katex.render(src, ref.current, { displayMode: display, throwOnError: false });
    } catch (e) {}
  }, [src, display, ready]);
  return <span ref={ref} style={display ? { display: "block", overflowX: "auto" } : {}} />;
}

// Render a line with mixed text + \(...\) inline math
function MixedLine({ text }) {
  const parts = text.split(/(\\\([\s\S]*?\\\))/g);
  return (
    <span>
      {parts.map((p, i) => {
        if (p.startsWith("\\(") && p.endsWith("\\)")) {
          return <Tex key={i} src={p.slice(2, -2).trim()} />;
        }
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

function Steps({ text }) {
  const lines = text.split("\n").filter(l => l.trim());
  return (
    <div style={{ fontSize: "0.92rem", lineHeight: 1.8 }}>
      {lines.map((line, i) => (
        <div key={i} style={{ marginBottom: "0.3rem" }}>
          <MixedLine text={line} />
        </div>
      ))}
    </div>
  );
}

// ── PROBLEM DATA ──────────────────────────────────────────
const PROBLEMS = {
  basic: {
    icon: "📐", title: "Basic Integration Rules",
    desc: "Power rule, exponentials, basic trig, and definite integrals — the foundation of every BC problem.",
    formulae: [
      "\\int x^n\\,dx = \\tfrac{x^{n+1}}{n+1}+C",
      "\\int e^x\\,dx = e^x+C",
      "\\int \\tfrac{1}{x}\\,dx = \\ln|x|+C",
      "\\int \\sin x\\,dx = -\\cos x+C",
      "\\int \\cos x\\,dx = \\sin x+C",
    ],
    problems: [
      { q: "\\int (t^2 + 1 + \\tfrac{1}{t^2+1})\\,dt", diff: "easy", steps: "Split into three integrals: \\(\\int t^2\\,dt + \\int 1\\,dt + \\int \\frac{1}{t^2+1}\\,dt\\).\nApply the power rule to the first two and the arctan formula to the third.", ans: "\\dfrac{t^3}{3} + t + \\arctan t + C" },
      { q: "\\int_1^2 \\!\\left(x^2 - \\dfrac{2}{x}\\right)dx", diff: "easy", steps: "Antiderivative: \\(\\frac{x^3}{3} - 2\\ln|x|\\).\nEvaluate at 2: \\(\\frac{8}{3}-2\\ln 2\\). Evaluate at 1: \\(\\frac{1}{3}-0\\).\nSubtract: \\(\\frac{8}{3}-\\frac{1}{3}-2\\ln 2\\).", ans: "\\dfrac{7}{3} - 2\\ln 2" },
      { q: "\\int (2^x + x^2)\\,dx", diff: "easy", steps: "For \\(2^x\\): \\(\\int 2^x\\,dx = \\tfrac{2^x}{\\ln 2}\\). For \\(x^2\\): power rule gives \\(\\tfrac{x^3}{3}\\).", ans: "\\dfrac{2^x}{\\ln 2} + \\dfrac{x^3}{3} + C" },
      { q: "\\int \\frac{x^3+5x-2}{\\sqrt{x}}\\,dx", diff: "med", steps: "Divide each term by \\(x^{1/2}\\): \\(x^{5/2}+5x^{1/2}-2x^{-1/2}\\).\nApply the power rule term-by-term.", ans: "\\dfrac{2x^{7/2}}{7} + \\dfrac{10x^{3/2}}{3} - 4x^{1/2} + C" },
      { q: "\\int_0^{\\pi/3}\\sec^2(2x)\\,dx", diff: "med", steps: "Antiderivative of \\(\\sec^2(2x)\\) is \\(\\tfrac{1}{2}\\tan(2x)\\) (chain rule factor of \\(\\tfrac{1}{2}\\)).\nEvaluate from 0 to \\(\\pi/3\\): \\(\\frac{1}{2}[\\tan(2\\pi/3)-\\tan(0)] = \\frac{1}{2}(-\\sqrt{3}-0)\\).", ans: "-\\dfrac{\\sqrt{3}}{2}" },
      { q: "\\int_0^{\\pi/4}\\frac{1+\\cos^2\\theta}{\\cos^2\\theta}\\,d\\theta", diff: "med", steps: "Split: \\(\\int_0^{\\pi/4}\\sec^2\\theta\\,d\\theta + \\int_0^{\\pi/4}1\\,d\\theta\\).\nAntiderivatives: \\([\\tan\\theta + \\theta]_0^{\\pi/4} = 1+\\tfrac{\\pi}{4}\\).", ans: "1 + \\dfrac{\\pi}{4}" },
      { q: "\\int_0^{\\sqrt{2}/2}\\frac{2}{\\sqrt{1-x^2}}\\,dx", diff: "easy", steps: "Recognize \\(\\int \\frac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x\\).\nEvaluate: \\(2[\\arcsin x]_0^{\\sqrt{2}/2} = 2(\\tfrac{\\pi}{4}-0)\\).", ans: "\\dfrac{\\pi}{2}" },
      { q: "\\int \\!\\left(\\sqrt{3}+e^{2t}-\\cos(5t)\\right)dt", diff: "easy", steps: "Three separate antiderivatives: \\(\\sqrt{3}\\,t\\), \\(\\tfrac{e^{2t}}{2}\\) (chain rule), \\(-\\tfrac{\\sin(5t)}{5}\\) (chain rule).", ans: "\\sqrt{3}\\,t + \\dfrac{e^{2t}}{2} - \\dfrac{\\sin(5t)}{5} + C" },
    ]
  },
  usub: {
    icon: "🔄", title: "u-Substitution",
    desc: "Reverse the chain rule. Let u equal the inside function, find du, rewrite, integrate, back-substitute.",
    formulae: ["u = g(x),\\quad du = g'(x)\\,dx", "\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du"],
    problems: [
      { q: "\\int x\\,e^{x^2}\\,dx", diff: "easy", steps: "Let \\(u=x^2\\), so \\(du=2x\\,dx\\Rightarrow x\\,dx=\\tfrac{du}{2}\\).\nIntegral becomes \\(\\tfrac{1}{2}\\int e^u\\,du = \\tfrac{1}{2}e^u\\). Back-sub: \\(u=x^2\\).", ans: "\\dfrac{1}{2}e^{x^2}+C" },
      { q: "\\int \\frac{\\ln x}{x}\\,dx", diff: "easy", steps: "Let \\(u=\\ln x\\), so \\(du=\\tfrac{1}{x}\\,dx\\).\nIntegral: \\(\\int u\\,du = \\tfrac{u^2}{2}\\). Back-sub.", ans: "\\dfrac{(\\ln x)^2}{2}+C" },
      { q: "\\int \\frac{e^x}{1+e^{2x}}\\,dx", diff: "med", steps: "Let \\(u=e^x\\), \\(du=e^x\\,dx\\).\nIntegral becomes \\(\\int\\frac{du}{1+u^2} = \\arctan u\\). Back-sub.", ans: "\\arctan(e^x)+C" },
      { q: "\\int \\sin^5 x\\cos x\\,dx", diff: "easy", steps: "Let \\(u=\\sin x\\), \\(du=\\cos x\\,dx\\).\nIntegral: \\(\\int u^5\\,du = \\tfrac{u^6}{6}\\). Back-sub.", ans: "\\dfrac{\\sin^6 x}{6}+C" },
      { q: "\\int_0^1 x\\sqrt{1+x^2}\\,dx", diff: "med", steps: "Let \\(u=1+x^2\\), \\(du=2x\\,dx\\). Limits: \\(u(0)=1\\), \\(u(1)=2\\).\n\\(\\tfrac{1}{2}\\int_1^2 u^{1/2}\\,du = \\tfrac{1}{3}(2^{3/2}-1)\\).", ans: "\\dfrac{2\\sqrt{2}-1}{3}" },
      { q: "\\int \\frac{2x+3}{x^2+3x+7}\\,dx", diff: "med", steps: "Note the numerator \\(2x+3\\) is the derivative of \\(x^2+3x+7\\).\nLet \\(u=x^2+3x+7\\), \\(du=(2x+3)\\,dx\\).\nIntegral: \\(\\int\\frac{du}{u}=\\ln|u|\\). Back-sub.", ans: "\\ln|x^2+3x+7|+C" },
      { q: "\\int \\tan x\\,dx", diff: "easy", steps: "Write as \\(\\int\\frac{\\sin x}{\\cos x}\\,dx\\). Let \\(u=\\cos x\\), \\(du=-\\sin x\\,dx\\).\nIntegral: \\(-\\int\\frac{du}{u}=-\\ln|u|\\). Back-sub.", ans: "\\ln|\\sec x|+C" },
      { q: "\\int \\frac{dx}{x\\ln x}", diff: "med", steps: "Let \\(u=\\ln x\\), \\(du=\\tfrac{dx}{x}\\).\nIntegral becomes \\(\\int\\frac{du}{u}=\\ln|u|\\). Back-sub.", ans: "\\ln|\\ln x|+C" },
    ]
  },
  parts: {
    icon: "✂️", title: "Integration by Parts",
    desc: "Reverse the product rule. LIATE: Logarithms, Inverse trig, Algebraic, Trig, Exponential.",
    formulae: ["\\int u\\,dv = uv - \\int v\\,du"],
    problems: [
      { q: "\\int x\\,e^x\\,dx", diff: "easy", steps: "LIATE: let \\(u=x\\), \\(dv=e^x\\,dx\\Rightarrow du=dx\\), \\(v=e^x\\).\n\\(\\int x e^x\\,dx = xe^x - \\int e^x\\,dx = xe^x - e^x\\).", ans: "e^x(x-1)+C" },
      { q: "\\int x\\ln x\\,dx", diff: "easy", steps: "LIATE: \\(u=\\ln x\\), \\(dv=x\\,dx\\Rightarrow du=\\tfrac{1}{x}dx\\), \\(v=\\tfrac{x^2}{2}\\).\n\\(\\tfrac{x^2}{2}\\ln x - \\int\\tfrac{x^2}{2}\\cdot\\tfrac{1}{x}\\,dx = \\tfrac{x^2}{2}\\ln x - \\tfrac{x^2}{4}\\).", ans: "\\dfrac{x^2}{2}\\ln x - \\dfrac{x^2}{4}+C" },
      { q: "\\int x^2\\sin x\\,dx", diff: "med", steps: "Apply IBP twice. First: \\(u=x^2\\), \\(dv=\\sin x\\,dx\\): gives \\(-x^2\\cos x+2\\int x\\cos x\\,dx\\).\nSecond IBP on \\(\\int x\\cos x\\,dx\\): \\(u=x\\), \\(dv=\\cos x\\,dx\\): gives \\(x\\sin x+\\cos x\\).", ans: "-x^2\\cos x + 2x\\sin x + 2\\cos x+C" },
      { q: "\\int e^x\\sin x\\,dx", diff: "hard", steps: "IBP with \\(u=\\sin x\\), \\(dv=e^x\\,dx\\): \\(e^x\\sin x - \\int e^x\\cos x\\,dx\\).\nIBP again: \\(e^x\\cos x + \\int e^x\\sin x\\,dx\\).\nLet \\(I=\\int e^x\\sin x\\,dx\\): \\(2I = e^x(\\sin x-\\cos x)\\).", ans: "\\dfrac{e^x(\\sin x - \\cos x)}{2}+C" },
      { q: "\\int \\arctan x\\,dx", diff: "med", steps: "\\(u=\\arctan x\\), \\(dv=dx\\Rightarrow du=\\tfrac{dx}{1+x^2}\\), \\(v=x\\).\n\\(x\\arctan x - \\int\\tfrac{x}{1+x^2}\\,dx\\). Let \\(w=1+x^2\\): gives \\(\\tfrac{1}{2}\\ln(1+x^2)\\).", ans: "x\\arctan x - \\dfrac{\\ln(1+x^2)}{2}+C" },
      { q: "\\int x^2 e^x\\,dx", diff: "med", steps: "Tabular IBP. Derivatives: \\(x^2, 2x, 2, 0\\). Integrals: \\(e^x, e^x, e^x, e^x\\).\nSum with alternating signs: \\(x^2e^x - 2xe^x + 2e^x\\).", ans: "e^x(x^2-2x+2)+C" },
      { q: "\\int \\ln x\\,dx", diff: "easy", steps: "\\(u=\\ln x\\), \\(dv=dx\\Rightarrow du=\\tfrac{dx}{x}\\), \\(v=x\\).\n\\(x\\ln x - \\int x\\cdot\\tfrac{1}{x}\\,dx = x\\ln x - x\\).", ans: "x\\ln x - x + C" },
      { q: "\\int_1^e x^3\\ln x\\,dx", diff: "hard", steps: "\\(u=\\ln x\\), \\(dv=x^3\\,dx\\Rightarrow v=\\tfrac{x^4}{4}\\).\n\\(\\left[\\tfrac{x^4}{4}\\ln x\\right]_1^e - \\int_1^e\\tfrac{x^3}{4}\\,dx = \\tfrac{e^4}{4} - \\tfrac{e^4-1}{16}\\).", ans: "\\dfrac{3e^4+1}{16}" },
    ]
  },
  trig: {
    icon: "🌊", title: "Trig Integrals",
    desc: "Products and powers of sine, cosine, secant, tangent. Lean on Pythagorean and half-angle identities.",
    formulae: ["\\sin^2\\!x = \\tfrac{1-\\cos 2x}{2}", "\\cos^2\\!x = \\tfrac{1+\\cos 2x}{2}", "\\tan^2\\!x+1=\\sec^2\\!x"],
    problems: [
      { q: "\\int \\sin^2 x\\,dx", diff: "easy", steps: "Use \\(\\sin^2 x = \\tfrac{1-\\cos 2x}{2}\\).\n\\(\\int\\tfrac{1-\\cos 2x}{2}\\,dx = \\tfrac{x}{2} - \\tfrac{\\sin 2x}{4}\\).", ans: "\\dfrac{x}{2} - \\dfrac{\\sin 2x}{4}+C" },
      { q: "\\int \\sin^3 x\\,dx", diff: "med", steps: "Write \\(\\sin^3 x = \\sin x(1-\\cos^2 x)\\).\n\\(\\int\\sin x\\,dx - \\int\\sin x\\cos^2 x\\,dx\\). Let \\(u=\\cos x\\) for second integral.", ans: "-\\cos x + \\dfrac{\\cos^3 x}{3}+C" },
      { q: "\\int \\sin^2 x\\cos^2 x\\,dx", diff: "med", steps: "Use \\(\\sin^2 x\\cos^2 x = \\tfrac{\\sin^2 2x}{4} = \\tfrac{1-\\cos 4x}{8}\\).\nIntegrate term by term.", ans: "\\dfrac{x}{8} - \\dfrac{\\sin 4x}{32}+C" },
      { q: "\\int \\tan^2 x\\,dx", diff: "easy", steps: "Use \\(\\tan^2 x = \\sec^2 x - 1\\).\n\\(\\int(\\sec^2 x-1)\\,dx = \\tan x - x\\).", ans: "\\tan x - x+C" },
      { q: "\\int \\sec^3 x\\,dx", diff: "hard", steps: "IBP: \\(u=\\sec x\\), \\(dv=\\sec^2 x\\,dx\\): \\(\\sec x\\tan x - \\int\\sec x\\tan^2 x\\,dx\\).\nReplace \\(\\tan^2 x=\\sec^2 x-1\\): \\(I = \\sec x\\tan x - I + \\int\\sec x\\,dx\\).\n\\(2I = \\sec x\\tan x + \\ln|\\sec x+\\tan x|\\).", ans: "\\dfrac{\\sec x\\tan x + \\ln|\\sec x+\\tan x|}{2}+C" },
      { q: "\\int_0^{\\pi/2}\\sin^2 x\\cos^2 x\\,dx", diff: "med", steps: "Using \\(\\sin^2 x\\cos^2 x = \\tfrac{1-\\cos 4x}{8}\\): \\(\\tfrac{1}{8}\\left[x-\\tfrac{\\sin 4x}{4}\\right]_0^{\\pi/2}\\).\n\\(=\\tfrac{1}{8}\\cdot\\tfrac{\\pi}{2} = \\tfrac{\\pi}{16}\\).", ans: "\\dfrac{\\pi}{16}" },
      { q: "\\int \\cos^4 x\\,dx", diff: "hard", steps: "Use \\(\\cos^2 x = \\tfrac{1+\\cos 2x}{2}\\) twice: \\(\\cos^4 x = \\tfrac{3+4\\cos 2x+\\cos 4x}{8}\\).\nIntegrate term by term.", ans: "\\dfrac{3x}{8}+\\dfrac{\\sin 2x}{4}+\\dfrac{\\sin 4x}{32}+C" },
    ]
  },
  trigsub: {
    icon: "📐", title: "Trig Substitution",
    desc: "Eliminate radicals by substituting a trig function for x.",
    formulae: ["\\sqrt{a^2-x^2}\\Rightarrow x=a\\sin\\theta", "\\sqrt{a^2+x^2}\\Rightarrow x=a\\tan\\theta", "\\sqrt{x^2-a^2}\\Rightarrow x=a\\sec\\theta"],
    problems: [
      { q: "\\int \\frac{dx}{\\sqrt{1-x^2}}", diff: "easy", steps: "Let \\(x=\\sin\\theta\\), \\(dx=\\cos\\theta\\,d\\theta\\), \\(\\sqrt{1-x^2}=\\cos\\theta\\).\nIntegral: \\(\\int d\\theta=\\theta=\\arcsin x\\).", ans: "\\arcsin x+C" },
      { q: "\\int \\sqrt{4-x^2}\\,dx", diff: "med", steps: "Let \\(x=2\\sin\\theta\\), \\(dx=2\\cos\\theta\\,d\\theta\\), \\(\\sqrt{4-x^2}=2\\cos\\theta\\).\n\\(\\int 4\\cos^2\\theta\\,d\\theta = 2\\theta+\\sin 2\\theta\\).\nBack-sub: \\(\\theta=\\arcsin\\tfrac{x}{2}\\), \\(\\sin 2\\theta=\\tfrac{x\\sqrt{4-x^2}}{2}\\).", ans: "\\dfrac{x\\sqrt{4-x^2}}{2}+2\\arcsin\\dfrac{x}{2}+C" },
      { q: "\\int \\frac{dx}{x^2\\sqrt{x^2+9}}", diff: "hard", steps: "Let \\(x=3\\tan\\theta\\), \\(\\sqrt{x^2+9}=3\\sec\\theta\\).\nIntegral simplifies to \\(\\tfrac{1}{9}\\int\\csc\\theta\\cot\\theta\\,d\\theta=-\\tfrac{\\csc\\theta}{9}\\).\nBack-sub: \\(\\csc\\theta=\\tfrac{\\sqrt{x^2+9}}{x}\\).", ans: "-\\dfrac{\\sqrt{x^2+9}}{9x}+C" },
      { q: "\\int \\frac{dx}{(1+x^2)^2}", diff: "hard", steps: "Let \\(x=\\tan\\theta\\), \\(dx=\\sec^2\\theta\\,d\\theta\\), \\((1+x^2)^2=\\sec^4\\theta\\).\n\\(\\int\\cos^2\\theta\\,d\\theta=\\tfrac{\\theta}{2}+\\tfrac{\\sin 2\\theta}{4}\\).\nBack-sub: \\(\\theta=\\arctan x\\), \\(\\sin 2\\theta=\\tfrac{2x}{1+x^2}\\).", ans: "\\dfrac{\\arctan x}{2}+\\dfrac{x}{2(1+x^2)}+C" },
      { q: "\\int_0^3 \\frac{dx}{\\sqrt{x^2+9}}", diff: "med", steps: "Let \\(x=3\\tan\\theta\\): integral becomes \\(\\int\\sec\\theta\\,d\\theta=\\ln|\\sec\\theta+\\tan\\theta|\\).\nLimits: \\(\\theta: 0\\to\\pi/4\\). Evaluate: \\(\\ln(\\sqrt{2}+1)\\).", ans: "\\ln(\\sqrt{2}+1)" },
      { q: "\\int \\frac{x^2}{\\sqrt{x^2-25}}\\,dx", diff: "hard", steps: "Let \\(x=5\\sec\\theta\\), \\(\\sqrt{x^2-25}=5\\tan\\theta\\).\nReduces to \\(25\\int\\sec^3\\theta-\\sec\\theta\\,d\\theta\\). Use the \\(\\sec^3\\) reduction formula.", ans: "\\dfrac{x\\sqrt{x^2-25}}{2}-\\dfrac{25}{2}\\ln\\left|\\dfrac{x+\\sqrt{x^2-25}}{5}\\right|+C" },
    ]
  },
  partial: {
    icon: "🧩", title: "Partial Fractions",
    desc: "Break a rational function into simpler fractions whose integrals you already know.",
    formulae: ["\\frac{P(x)}{(x-a)(x-b)} = \\frac{A}{x-a}+\\frac{B}{x-b}", "\\int\\frac{1}{x-a}dx = \\ln|x-a|+C"],
    problems: [
      { q: "\\int \\frac{1}{x^2-1}\\,dx", diff: "easy", steps: "Factor: \\((x-1)(x+1)\\). Decompose: \\(\\tfrac{A}{x-1}+\\tfrac{B}{x+1}\\).\n\\(A=\\tfrac{1}{2}\\), \\(B=-\\tfrac{1}{2}\\). Integrate logarithmically.", ans: "\\dfrac{1}{2}\\ln\\left|\\dfrac{x-1}{x+1}\\right|+C" },
      { q: "\\int \\frac{2x+1}{x^2-x-6}\\,dx", diff: "med", steps: "Factor: \\((x-3)(x+2)\\). Decompose: \\(\\tfrac{A}{x-3}+\\tfrac{B}{x+2}\\).\nAt \\(x=3\\): \\(A=\\tfrac{7}{5}\\). At \\(x=-2\\): \\(B=\\tfrac{3}{5}\\).", ans: "\\dfrac{7}{5}\\ln|x-3|+\\dfrac{3}{5}\\ln|x+2|+C" },
      { q: "\\int \\frac{x}{(x+1)(x^2+1)}\\,dx", diff: "hard", steps: "Decompose: \\(\\tfrac{A}{x+1}+\\tfrac{Bx+C}{x^2+1}\\).\nMatch coefficients: \\(A=-\\tfrac{1}{2}\\), \\(B=\\tfrac{1}{2}\\), \\(C=\\tfrac{1}{2}\\).\nIntegrate each term separately.", ans: "-\\dfrac{1}{2}\\ln|x+1|+\\dfrac{1}{4}\\ln(x^2+1)+\\dfrac{1}{2}\\arctan x+C" },
      { q: "\\int \\frac{3x^2+x+4}{x^3+4x}\\,dx", diff: "hard", steps: "Factor: \\(x(x^2+4)\\). Decompose: \\(\\tfrac{A}{x}+\\tfrac{Bx+C}{x^2+4}\\).\n\\(A=1\\), \\(B=2\\), \\(C=1\\).\nIntegrate: \\(\\ln|x|+\\ln(x^2+4)+\\tfrac{1}{2}\\arctan\\tfrac{x}{2}\\).", ans: "\\ln|x|+\\ln(x^2+4)+\\dfrac{1}{2}\\arctan\\dfrac{x}{2}+C" },
      { q: "\\int_2^3 \\frac{1}{x^2-1}\\,dx", diff: "med", steps: "Antiderivative is \\(\\tfrac{1}{2}\\ln\\left|\\tfrac{x-1}{x+1}\\right|\\).\nEvaluate: \\(\\tfrac{1}{2}[\\ln\\tfrac{2}{4}-\\ln\\tfrac{1}{3}] = \\tfrac{1}{2}\\ln\\tfrac{3}{2}\\).", ans: "\\dfrac{1}{2}\\ln\\dfrac{3}{2}" },
      { q: "\\int \\frac{x^2}{x^2+x-2}\\,dx", diff: "hard", steps: "Long division first: \\(1-\\tfrac{x-2}{x^2+x-2}\\).\nFactor denominator \\((x+2)(x-1)\\) and decompose.\n\\(A=\\tfrac{4}{3}\\), \\(B=-\\tfrac{1}{3}\\).", ans: "x+\\dfrac{4}{3}\\ln|x+2|-\\dfrac{1}{3}\\ln|x-1|+C" },
    ]
  },
  improper: {
    icon: "∞", title: "Improper Integrals",
    desc: "Infinite limits or discontinuous integrands — replace the bad endpoint with a limit.",
    formulae: ["\\int_a^\\infty f\\,dx = \\lim_{t\\to\\infty}\\int_a^t f\\,dx", "\\int_1^\\infty x^{-p}dx\\text{ converges iff }p>1"],
    problems: [
      { q: "\\int_1^\\infty \\frac{1}{x^2}\\,dx", diff: "easy", steps: "\\(\\lim_{t\\to\\infty}\\left[-\\tfrac{1}{x}\\right]_1^t = \\lim_{t\\to\\infty}\\left(-\\tfrac{1}{t}+1\\right) = 1\\). Converges.", ans: "1" },
      { q: "\\int_1^\\infty \\frac{1}{x}\\,dx", diff: "easy", steps: "\\(\\lim_{t\\to\\infty}[\\ln x]_1^t = \\lim_{t\\to\\infty}\\ln t = \\infty\\). Diverges.", ans: "\\text{Diverges}" },
      { q: "\\int_0^\\infty e^{-2x}\\,dx", diff: "easy", steps: "\\(\\lim_{t\\to\\infty}\\left[-\\tfrac{e^{-2x}}{2}\\right]_0^t = 0+\\tfrac{1}{2}\\). Converges.", ans: "\\dfrac{1}{2}" },
      { q: "\\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx", diff: "med", steps: "Discontinuity at \\(x=0\\). \\(\\lim_{a\\to 0^+}\\left[2\\sqrt{x}\\right]_a^1 = 2-0 = 2\\). Converges.", ans: "2" },
      { q: "\\int_{-\\infty}^{\\infty} \\frac{1}{1+x^2}\\,dx", diff: "med", steps: "Split at 0. Each half: \\(\\lim_{t\\to\\infty}[\\arctan x]_0^t = \\tfrac{\\pi}{2}\\).\nTotal: \\(\\pi\\). Converges.", ans: "\\pi" },
      { q: "\\int_0^\\infty x\\,e^{-x}\\,dx", diff: "med", steps: "IBP: \\(u=x\\), \\(dv=e^{-x}\\,dx\\): \\(\\left[-xe^{-x}\\right]_0^\\infty+\\int_0^\\infty e^{-x}\\,dx\\).\nFirst term \\(\\to 0\\). Second: \\(1\\). Converges.", ans: "1" },
      { q: "\\int_1^\\infty \\frac{\\ln x}{x^2}\\,dx", diff: "hard", steps: "IBP: \\(u=\\ln x\\), \\(dv=x^{-2}\\,dx\\): \\(\\left[-\\tfrac{\\ln x}{x}\\right]_1^\\infty+\\int_1^\\infty x^{-2}\\,dx\\).\nFirst term \\(\\to 0\\). Second: \\(1\\).", ans: "1" },
      { q: "\\int_2^\\infty \\frac{1}{x(\\ln x)^2}\\,dx", diff: "hard", steps: "Let \\(u=\\ln x\\), \\(du=\\tfrac{dx}{x}\\). Limits: \\(\\ln 2\\to\\infty\\).\n\\(\\int_{\\ln 2}^\\infty u^{-2}\\,du = \\tfrac{1}{\\ln 2}\\). Converges.", ans: "\\dfrac{1}{\\ln 2}" },
    ]
  },
};

const SECTION_KEYS = ["basic","usub","parts","trig","trigsub","partial","improper"];
const NAV_LABELS = { basic:"Basic Rules", usub:"u-Sub", parts:"By Parts", trig:"Trig Integrals", trigsub:"Trig Sub", partial:"Partial Fractions", improper:"Improper" };
const DIFF_STYLE = { easy: { bg:"#d5f0dc", color:"#1e7a40", label:"Easy" }, med: { bg:"#fdebd0", color:"#b7571a", label:"Medium" }, hard: { bg:"#fadbd8", color:"#c0392b", label:"Hard" } };

// ── AI CHECKER ────────────────────────────────────────────
async function checkWithAI(problem, studentAnswer) {
  const system = `You are a calculus grader. Decide if the student's answer is mathematically equivalent to the correct answer.
Allow: different-but-equal forms, missing/present +C on indefinite integrals, different notation (arctan vs atan, sqrt(x) vs x^(1/2), ln|x| vs ln(x)).
Respond ONLY with raw JSON, no markdown: {"correct":true/false,"feedback":"one sentence","hint":"short hint or null"}`;

  const user = `Integral: ${problem.q}\nCorrect answer: ${problem.ans}\nStudent answer: ${studentAnswer}\nIs it correct?`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": window.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text = data.content?.map(c => c.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ── PROBLEM CARD ──────────────────────────────────────────
function ProblemCard({ prob, idx, sectionKey, onScore }) {
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [feedback, setFeedback] = useState(null); // null | {correct,feedback,hint} | "loading" | "error"
  const [showSol, setShowSol] = useState(false);
  const katexReady = useKatex();

  const handleInput = (val) => {
    setInput(val);
    if (!val.trim() || !katexReady) { setPreview(null); return; }
    try {
      const html = window.katex.renderToString(val, { displayMode: true, throwOnError: true });
      setPreview(html);
    } catch { setPreview(null); }
  };

  const handleCheck = async () => {
    if (!input.trim() || feedback === "loading") return;
    setFeedback("loading");
    try {
      const result = await checkWithAI(prob, input.trim());
      setFeedback(result);
      onScore(sectionKey, idx, result.correct ? "got" : "not");
    } catch (e) {
      setFeedback({ error: e.message });
    }
  };

  const d = DIFF_STYLE[prob.diff];

  return (
    <div style={{ background:"#faf8f3", border:"1.5px solid #c8bfaa", borderRadius:10, overflow:"hidden", transition:"box-shadow .2s" }}>
      {/* Question row */}
      <div style={{ padding:"1rem 1.4rem .6rem", display:"flex", alignItems:"center", gap:"1rem" }}>
        <span style={{ fontFamily:"monospace", fontSize:".7rem", color:"#7a7060", minWidth:"1.8rem" }}>
          {String(idx+1).padStart(2,"0")}
        </span>
        <div style={{ flex:1, overflowX:"auto" }}>
          <Tex src={prob.q} display />
        </div>
        <span style={{ fontSize:".65rem", fontFamily:"monospace", padding:".2rem .55rem", borderRadius:4, background:d.bg, color:d.color, letterSpacing:".08em", textTransform:"uppercase", flexShrink:0 }}>
          {d.label}
        </span>
      </div>

      {/* Input area */}
      <div style={{ padding:"0 1.4rem .8rem" }}>
        <div style={{ display:"flex", gap:".5rem" }}>
          <input
            value={input}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCheck()}
            placeholder="Type your answer, e.g.  (1/2)e^(x^2) + C"
            disabled={feedback === "loading"}
            style={{
              flex:1, border:`1.5px solid ${feedback?.correct===true?"#1e8449":feedback?.correct===false?"#c0392b":"#c8bfaa"}`,
              borderRadius:7, padding:".55rem .85rem", fontFamily:"monospace", fontSize:".86rem",
              background:"#f5f1e8", color:"#0f0e0c", outline:"none",
              boxShadow: feedback?.correct===true?"0 0 0 3px rgba(30,132,73,.12)":feedback?.correct===false?"0 0 0 3px rgba(192,57,43,.10)":"none"
            }}
          />
          <button
            onClick={handleCheck}
            disabled={feedback === "loading" || !input.trim()}
            style={{
              background:"#0f0e0c", color:"#f5f1e8", border:"none", borderRadius:7,
              padding:".55rem 1.1rem", fontFamily:"monospace", fontSize:".75rem",
              letterSpacing:".08em", textTransform:"uppercase", cursor:"pointer",
              opacity: (feedback==="loading"||!input.trim()) ? .5 : 1
            }}
          >
            {feedback === "loading" ? "…" : "Check"}
          </button>
        </div>

        {/* Live preview */}
        {preview && !feedback && (
          <div
            style={{ marginTop:".4rem", padding:".2rem .4rem", fontSize:".95rem", overflowX:"auto" }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        )}

        {/* Feedback */}
        {feedback && feedback !== "loading" && (
          <div style={{
            marginTop:".5rem", display:"flex", alignItems:"flex-start", gap:".6rem",
            padding:".65rem .9rem", borderRadius:7, fontSize:".86rem", lineHeight:1.5,
            background: feedback.error ? "#fef9e7" : feedback.correct ? "#d5f0dc" : "#fadbd8",
            color: feedback.error ? "#7d6608" : feedback.correct ? "#145a32" : "#7b241c",
          }}>
            <span style={{ fontSize:"1rem", flexShrink:0 }}>
              {feedback.error ? "⚠" : feedback.correct ? "✓" : "✗"}
            </span>
            <div>
              {feedback.error
                ? `Error: ${feedback.error}`
                : <><strong>{feedback.correct ? "Correct! " : "Not quite. "}</strong>{feedback.feedback}</>
              }
              {feedback?.hint && <div style={{ marginTop:".25rem", fontStyle:"italic", opacity:.85 }}>Hint: {feedback.hint}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Solution toggle */}
      <div style={{ padding:"0 1.4rem .9rem", display:"flex", alignItems:"center", gap:".75rem" }}>
        <button
          onClick={() => setShowSol(s => !s)}
          style={{
            background:"none", border:"1.5px solid #c8bfaa", borderRadius:6,
            padding:".4rem .9rem", fontFamily:"monospace", fontSize:".7rem",
            letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer", color:"#7a7060"
          }}
        >
          {showSol ? "Hide solution" : "Show solution"}
        </button>
        {feedback?.correct && (
          <span style={{ color:"#1e8449", fontSize:".75rem", fontFamily:"monospace" }}>✓ solved</span>
        )}
      </div>

      {showSol && (
        <div style={{ background:"#f0ece0", borderTop:"1.5px solid #c8bfaa", padding:"1rem 1.4rem" }}>
          <div style={{ fontFamily:"monospace", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"#7a7060", marginBottom:".5rem" }}>Solution steps</div>
          <Steps text={prob.steps} />
          <div style={{ marginTop:".75rem" }}>
            <div style={{ fontFamily:"monospace", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"#7a7060", marginBottom:".4rem" }}>Answer</div>
            <span style={{ display:"inline-block", background:"#0f0e0c", color:"#f5f1e8", borderRadius:6, padding:".5rem 1rem", overflowX:"auto", maxWidth:"100%" }}>
              <Tex src={prob.ans} display />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SECTION ───────────────────────────────────────────────
function Section({ sectionKey, data, scores, onScore }) {
  const correct = Object.values(scores).filter(v => v === "got").length;
  const total = Object.keys(scores).length;

  const resetScores = () => onScore(sectionKey, null, "reset");

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", gap:"1.25rem", marginBottom:"1.75rem", paddingBottom:"1.25rem", borderBottom:"1.5px solid #c8bfaa" }}>
        <div style={{ fontSize:"2rem", lineHeight:1 }}>{data.icon}</div>
        <div>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:"1.9rem", letterSpacing:"-.02em", lineHeight:1.1 }}>{data.title}</h2>
          <p style={{ fontSize:".9rem", color:"#7a7060", marginTop:".4rem" }}>{data.desc}</p>
        </div>
      </div>

      {/* Formula strip */}
      <div style={{ background:"#0f0e0c", borderRadius:8, padding:".9rem 1.3rem", marginBottom:"1.75rem" }}>
        <div style={{ fontFamily:"monospace", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"#c8bfaa", marginBottom:".5rem" }}>Key Formulas</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem 1.5rem" }}>
          {data.formulae.map((f, i) => (
            <span key={i} style={{ color:"#e8dfc9" }}><Tex src={f} /></span>
          ))}
        </div>
      </div>

      {/* Score bar */}
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", background:"#ede8da", border:"1.5px solid #c8bfaa", borderRadius:8, padding:".7rem 1.2rem", marginBottom:"1.5rem" }}>
        <span style={{ fontFamily:"monospace", fontSize:".75rem", letterSpacing:".1em", textTransform:"uppercase", color:"#7a7060" }}>Score</span>
        <span style={{ fontFamily:"monospace", fontSize:"1.1rem", color:"#c0392b", fontWeight:500 }}>{correct} / {total || data.problems.length}</span>
        <button onClick={resetScores} style={{ marginLeft:"auto", background:"none", border:"1px solid #c8bfaa", borderRadius:4, padding:".28rem .65rem", cursor:"pointer", color:"#7a7060", fontFamily:"monospace", fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase" }}>Reset</button>
      </div>

      {/* Problems */}
      <div style={{ display:"grid", gap:"1rem" }}>
        {data.problems.map((prob, i) => (
          <ProblemCard key={i} prob={prob} idx={i} sectionKey={sectionKey} onScore={onScore} />
        ))}
      </div>
    </div>
  );
}

// ── REFERENCE ─────────────────────────────────────────────
const REF = [
  { title:"Power & Log", items:["\\int x^n\\,dx = \\tfrac{x^{n+1}}{n+1}+C","\\int \\tfrac{1}{x}\\,dx = \\ln|x|+C","\\int e^x\\,dx = e^x+C","\\int a^x\\,dx = \\tfrac{a^x}{\\ln a}+C","\\int \\ln x\\,dx = x\\ln x-x+C"] },
  { title:"Basic Trig", items:["\\int \\sin x\\,dx = -\\cos x+C","\\int \\cos x\\,dx = \\sin x+C","\\int \\sec^2 x\\,dx = \\tan x+C","\\int \\sec x\\tan x\\,dx = \\sec x+C","\\int \\sec x\\,dx = \\ln|\\sec x+\\tan x|+C","\\int \\tan x\\,dx = \\ln|\\sec x|+C"] },
  { title:"Inverse Trig", items:["\\int \\tfrac{1}{\\sqrt{1-x^2}}\\,dx = \\arcsin x+C","\\int \\tfrac{1}{1+x^2}\\,dx = \\arctan x+C"] },
  { title:"By Parts", items:["\\int u\\,dv = uv-\\int v\\,du","\\text{LIATE: Log · Inv-trig · Alg · Trig · Exp}"] },
  { title:"Trig Identities", items:["\\sin^2 x = \\tfrac{1-\\cos 2x}{2}","\\cos^2 x = \\tfrac{1+\\cos 2x}{2}","\\sin 2x = 2\\sin x\\cos x","\\tan^2 x = \\sec^2 x-1"] },
  { title:"Trig Sub", items:["\\sqrt{a^2-x^2}\\Rightarrow x=a\\sin\\theta","\\sqrt{a^2+x^2}\\Rightarrow x=a\\tan\\theta","\\sqrt{x^2-a^2}\\Rightarrow x=a\\sec\\theta"] },
  { title:"Partial Fractions", items:["\\tfrac{P}{(x-a)(x-b)}=\\tfrac{A}{x-a}+\\tfrac{B}{x-b}","\\tfrac{P}{(x-a)^2}=\\tfrac{A}{x-a}+\\tfrac{B}{(x-a)^2}"] },
  { title:"Improper", items:["\\int_1^\\infty x^{-p}dx\\text{ conv. iff }p>1","\\int_0^1 x^{-p}dx\\text{ conv. iff }p<1"] },
];

function Reference() {
  return (
    <div>
      <div style={{ display:"flex", gap:"1.25rem", marginBottom:"1.75rem", paddingBottom:"1.25rem", borderBottom:"1.5px solid #c8bfaa" }}>
        <div style={{ fontSize:"2rem" }}>📋</div>
        <div>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:"1.9rem" }}>Quick Reference Sheet</h2>
          <p style={{ fontSize:".9rem", color:"#7a7060", marginTop:".4rem" }}>All formulas for the BC exam in one place.</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"1rem" }}>
        {REF.map((card, i) => (
          <div key={i} style={{ background:"#faf8f3", border:"1.5px solid #c8bfaa", borderRadius:8, padding:"1rem 1.2rem" }}>
            <div style={{ fontFamily:"monospace", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"#7a7060", marginBottom:".7rem" }}>{card.title}</div>
            {card.items.map((item, j) => (
              <div key={j} style={{ fontSize:".88rem", marginBottom:".35rem", overflowX:"auto" }}>
                <Tex src={item} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("basic");
  const [scores, setScores] = useState(() =>
    Object.fromEntries(SECTION_KEYS.map(k => [k, {}]))
  );

  const handleScore = (sectionKey, idx, result) => {
    if (result === "reset") {
      setScores(s => ({ ...s, [sectionKey]: {} }));
      return;
    }
    setScores(s => ({
      ...s,
      [sectionKey]: { ...s[sectionKey], [idx]: result }
    }));
  };

  const tabs = [...SECTION_KEYS, "ref"];

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#f5f1e8", minHeight:"100vh", color:"#0f0e0c" }}>
      {/* Header */}
      <div style={{ background:"#0f0e0c", color:"#f5f1e8", padding:"2.5rem 2rem 2rem", textAlign:"center" }}>
        <div style={{ fontFamily:"monospace", fontSize:".7rem", letterSpacing:".25em", textTransform:"uppercase", color:"#c8bfaa", marginBottom:".6rem" }}>AP Calculus BC · Integration Methods</div>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"clamp(2rem,6vw,3.5rem)", letterSpacing:"-.02em", margin:0 }}>
          Practice <span style={{ color:"#c0392b" }}>Integrals</span>
        </h1>
        <p style={{ fontSize:".9rem", color:"#c8bfaa", marginTop:".5rem", fontWeight:300 }}>
          Type your answer and get instant AI feedback.
        </p>
      </div>

      {/* Nav */}
      <div style={{ background:"#ede8da", borderBottom:"2px solid #c8bfaa", overflowX:"auto", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(15,14,12,.1)" }}>
        <div style={{ display:"inline-flex", padding:"0 1rem" }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding:".8rem 1.1rem", background:"none", border:"none", borderBottom:`3px solid ${activeTab===tab?"#c0392b":"transparent"}`,
                fontFamily:"monospace", fontSize:".75rem", letterSpacing:".04em", textTransform:"uppercase",
                color: activeTab===tab ? "#c0392b" : "#7a7060", cursor:"pointer", whiteSpace:"nowrap", transition:"color .15s"
              }}
            >
              {tab === "ref" ? "📋 Reference" : NAV_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"2.5rem 1.5rem 5rem" }}>
        {activeTab === "ref"
          ? <Reference />
          : <Section
              key={activeTab}
              sectionKey={activeTab}
              data={PROBLEMS[activeTab]}
              scores={scores[activeTab]}
              onScore={handleScore}
            />
        }
      </div>
    </div>
  );
}
