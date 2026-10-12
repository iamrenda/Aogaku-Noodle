import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CourseViewer from "./components/CourseViewer";
import contentCss from "./content.css?inline";
import createShadowStyleSheet from "./shadowStyles";

const HOST_ID = "aogaku-noodle-courses";

/**
 * Injects the course viewer into /my/courses.php
 * Mounted inside a Shadow DOM so Moodle and our styles do not affect each other
 */
function inject() {
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
  shadow.adoptedStyleSheets = [createShadowStyleSheet(contentCss)];
  const mount = document.createElement("div");
  shadow.appendChild(mount);

  createRoot(mount).render(
    <StrictMode>
      <CourseViewer />
    </StrictMode>,
  );
}

inject();
