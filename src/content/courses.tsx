import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const HOST_ID = "aogaku-noodle-courses";

/**
 * Injects the course viewer into /my/courses.php
 * Mounted inside a Shadow DOM so Moodle and our styles do not affect each other
 */
function inject() {
  console.log("[青学Noodle] content script running on", location.href);
  const pageWrapper = document.querySelector("#page-wrapper");
  if (!pageWrapper) {
    console.warn("[青学Noodle] #page-wrapper not found; course viewer not injected");
    return;
  }
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  pageWrapper.insertAdjacentElement("afterbegin", host);

  const shadow = host.attachShadow({ mode: "open" });
  const mount = document.createElement("div");
  shadow.appendChild(mount);

  // Placeholder for the injection test; replaced by the course viewer UI next
  createRoot(mount).render(
    <StrictMode>
      <div style={{ margin: 16, padding: 16, border: "2px solid #0d8a55", borderRadius: 12 }}>
        青学Noodle: injected ✓
      </div>
    </StrictMode>,
  );
}

inject();
