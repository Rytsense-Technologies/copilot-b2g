import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";
import { BrowserRouter } from "react-router-dom";
import WidgetContainer from "./features/widget/widget-container";
import "./index.css";

const WIDGET_ID = "chat-copilot-widget-root";

function initWidget() {
  console.log("DEBUG_URL: Initializing Chat Copilot Widget...");
  let rootElement = document.getElementById(WIDGET_ID);

  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = WIDGET_ID;
    document.body.appendChild(rootElement);
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WidgetContainer />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Auto-initialize when the script is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}
