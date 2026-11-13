/** 固定KdB 2023〜2026で照合した対応。根拠・未確定条件は curriculum/audits/applied-science.md。 */
export const appliedFoundationCourses = [
  { name: "応用理工学概論", units: 1, codes: ["FF17011"] },
  { name: "熱力学", units: 2, codes: ["FF18804", "FF18814"] },
  { name: "解析学A", units: 1, codes: ["FF18664", "FF18674"] },
  { name: "解析学B", units: 1, codes: ["FF18684", "FF18694"] },
  { name: "解析学C", units: 1, codes: ["FF18704", "FF18714"] },
  { name: "線形代数A", units: 1, codes: ["FF18724", "FF18734"] },
  { name: "線形代数B", units: 1, codes: ["FF18744", "FF18754"] },
  { name: "力学A", units: 1, codes: ["FF18784", "FF18794"] },
  { name: "電磁気学A", units: 1, codes: ["FF18604", "FF18614"] },
  { name: "電磁気学B", units: 1, codes: ["FF18624", "FF18634"] },
  { name: "電磁気学C", units: 1, codes: ["FF18644", "FF18654"] },
  { name: "化学A", units: 1, codes: ["FF18761"] },
  { name: "化学B", units: 1, codes: ["FF18771"] },
  { name: "応用理工物理学実験", units: 3, codes: ["FF19303", "FF19313"] },
  { name: "応用理工化学実験", units: 3, codes: ["FF19203", "FF19213"] },
  ...[1, 2, 3].map((index) => ({ name: `専門英語${index}`, units: 1, codes: [2, 3, 4, 5].map((major) => `FF${major}00${index + 4}1`) })),
];

export const appliedBasicCourses = [
  ...["数学リテラシー1", "数学リテラシー2", "微積分1", "微積分2", "微積分3", "線形代数1", "線形代数2", "線形代数3"].map((name, index) => ({ name, units: 1, codes: [`FA01${index + 1}`] })),
  { name: "力学1", units: 1, codes: ["FCB1201", "FCB1211", "FCB1221", "FCB1231"] },
  { name: "力学2", units: 1, codes: ["FCB1241", "FCB1251", "FCB1261"] },
  { name: "力学3", units: 1, codes: ["FCB1271", "FCB1281", "FCB1291"] },
  { name: "電磁気学1", units: 1, codes: ["FCB1301", "FCB1311", "FCB1321", "FCB1331"] },
  { name: "電磁気学2", units: 1, codes: ["FCB1341", "FCB1351", "FCB1361"] },
  { name: "電磁気学3", units: 1, codes: ["FCB1371", "FCB1381", "FCB1391"] },
  { name: "化学1", units: 1, codes: ["FE11171", "FE11271"] },
  { name: "化学2", units: 1, codes: ["FE11181", "FE11281"] },
  { name: "化学3", units: 1, codes: ["FE11191", "FE11291"] },
];

export const appliedCompulsoryCodeTypes = Object.fromEntries([
  ...[...appliedFoundationCourses, ...appliedBasicCourses].map(({ name, codes }) => [`応用理工・${name}`, { codes, except: [] }]),
  ["応用理工・微積分1（2023）", { codes: ["FA013", "FF18764"], except: [] }],
  ["応用理工・基礎実験学", { codes: ["FF19401"], except: [] }],
  ...[2, 3, 4, 5].flatMap((major) => [
    [`応用理工${major}・専攻実験A`, { codes: [`FF${major}0113`, `FF${major}0123`], except: [] }],
    [`応用理工${major}・専攻実験B`, { codes: [`FF${major}0133`, `FF${major}0143`], except: [] }],
    [`応用理工${major}・卒業研究A`, { codes: [`FF${major}9928`, `FF${major}9938`], except: [] }],
    [`応用理工${major}・卒業研究B`, { codes: [`FF${major}9948`, `FF${major}9958`], except: [] }],
  ]),
] as [string, { codes: string[]; except: string[] }][]);
