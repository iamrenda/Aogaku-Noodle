import { createRoot } from "react-dom/client";
import { GradeViewerApp } from "./App";
import "./App.css";

const rootElement = document.getElementById("root");

createRoot(rootElement).render(<GradeViewerApp />);