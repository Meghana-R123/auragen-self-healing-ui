import { useState } from "react";

export default function FinancialForm({ onInvalid }) {
  const [values, setValues] = useState({ name: "", income: "", expenses: "", goal: "" });
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const steps = [
    { key: "name", label: "What should we call you?", placeholder: "Your name", type: "text" },
    { key: "income", label: "What is your monthly income?", placeholder: "e.g. 35000", type: "number" },
    { key: "expenses", label: "What are your monthly expenses?", placeholder: "e.g. 18000", type: "number" },
    { key: "goal", label: "What is your main financial goal?", placeholder: "e.g. Save for higher studies", type: "text" }
  ];
  const current = steps[step];

  const next = () => {
    if (!values[current.key].trim()) {
      onInvalid();
      return;
    }
    if (step < steps.length - 1) setStep((value) => value + 1);
    else setSubmitted(true);
  };

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">DEMO EXPERIENCE</p><h2>Financial profile</h2></div>
        <span className="step-count">Step {step + 1} of {steps.length}</span>
      </div>
      <div className="progress-track form-progress"><div className="progress-fill" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      {submitted ? (
        <div className="success-state">
          <div className="success-icon">✓</div><h3>Profile captured</h3>
          <p>Your demo form data has been collected in this browser session.</p>
          <button className="button button-primary" onClick={() => { setSubmitted(false); setStep(0); setValues({ name: "", income: "", expenses: "", goal: "" }); }}>Start again</button>
        </div>
      ) : (
        <div className="question-area">
          <span className="question-number">0{step + 1}</span>
          <label className="question-label" htmlFor={`field-${current.key}`}>{current.label}</label>
          <input id={`field-${current.key}`} className="form-input" type={current.type} min={current.type === "number" ? "0" : undefined} value={values[current.key]} placeholder={current.placeholder} onChange={(event) => setValues((old) => ({ ...old, [current.key]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") next(); }} />
          <p className="field-hint">Take your time. Your progress stays as you move between steps.</p>
          <div className="form-actions">
            <button className="button button-quiet" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Previous</button>
            <button className="button button-primary" onClick={next}>{step === steps.length - 1 ? "Finish" : "Next"} <span>→</span></button>
          </div>
        </div>
      )}
      <div className="form-footer"><span className="privacy-mark">◇</span> Demo only — do not enter real financial or sensitive information.</div>
    </section>
  );
}
