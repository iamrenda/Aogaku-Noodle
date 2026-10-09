import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function Popup() {
  return (
    <div className="w-64 bg-emerald-50 p-6 text-center">
      <img src="/icons/icon-128.png" alt="" className="mx-auto mb-3 h-16 w-16" />
      <h1 className="text-2xl font-bold text-emerald-700">Hello World</h1>
      <p className="mt-1 text-sm text-emerald-900/70">Aogaku Noodle is working.</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
