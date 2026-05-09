function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-icon">❓</div>
            <h2>データが見つかりませんでした</h2>
            <p>Moodleのホームページにアクセスしてデータを読み込んでください。</p>
        </div>
    );
}

export default EmptyState;
