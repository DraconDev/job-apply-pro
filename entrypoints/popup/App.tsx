import { useState } from "react";
import ApplicationHistory from "../../components/ApplicationHistory";
import LinkedInAutoApply from "../../components/LinkedInAutoApply";
import HelpButton from "../../components/HelpButton";
import "./App.css";

export default function App() {
    return (
        <div className="min-w-[500px] max-w-[800px] bg-slate-50">
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-slate-800">
                        Job Apply Pro
                    </h1>
                    <HelpButton openInNewTab={true} />
                </div>

                <LinkedInAutoApply />

                <div className="">
                    <ApplicationHistory />
                </div>
            </div>
        </div>
    );
}
