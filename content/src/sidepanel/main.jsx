import { createRoot } from "react-dom/client";
import { SidePanelApp } from "./App";
import "./App.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<SidePanelApp />);
