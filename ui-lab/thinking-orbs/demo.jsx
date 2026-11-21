import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThinkingOrb } from "../vendor/thinking-orbs/dist/index.es.js";

const EXAMPLES = [
  { state: "searching", label: "Searching" },
  { state: "breathing", label: "Thinking" },
  { state: "solving", label: "Solving" },
  { state: "listening", label: "Listening" },
];

const still = new URLSearchParams(location.search).get("still") === "1";

function App() {
  const [paused, setPaused] = useState(still);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data === "lab:play") setPaused(false);
      if (event.data === "lab:stop") setPaused(true);
    };
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="stage">
      <div className="card">
        {EXAMPLES.map((item) => (
          <div className="pill" key={item.state}>
            <ThinkingOrb state={item.state} size={64} theme="dark" paused={paused} style={{ width: 44, height: 44 }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
