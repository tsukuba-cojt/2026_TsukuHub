import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";

test("4年度を別の版へ解決し、量子の5→6と2026のEB追加を保持する",()=>{
  for(const year of [2023,2024,2025,2026]){
    const id=resolveRequirementId("physics","physics",year)!;
    expect(id).toBe(`physics-${year%100}`);
    const report=checkGraduation([],id);
    expect(report.categories.map((c)=>c.requiredUnits)).toEqual([33,35,25,1,6]);
    expect(report.summary.requiredUnits).toBe(124);
    expect(report.details.selectResults[0].minimumIncludedResults?.map((r)=>r.minimum)).toEqual([year<2025?5:6,5,2]);
    const eb=course("EB20001","生物専門",2);
    const categories=collectCategoryCourses(checkGraduation([eb],id));
    expect(categories.specializedFoundation.includes(eb)).toBe(year===2026);
    expect(categories.related.includes(eb)).toBe(year!==2026);
  }
});

test("解析力学を必修へ戻し、同名他学類卒研を除き、33＋91＝124の履修例を集計する",()=>{
  const id=resolveRequirementId("physics","physics",2026)!;
  const required=[course("FCC2733","物理学実験I",2),course("FCC3733","物理学実験II",6),course("FCC4808","卒業研究",10),
    course("FCC2202","物理学入門",1),course("FCC2464","解析力学",2),course("1100011","ファーストイヤーセミナー",1),course("1100021","学問への誘い",1),
    course("2100011","体育",2),course("31H0011","英語",4),course("6100011","情報",4)];
  const input=[...required,course("FCC2991","専門",59),course("FA19991","基礎",25),course("1200011","学士基盤",1),course("BA20001","ABC",6)];
  const report=checkGraduation(input,id,undefined,"five-category");
  expect(report.categories.map((c)=>c.earnedUnits)).toEqual([33,59,25,1,6]);
  expect(report.summary).toMatchObject({earnedUnits:124,isSatisfied:true});
  expect(checkGraduation(input.slice(0,-1),id,undefined,"five-category").summary.isSatisfied).toBe(false);
  const foreign=course("EB19008","卒業研究",10);
  expect(collectCategoryCourses(checkGraduation([foreign,required[2]],id)).compulsory).toEqual([required[2]]);
});

test("量子群の余剰をFCC枠へ配分でき、内数不足を5分類へ混ぜない",()=>{
  const id=resolveRequirementId("physics","physics",2025)!;
  const quantum=[course("FCC2231","量子力学序論",1),course("FCC2244","量子力学I",3),course("FCC3134","量子力学II",3),course("FCC3144","量子力学III",3)];
  const rest=[course("FCC2601","熱物理学",5),course("FCC2701","専門電磁気学I",2),course("FCC2991","その他専門",18)];
  expect(checkGraduation([...quantum,...rest],id).categories[1]).toMatchObject({earnedUnits:35,isSatisfied:true});
  const shortage=[quantum[0],quantum[1],...rest,course("FCC2992","その他専門",6)];
  expect(checkGraduation(shortage,id).categories[1].isSatisfied).toBe(false);
  expect(checkGraduation(shortage,id,undefined,"five-category").categories[1].isSatisfied).toBe(true);
});

test("基礎の重なる番号群を親25と内数5・4へまとめ、FCCの基礎混入を防ぐ",()=>{
  const id=resolveRequirementId("physics","physics",2026)!;
  const names=["力学1","力学2","力学3","電磁気学1","電磁気学2","電磁気学3","物理学概論"];
  const maths=["微積分1","微積分2","微積分3","線形代数1","線形代数2","線形代数3","数学リテラシー1","数学リテラシー2"];
  const input=[...names.map((name,i)=>course(`FA10${i}`,name,1)),...maths.map((name,i)=>course(`FA20${i}`,name,1)),course("FBA9991","その他基礎",10)];
  expect(checkGraduation(input,id).categories[2]).toMatchObject({earnedUnits:25,isSatisfied:true});
  const short=input.filter((c)=>c.name!=="線形代数1").map((c)=>c.id==="FBA9991"?{...c,unit:11}:c);
  expect(checkGraduation(short,id).categories[2].isSatisfied).toBe(true);
  const unknown=course("FCC9001","専門枠外FCC",2);
  expect(checkGraduation([unknown],id).details.uncountedCourses).toEqual([unknown]);
});

test("数学・理科の指導法だけを関連へ数え、ABC6の内数と各区分上限を守る",()=>{
  const id=resolveRequirementId("physics","physics",2026)!;
  const allowed=[course("9453001","数学科指導法",1),course("9456011","中学校理科教育論",1)];
  const excluded=course("9510003","教育実習(理科)",5);
  const report=checkGraduation([...allowed,excluded],id);
  expect(collectCategoryCourses(report).related).toEqual(allowed);
  expect(report.details.uncountedCourses).toEqual([excluded]);
  expect(checkGraduation(allowed,id).categories[4].isSatisfied).toBe(false);
  expect(checkGraduation([...allowed,course("BA20001","ABC",6)],id).categories[4].isSatisfied).toBe(true);
  const max=checkGraduation([course("FCC2991","専門",100),course("FA19991","基礎",100),course("1200011","学士基盤",30),course("BA20001","ABC",30)],id,undefined,"five-category");
  expect(max.categories.slice(1).map((c)=>c.earnedUnits)).toEqual([59,49,24,24]);
});
