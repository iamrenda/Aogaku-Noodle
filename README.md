**青学 Moodle を良くした Chrome 拡張機能**

青山学院大学の Moodle（agulms45）を、もっと見やすく、もっと使いやすくするための非公式・無料の Chrome 拡張機能です。
講義一覧の整理、課題の一覧表示、シラバスへのワンクリックアクセスを提供します。

<img width="1280" height="800" alt="title image" src="https://github.com/user-attachments/assets/26083088-0325-4534-861b-94510f43728b" />

---

## 主な機能

### 講義一覧

講義一覧を見やすいUIに改善しました

<img width="1280" height="800" alt="before image" src="https://github.com/user-attachments/assets/ea5ddfae-7fd0-49ac-a8fb-0bdc8842a15e" />
<img width="1280" height="800" alt="after image" src="https://github.com/user-attachments/assets/eb64e8eb-1a8b-491d-b118-7e6a6777a988" />

### 課題一覧
- 全講義の課題・小テスト・レポートを締切順に表示
- 不要な課題は「非表示」にでき、あとから見返すことも可能
- Moodle のどのページからでもサイドパネルで確認できる

<img width="1280" height="800" alt="assignment image" src="https://github.com/user-attachments/assets/c6970d74-c78d-4b82-bcf0-9ba67cec5f86" />

### シラバス連携
- 学部・学科を選ぶと、各講義のシラバスを大学のシラバスサイトから自動で検索
- 講義カードのアイコンから、シラバスを直接開ける

---

## 作った理由

### ① 講義一覧が見づらい

今の講義一覧は、曜日や時限の順に並んでおらず、また講義の文字が正しく標準化されていなく読みずらいです。
今日は何限に何の授業かを知るのにも、一覧をスクロールして探す必要がありました。
そこで、曜日ごとにまとめ、時限の数字と講義名を大きく表示する形に作り直しました。

### ② 課題の確認が面倒

Moodle には、すべての課題をまとめて見る場所がほとんどありません。

- 自分でカレンダーなどに課題を書いて管理する
- 講義ページを 1 つずつ開き、課題が出ていないか確認する

課題の見落としは単位に直結します。それなのに、確認の手間がかかりすぎると感じました。

---

## 技術的なこだわり

- **サーバーを持たない設計**：ログイン済みの Moodle セッションをそのまま使い、データは `chrome.storage.local` に保存します。外部へ送信するのは大学のサーバーへのリクエストだけです。
- **Moodle の内部 API を利用**：ページのセッションキーで `core_calendar_get_action_events_by_timesort` などを呼び出し、課題を取得します。HTML のスクレイピングに頼らないので、画面の変更に強くなります。
- **ページングの落とし穴への対応**：Moodle のイベント取得は、`timesortfrom` と `aftereventid` を両方渡さないと先頭の 50 件が返り続けます。この仕様を調べてカーソルを実装し、全件を取得できるようにしました。
- **Moodle の画面を壊さない**：ページ内に差し込む UI は Shadow DOM に閉じ込め、Moodle のスタイルとは互いに影響しません。
- **最小限の権限**：Chrome の権限は、機能に必要なものだけを要求しています。
- **CI/CD**：GitHub Actions でビルドとリリースを自動化しています。

### 使用技術

| 分類 | 技術 |
|---|---|
| 言語 | TypeScript |
| UI | React 19 / Tailwind CSS v4 |
| ビルド | Vite / @crxjs/vite-plugin |
| 拡張機能 | Chrome Manifest V3（サイドパネル） |
| CI/CD | GitHub Actions |

---

## インストール

[Chrome Web Store](https://chromewebstore.google.com/detail/%E9%9D%92%E5%AD%A6noodle/pojgmfamaaeakcilpkdimbigajeaafhc?authuser=0&hl=en)

---

### 使い方

1. 青学 Moodle にログインする
2. ツールバーの 青学Noodle のアイコンをクリックし、サイドパネルを開く
3. 「講義」タブで更新ボタンを押し、講義を読み込む
4. 「設定」で専攻を選ぶと、シラバスのアイコンが使えるようになる
5. 「課題」タブの更新ボタンで、課題を取得する

---

<img width="1280" height="800" alt="Coming next" src="https://github.com/user-attachments/assets/addd1d65-5786-437a-af61-57ae273b1a37" />

アイデア・要望・バグがあれば、[Issues](https://github.com/iamrenda/Aogaku-Noodle/issues) までお願いします。

---

## 注意事項

- 本拡張機能は、学生が個人で開発した**非公式**のものです。青山学院大学とは関係ありません。
- 取得したデータはブラウザ内にのみ保存され、開発者を含む第三者に送信されることはありません。
- Moodle の仕様変更により、正しく動作しなくなることがあります。
