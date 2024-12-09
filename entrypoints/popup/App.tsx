import FormsInfo from "@/components/FromsInfo";
import ApplicationHistory from "../../components/ApplicationHistory";
import FilterButton from "../../components/FilterButton";
import HelpButton from "../../components/HelpButton";
import "./App.css";

export default function App() {
    return (
        <div className="min-w-[300px] max-w-[600px] bg-gray-50">
            <div>
                <div className="bg-white shadow-sm py-4 mb-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
                        Job Apply Pro
                    </h1>
                </div>

                <div className="px-4 pb-4 space-y-3 bg-white">
                    <FormsInfo />
                    <FilterButton />
                    <ApplicationHistory />
                    <HelpButton />
                </div>
            </div>
        </div>
    );
}
