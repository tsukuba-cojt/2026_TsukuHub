import { expect, test } from "vitest";
import { collectCategoryCourses } from "../categoryCourses";
import { checkGraduation } from "../checkGraduation";
import { resolveRequirementId } from "../data/supportedDepartments";
import { course } from "./helpers";
const majors = ["policy-economics", "policy-engineering", "policy-urban"];

test("全12運用先の124単位と2026主専攻別の分岐を保持する", () => {
  for (const [i, major] of majors.entries()) for (const year of [2023,2024,2025,2026]) {
    const id=resolveRequirementId("policy",major,year)!;
    expect(id).toBe(`${major}-${year===2026&&i>0?26:23}`);
    const report=checkGraduation([],id);
    expect(report.categories.map((c)=>c.requiredUnits)).toEqual([[29,52,11,1,6],[31,50,11,1,6],[36,45,11,1,6]][i]);
    expect(report.summary.requiredUnits).toBe(124);
    expect(report.details.selectResults.filter((r)=>r.group===0).map((r)=>r.minimum)).toEqual(i===1&&year===2026?[16,1,8,0]:[16,8,0]);
  }
});

test("都市計画の主専攻16・演習7→2と他主専攻の演習2を内数にし、必修演習を再利用しない",()=>{
  const urban=[course("FH48012","地域科学演習",2),course("FH48002","都市・地域科学演習",5),course("FH46011","都市講義",9),
    course("FH24011","他専攻",8),course("FH20001","その他",21),course("FH45122","都市計画演習",4),course("FH45222","都市計画情報演習",3)];
  for(const year of [2025,2026]){
    const id=resolveRequirementId("policy","policy-urban",year)!;
    expect(checkGraduation(urban,id).categories[1].isSatisfied).toBe(true);
    const short=urban.filter((c)=>c.id!=="FH48002").map((c)=>c.id==="FH46011"?{...c,unit:14}:c);
    expect(checkGraduation(short,id).categories[1].isSatisfied).toBe(year===2026);
    expect(checkGraduation(short,id,undefined,"five-category").categories[1].isSatisfied).toBe(true);
    expect(checkGraduation([course("FH48011","主専攻",3),urban[3],course("FH20001","その他",34)],id).categories[1].isSatisfied).toBe(false);
  }
  for(const [major,prefix,exercise] of [["policy-economics","FH24","FH24012"],["policy-engineering","FH32","FH32012"]]){
    const id=resolveRequirementId("policy",major,2025)!;const min=major==="policy-economics"?52:50;
    const input=[course(exercise,"演習",2),course(`${prefix}011`,"講義",14),course(major==="policy-economics"?"FH32011":"FH24011","他専攻",8),course("FH20001","その他",min-24)];
    expect(checkGraduation(input,id).categories[1].isSatisfied).toBe(true);
    expect(checkGraduation([{...input[0],unit:1},{...input[1],unit:15},...input.slice(2)],id).categories[1].isSatisfied).toBe(false);
  }
});

test("2026経営工学は経済1〜3と都市8を別枠で要求する",()=>{
  const input=[course("FH32012","マネジメント演習",2),course("FH33011","経営講義",14),course("FH24011","経済",8),course("FH46011","都市",0),course("FH20001","その他",26)];
  const before=resolveRequirementId("policy","policy-engineering",2025)!;const after=resolveRequirementId("policy","policy-engineering",2026)!;
  expect(checkGraduation(input,before).categories[1].isSatisfied).toBe(true);
  expect(checkGraduation(input,after).categories[1].isSatisfied).toBe(false);
  const valid=input.map((c)=>c.id==="FH24011"?{...c,unit:1}:c.id==="FH46011"?{...c,unit:8}:c.id==="FH20001"?{...c,unit:25}:c);
  expect(checkGraduation(valid,after).categories[1].isSatisfied).toBe(true);
  expect(checkGraduation(valid,after).details.selectResults.find((r)=>r.message==="社会経済システム科目")?.maximum).toBe(3);
  expect(checkGraduation(valid.map((c)=>c.id==="FH24011"?{...c,unit:0}:c),after).categories[1].isSatisfied).toBe(false);
});

test("基礎の実番号・名前を認識し、同名他学類卒研や統計を混入させない",()=>{
  const id=resolveRequirementId("policy","policy-economics",2026)!;
  const foundation=[course("FA01111","数学リテラシー1",1),course("FA01611","線形代数1",1),course("FH60811","統計学",2),course("FH61111","経済学の数理",1)];
  const own=course("FH11918","卒業研究A",4);const other=course("GC48708","卒業研究A",3);
  const report=checkGraduation([...foundation,own,other,course("GB11621","統計学",2)],id);
  expect(collectCategoryCourses(report).specializedFoundation).toEqual(foundation);
  expect(collectCategoryCourses(report).compulsory).toEqual([own]);expect(report.categories[0].earnedUnits).toBe(4);
});

test("関連の主枠6と内数ABC2・EFGH2を資格で代替せず、特設・FA45と各区分上限を守る",()=>{
  const id=resolveRequirementId("policy","policy-economics",2025)!;
  const partial=[course("BA20001","ABC",2),course("GC20001","EFGH",2),course("8049911","特設",4)];
  expect(checkGraduation(partial,id).categories[4].isSatisfied).toBe(false);
  expect(checkGraduation(partial,id,undefined,"five-category").categories[4].isSatisfied).toBe(true);
  expect(checkGraduation([...partial,course("X000001","その他他学群",2)],id).categories[4]).toMatchObject({earnedUnits:10,isSatisfied:true});
  expect(checkGraduation([course("FA45124","解析学(微積分)基礎",1)],id).details.uncountedCourses).toHaveLength(1);
  for(const [i,major] of majors.entries()){
    const report=checkGraduation([course("FH24011","専門",100),course("FH60811","基礎",30),course("1200011","学士基盤",30),course("BA20001","関連",30)],resolveRequirementId("policy",major,2026)!,undefined,"five-category");
    expect(report.categories.slice(1).map((c)=>c.earnedUnits)).toEqual([[77,16,7,20],[75,16,7,20],[70,16,7,20]][i]);
  }
});
