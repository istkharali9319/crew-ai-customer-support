import React from "react";
import ReactDOM from "react-dom/client";

// Bootstrap 5 styles and Bootstrap Icons (installed from npm, no CDN needed)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// Our small custom stylesheet, loaded last so it can adjust Bootstrap where needed
import "./index.css";

import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
