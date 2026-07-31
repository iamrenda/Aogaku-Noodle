/* global chrome */

import { useEffect, useState } from "react";
import SelectorScreen from "./components/SelectorScreen";
import RevealerScreen from "./components/RevealerScreen";
import SummaryScreen from "./components/SummaryScreen";

export function GradeViewerApp() {
    const [grades, setGrades] = useState([]);
    const [cumulativeGpa, setCumulativeGpa] = useState(null);
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [screen, setScreen] = useState("select");

    useEffect(() => {
        chrome.storage.local.get(["gradeViewerData", "gradeViewerGpa"], (result) => {
            setGrades(Array.isArray(result.gradeViewerData) ? result.gradeViewerData : []);
            setCumulativeGpa(typeof result.gradeViewerGpa === "number" ? result.gradeViewerGpa : null);
        });

        const listener = (changes, namespace) => {
            if (namespace !== "local") {
                return;
            }

            if (changes.gradeViewerData) {
                setGrades(Array.isArray(changes.gradeViewerData.newValue) ? changes.gradeViewerData.newValue : []);
            }

            if (changes.gradeViewerGpa) {
                setCumulativeGpa(
                    typeof changes.gradeViewerGpa.newValue === "number" ? changes.gradeViewerGpa.newValue : null,
                );
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

    const handleConfirm = (chosen) => {
        setSelectedGrades(chosen);
        setScreen("reveal");
    };

    const restart = () => {
        setSelectedGrades([]);
        setScreen("select");
    };

    if (screen === "reveal") {
        return (
            <RevealerScreen
                grades={selectedGrades}
                onBack={() => setScreen("select")}
                onFinish={() => setScreen("summary")}
            />
        );
    }

    if (screen === "summary") {
        return <SummaryScreen grades={selectedGrades} cumulativeGpa={cumulativeGpa} onRestart={restart} />;
    }

    return <SelectorScreen grades={grades} onConfirm={handleConfirm} />;
}

export default GradeViewerApp;
