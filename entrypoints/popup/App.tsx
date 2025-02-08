import FormsInfo from "@/components/FromsInfo";
import ApplicationHistory from "../../components/ApplicationHistory";
import FilterButton from "../../components/FilterButton";
import HelpButton from "../../components/HelpButton";
import AISettings from "../../components/AISettings";
import "./App.css";

export default function App() {
    return (
        <div className="min-w-[300px] max-w-[600px] bg-gray-50">
            <div>
                <div className="py-4 mb-4 bg-white shadow-sm">
                    <h1 className="text-xl font-bold text-center text-gray-800 md:text-2xl">
                        Job Apply Pro
                    </h1>
                </div>

                <div className="px-4 pb-4 space-y-3 bg-white">
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
