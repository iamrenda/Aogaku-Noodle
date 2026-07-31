import { useMemo, useState } from "react";
import RevealCard from "./RevealCard";

function RevealerScreen({ grades, onBack, onFinish }) {
    const [revealed, setRevealed] = useState(() => new Set());

    const allRevealed = grades.length > 0 && revealed.size === grades.length;

    const reveal = (index) => {
        setRevealed((current) => {
            const next = new Set(current);
            next.add(index);
            return next;
        });
    };

    const revealAll = () => setRevealed(new Set(grades.map((_, index) => index)));

    const progressLabel = useMemo(() => `${revealed.size} / ${grades.length} 開封済み`, [revealed.size, grades.length]);

    return (
        <div className="gv-screen gv-screen--revealer">
            <header className="gv-topbar gv-topbar--row">
                <p className="gv-brandmark">GRADE VIEWER</p>
                <div className="gv-topbar__actions">
                    <button type="button" className="gv-pill-button" onClick={onBack}>
                        戻る
                    </button>
                    <button type="button" className="gv-pill-button" onClick={revealAll} disabled={allRevealed}>
                        すべて開封
                    </button>
                </div>
            </header>

            {grades.length === 0 ? (
                <div className="gv-empty">表示する成績がありません。</div>
            ) : (
                <div className="gv-reveal-grid">
                    {grades.map((grade, index) => (
                        <RevealCard
                            key={index}
                            grade={grade}
                            revealed={revealed.has(index)}
                            onReveal={() => reveal(index)}
                        />
                    ))}
                </div>
            )}

            <div className="gv-floating-bar is-visible">
                <span className="gv-floating-bar__count">{progressLabel}</span>
                <button
                    type="button"
                    className={`gv-floating-bar__button ${allRevealed ? "is-ready" : ""}`}
                    onClick={onFinish}
                    disabled={!allRevealed}
                >
                    結果を見る
                </button>
            </div>
        </div>
    );
}

export default RevealerScreen;
