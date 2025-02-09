import FormsInfo from "@/components/FromsInfo";
import ApplicationHistory from "../../components/ApplicationHistory";
import FilterButton from "../../components/FilterButton";
import HelpButton from "../../components/HelpButton";
import AISettings from "../../components/AISettings";
import "./App.css";

export default function App() {
  return (
    <div className=" bg-slate-900">
      <div>
        <div className="py-2 mb-2 border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-center group">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 animate-gradient">
              Job Apply Pro
            </span>
          </h1>
        </div>

        <div className="px-2 pb-2 space-y-3 bg-slate-800/50 backdrop-blur-sm">
          <FormsInfo />
          <FilterButton />
          <AISettings />
          <ApplicationHistory />
          <HelpButton />
        </div>
      </div>
    </div>
  );
}
