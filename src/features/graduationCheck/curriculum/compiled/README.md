# 年度別卒業要件スナップショット

`<入学年度>/<学類キー>/<主専攻キー>.json` は、`gradRequirementData` と
`supportedDepartments` から完全展開した実行候補データである。前年との差分ではなく、各ファイルが
1主専攻・1入学年度の `GradRequirement` 全体を保持する。

```text
compiled/
  manifest.json
  2026/
    index.json
    biology/
      biology.json
    coins/
      coins-ss.json
```

ルートの `manifest.json` は年度別 `index.json` を列挙し、各年度の `index.json` はその年度に存在する
学類・主専攻ファイルを列挙する。階層順は必ず「入学年度 → 学類 → 主専攻」とする。

各主専攻スナップショットには次を含む。

- 対象入学年度へ単年化した完全な `GradRequirement`
- 年度を除いたルール本体の `ruleSemanticSha256`
- 単年化した完全スナップショットの `snapshotSha256`
- 公式資料監査の状態と阻害事項
- `approved` の場合だけ真になる `publishable`

現在のブラウザ判定はまだこのディレクトリを参照しない。`rule-reviews.json` の証拠表監査が完了し、
対象が `approved` になった後で段階的に切り替える。`needs_review` や `unsupported` を本番ルールとして
読み込んではならない。

再生成:

```sh
npm run sync:requirement-snapshots
```

生成物を手編集しない。ルール、年度対応、監査状態のいずれかを変更した場合は再生成し、テストで
元データとの完全一致とハッシュを確認する。
