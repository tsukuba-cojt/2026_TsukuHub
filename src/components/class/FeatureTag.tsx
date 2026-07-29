import "../../styles/class/FeatureTag.css";

// 授業の特徴タグ（口コミカード・サイドバー「この授業の特徴」で共通）。
// 新しいタグを増やすときは、この登録簿に1行追加し、
// FeatureTag.css に対応する色クラスを定義する。
// 未登録のタグは青（isBlue）で表示される。
const featureTagClass: Record<string, string> = {
  わかりやすい: "isOrange",
  楽しい: "isPink",
  実践的: "isGreen",
  課題が多い: "isBlue",
  資料が充実: "isPurple",
  先生が優しい: "isYellow",
};

type FeatureTagProps = {
  label: string;
};

function FeatureTag({ label }: FeatureTagProps) {
  return (
    <span className={`featureTag ${featureTagClass[label] ?? "isBlue"}`}>
      {label}
    </span>
  );
}

export default FeatureTag;
