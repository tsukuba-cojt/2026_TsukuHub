const categories = [
  {
    icon: "💼",
    title: "就活・キャリア",
    text: "インターン・就職活動やキャリア支援をまとめて確認",
  },
  {
    icon: "📘",
    title: "授業・履修",
    text: "授業の口コミや履修登録に役立つ情報",
  },
  {
    icon: "👥",
    title: "サークル・課外活動",
    text: "サークル・団体の情報や新歓情報",
  },
  {
    icon: "🍴",
    title: "生活・便利情報",
    text: "学食・住まい・交通などキャンパスライフに役立つ情報",
  },
  {
    icon: "📅",
    title: "イベント・お知らせ",
    text: "学内イベントや重要なお知らせを確認",
  },
  {
    icon: "🌐",
    title: "留学・国際交流",
    text: "留学プログラムや国際交流情報",
  },
];

function CategorySection() {
  return (
    <section className="categorySection">
      {categories.map((category) => (
        <div className="categoryCard" key={category.title}>
          <div className="categoryIcon">{category.icon}</div>
          <h3>{category.title}</h3>
          <p>{category.text}</p>
          <span className="arrow">›</span>
        </div>
      ))}
    </section>
  );
}

export default CategorySection;