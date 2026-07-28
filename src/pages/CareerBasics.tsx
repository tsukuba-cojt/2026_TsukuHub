import { BookOpenCheck, CalendarRange, Compass, FileCheck2, SearchCheck } from "lucide-react";
import CareerGuidePage from "../components/career/CareerGuidePage";

export default function CareerBasics() {
  return (
    <CareerGuidePage
      theme="blue"
      eyebrow="JOB HUNTING BASICS"
      title="就活の基礎知識"
      lead="何から始めればいいか分からなくても大丈夫。就活の全体像から自己分析、企業研究、選考対策まで、筑波大生に必要な準備を順番に学べます。"
      icon={BookOpenCheck}
      heroNote="迷ったときに、何度でも戻ってこられる就活ガイド。"
      featuresTitle="就活の準備を、順番に"
      featuresLead="現在地に合ったテーマから始めましょう。"
      features={[
        { icon: CalendarRange, title: "全体の流れを知る", description: "学年・時期ごとの動きを確認して、自分だけのスケジュールを作ります。" },
        { icon: Compass, title: "自分を知る", description: "経験を振り返り、大切にしたい価値観や強みを言葉にします。" },
        { icon: SearchCheck, title: "仕事を知る", description: "業界・企業・職種の違いを知り、自分に合う選択肢を広げます。" },
        { icon: FileCheck2, title: "選考に備える", description: "ES、面接、Webテストの基本と、準備のポイントを押さえます。" },
      ]}
      articlesTitle="はじめに読みたい記事"
      articlesLead="短時間で就活の基本がつかめる記事を集めました。"
      articles={[
        { tag: "スケジュール", title: "就活はいつから？ 学年別にやることを整理", description: "1・2年生からできること、3年生以降の動きを時系列で解説します。", meta: "6分" },
        { tag: "自己分析", title: "自分の強みを見つける3つの問い", description: "特別な経験がなくても使える、経験の振り返り方を紹介します。", meta: "5分" },
        { tag: "企業研究", title: "企業を見るときのチェックポイント", description: "知名度だけで選ばず、自分との相性を確かめる視点を学びます。", meta: "7分" },
      ]}
      checklistTitle="今週できること"
      checklist={["就活の大まかな時期を確認する", "学生生活の経験を3つ書き出す", "気になる仕事を一つ調べる", "相談できる人・場所を確認する"]}
      ctaTitle="実践しながら仕事を知りたい？"
      ctaText="長期インターンなら、学生のうちから仕事や職場を体験できます。"
      ctaLabel="長期インターンを見る"
      ctaTo="/career/internships"
    />
  );
}
