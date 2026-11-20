import { useState } from "react";
import FinancialForm from "./components/FinancialForm.jsx";
import TelemetryPanel from "./components/TelemetryPanel.jsx";
import { useTelemetry } from "./hooks/useTelemetry.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const telemetry = useTelemetry();
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [generationError, setGenerationError] = useState("");

  async function generateWizard() {
    setGenerating(true);
    setGenerationError("");
    setGeneratedCode("");
    try {
      const response = await fetch(`${API_URL}/api/generate-ui`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "Create a simple, accessible financial profile wizard. Ask one question at a time for name, monthly income, monthly expenses, and financial goal. Include Previous and Next buttons, preserve entered values, and show a step indicator. Use a React function component and plain CSS class names.",
          formContext: { fields: ["name", "monthly income", "monthly expenses", "financial goal"], currentFrictionScore: telemetry.score }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation request failed.");
      setGeneratedCode(data.code);
    } catch (error) {
      setGenerationError(error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">A</span><span>AuraGen<small>ADAPTIVE UI LAB</small></span></a>
        <div className="topbar-right"><span className="week-tag">WEEK 01 BUILD</span><span className="status-dot" /> Prototype environment</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">GENERATIVE UI · HUMAN-CENTRED COMPUTING</p>
          <h1>Interfaces that<br /><em>notice friction.</em></h1>
          <p className="hero-description">AuraGen observes interaction patterns and explores how AI-generated interfaces can make complex tasks feel simpler.</p>
        </div>
        <div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core">A<span>✳</span></div><div className="orbit-label label-one">SENSE</div><div className="orbit-label label-two">ADAPT</div></div>
      </section>

      <section className="workspace">
        <div className="section-intro"><div><p className="eyebrow">INTERACTIVE PROTOTYPE</p><h2>Try the experience</h2></div><p>Interact with the form naturally. The monitor observes basic friction signals in real time.</p></div>
        <div className="workspace-grid">
          <FinancialForm onInvalid={telemetry.reportInvalidAttempt} />
          <TelemetryPanel signals={telemetry.signals} score={telemetry.score} serverUpdate={telemetry.serverUpdate} connected={telemetry.connected} onReset={telemetry.resetSignals} />
        </div>
      </section>

      <section className="generator-section">
        <div className="generator-copy"><p className="eyebrow">WEEK 01 · CODE-GEN AGENT</p><h2>Generate a new<br />interface concept.</h2><p>Send a UI request and form context to the LangChain + GPT-4o backend. The response is displayed as code text for review — it is not executed.</p><button className="button button-primary" onClick={generateWizard} disabled={generating}>{generating ? "Generating…" : "Generate simplified wizard code"} <span>↗</span></button></div>
        <div className="code-window"><div className="code-titlebar"><div className="window-dots"><i /><i /><i /></div><span>generated-component.jsx</span><span className="code-badge">CODE PREVIEW</span></div>
          {generationError && <div className="error-message">{generationError}</div>}
          <pre className="code-preview"><code>{generatedCode || "// Your generated React component will appear here.\n// Configure OPENAI_API_KEY in server/.env,\n// start the backend, then click Generate."}</code></pre>
        </div>
      </section>

      <footer className="footer"><span>AuraGen · Week 1 prototype</span><span>Telemetry is experimental and processed for this demo only.</span></footer>
    </main>
  );
}
