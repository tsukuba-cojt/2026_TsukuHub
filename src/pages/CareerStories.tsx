import { GraduationCap, HeartHandshake, MessageSquareQuote, Microscope, Route } from "lucide-react";
import CareerGuidePage from "../components/career/CareerGuidePage";

export default function CareerStories() {
  return (
    <CareerGuidePage
      theme="purple"
      eyebrow="ALUMNI STORIES"
      title="卒業生の体験記"
      lead="進路に正解は一つではありません。研究、就活、進学、そして社会人生活。筑波大学の先輩たちが迷い、選び、前に進んだリアルな経験を紹介します。"
      icon={MessageSquareQuote}
      heroNote="少し先を歩く先輩の言葉が、次の一歩になる。"
      featuresTitle="さまざまなキャリアに出会う"
      featuresLead="自分と近い先輩も、意外な道を選んだ先輩も探せます。"
      features={[
        { icon: Microscope, title: "研究と就活", description: "実験やゼミと選考を両立した先輩の、時間の使い方を聞きました。" },
        { icon: Route, title: "進路の決め方", description: "就職か進学か、業界や職種をどう絞ったか、その過程をたどります。" },
        { icon: GraduationCap, title: "筑波での学び", description: "授業、研究、課外活動が、今の仕事にどう生きているかを紹介します。" },
        { icon: HeartHandshake, title: "後輩へのメッセージ", description: "当時の自分に伝えたいこと、今だから言えるアドバイスを届けます。" },
      ]}
      articlesTitle="新着インタビュー"
      articlesLead="専攻も進路も異なる、3人の卒業生に聞きました。"
      articles={[
        { tag: "理工学群 → IT", title: "研究で培った「問いを立てる力」をプロダクト開発へ", description: "大学院進学と就職で迷った時期から、現在の仕事に出会うまで。", meta: "10分", accent: "#7557e8" },
        { tag: "人文・文化学群 → 出版", title: "好きなことを仕事にするまで、焦らず続けた企業研究", description: "周囲と比べて悩んだときに、自分の軸を取り戻した方法を聞きました。", meta: "8分", accent: "#7557e8" },
        { tag: "情報学群 → 起業", title: "サークルの小さな挑戦が、事業の原点になった", description: "学生時代の仲間とサービスを立ち上げるまでの試行錯誤。", meta: "12分", accent: "#7557e8" },
      ]}
      checklistTitle="体験記の読み方"
      checklist={["自分と同じ点・違う点を見つける", "判断したときの基準に注目する", "失敗や迷いから学ぶ", "気になった言葉をメモする"]}
      ctaTitle="自分の準備も始めてみよう"
      ctaText="就活の全体像と、今日からできる小さな一歩を確認できます。"
      ctaLabel="基礎知識を見る"
      ctaTo="/career/basics"
    />
  );
}
