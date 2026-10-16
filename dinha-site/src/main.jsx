import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DinhaSite from "./DinhaSite.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DinhaSite />
  </StrictMode>
);
