import React from "react";
import ReactDOM from "react-dom/client";
import PersonalInfo from "../../components/PersonalInfo";
import "../popup/style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <div className="min-h-screen w-screen flex items-start justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="w-full max-w-4xl px-4">
                <PersonalInfo />
            </div>
        </div>
    </React.StrictMode>
);
