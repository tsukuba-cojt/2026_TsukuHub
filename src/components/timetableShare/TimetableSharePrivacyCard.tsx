import "../../styles/class/TimetableShare.css";

type Props = {
  onGoMypage: () => void;
};

function TimetableSharePrivacyCard({ onGoMypage }: Props) {
  return (
    <aside className="ttSharePrivacyCard">
      <h2 className="ttSharePrivacyTitle">非公開・編集について</h2>
      <p className="ttSharePrivacyText">マイページからいつでも編集できます</p>
      <p className="ttSharePrivacyText">
        また、マイページ「共有設定」よりいつでも非公開にできます
      </p>
      <p className="ttSharePrivacyText">
        非公開の場合でも、自分の時間割情報は確認できます
      </p>
      <button type="button" className="ttShareGhostBtn" onClick={onGoMypage}>
        マイページへ
      </button>
    </aside>
  );
}

export default TimetableSharePrivacyCard;
