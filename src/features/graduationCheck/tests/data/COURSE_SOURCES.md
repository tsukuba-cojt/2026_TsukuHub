# ダミーCSVの科目名の出典

CSVファイル名の年度と `.expected.json` の `selection.admissionYear` は**入学年度**を表す。科目名・科目範囲はこの入学年度の筑波大学履修要覧を参照する。CSVの「開講年度」は、その科目を履修する年度であり、入学年度とは別である。

## 参照方法

- 「5-2 学内諸規則等（履修細則等）」の学類・主専攻別の表を基準とした。共通科目の個別名は「3 基礎科目（共通科目等）の履修方法」、教科に関する専門的事項の科目名は「4 教育職員免許状等の資格取得に必要な科目の履修方法」も参照した。第4章の参照は科目名の確認に用いており、教職科目を卒業単位に一律算入する意味ではない。
- 備考の「科目名記載」は、参照PDFの指定ページで名称を確認したもの。全角・半角、空白、ローマ数字などの表記差を除いて照合した。
- 備考の「科目番号範囲・KDBで科目名補完」は、履修細則が個別名を列挙せず番号範囲で指定する科目。履修要覧の該当表を基準に選び、具体名はリポジトリの `public/data/courses/tsukuba-YYYY.json` で補完した。履修要覧に個別名が直接記載されているという意味ではない。
- 人文学類の「卒業論文（〇〇）」は、表の〇〇に当該主専攻名を入れたもの。備考に「主専攻名具体化」と明記した。
- 2025年度の保存済み5-2 PDFは文字抽出に文字化けがあるため、物理学類（PDF65頁）・化学類（66頁）・情報メディア創成学類（88頁）はページ画像を確認した。隣接年度の表で代用していない。
- 選択科目の個別許可・除外・読み替え・区分上限は別途存在する。科目名の出典確認と卒業単位への算入結果は別であり、判定結果は同名の期待値JSONで確認する。

全2103科目分の内訳：科目名記載1884、科目番号範囲からの補完215、卒業論文の主専攻名具体化4。

## 公式資料

ページ番号はPDF先頭を1頁とする。紙面下部の印刷ページ番号とは区別する。各CSVの備考には、個々の科目について参照した章とPDFページを記載している。

| 入学年度 | 履修要覧 | 共通科目 | 資格関係科目 | 履修細則 |
| ---: | --- | --- | --- | --- |
| 2021 | [公式目次](https://www.tsukuba.ac.jp/education/ug-courses-directory/2021.html) | [3](https://www.tsukuba.ac.jp/education/ug-courses-directory/2021/pdf/3.pdf) | [4](https://www.tsukuba.ac.jp/education/ug-courses-directory/2021/pdf/4.pdf) | [5-2](https://www.tsukuba.ac.jp/education/ug-courses-directory/2021/pdf/5-2.pdf) |
| 2022 | [公式目次](https://www.tsukuba.ac.jp/education/ug-courses-directory/2022.html) | [3](https://www.tsukuba.ac.jp/education/ug-courses-directory/2022/pdf/3.pdf) | [4](https://www.tsukuba.ac.jp/education/ug-courses-directory/2022/pdf/4.pdf) | [5-2](https://www.tsukuba.ac.jp/education/ug-courses-directory/2022/pdf/5-2.pdf) |
| 2023 | [公式目次](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023.html) | [3](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/3.pdf) | [4](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/4.pdf) | [5-2](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf) |
| 2024 | [公式目次](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024.html) | [3](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/3.pdf) | [4](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/4.pdf) | [5-2](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf) |
| 2025 | [公式目次](https://www.tsukuba.ac.jp/education/ug-courses-directory/2025.html) | [3](https://www.tsukuba.ac.jp/education/ug-courses-directory/2025/pdf/3.pdf) | [4](https://www.tsukuba.ac.jp/education/ug-courses-directory/2025/pdf/4.pdf) | [5-2](https://www.tsukuba.ac.jp/education/ug-courses-directory/2025/pdf/5-2.pdf) |
| 2026 | [公式目次](https://www.tsukuba.ac.jp/education/ug-courses-directory/2026.html) | [3](https://www.tsukuba.ac.jp/education/ug-courses-directory/2026/pdf/3.pdf) | [4](https://www.tsukuba.ac.jp/education/ug-courses-directory/2026/pdf/4.pdf) | [5-2](https://www.tsukuba.ac.jp/education/ug-courses-directory/2026/pdf/5-2.pdf) |

## 各ケースの基準となる履修細則の表

科目名を別章・別ページで確認した場合は、CSVの備考にそのページを記録した。KDB年度は開講科目情報の補完に用いた年度であり、履修要覧の適用年度ではない。2021・2022年入学者の追加科目は2023年度開講の科目として記録する。

| CSV | 入学年度 | 履修細則の表（PDF頁） | 補完用KDB年度 |
| --- | ---: | --- | ---: |
| [applied-electron-2023-mixed.csv](applied-electron-2023-mixed.csv) | 2023 | [5-2・66頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=66) | 2023 |
| [applied-electron-2024-mixed.csv](applied-electron-2024-mixed.csv) | 2024 | [5-2・67頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=67) | 2024 |
| [applied-materials-2023-mixed.csv](applied-materials-2023-mixed.csv) | 2023 | [5-2・67頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=67) | 2023 |
| [applied-materials-2024-mixed.csv](applied-materials-2024-mixed.csv) | 2024 | [5-2・68頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=68) | 2024 |
| [applied-molecule-2023-mixed.csv](applied-molecule-2023-mixed.csv) | 2023 | [5-2・68頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=68) | 2023 |
| [applied-molecule-2024-mixed.csv](applied-molecule-2024-mixed.csv) | 2024 | [5-2・69頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=69) | 2024 |
| [applied-physics-2023-mixed.csv](applied-physics-2023-mixed.csv) | 2023 | [5-2・65頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=65) | 2023 |
| [applied-physics-2024-mixed.csv](applied-physics-2024-mixed.csv) | 2024 | [5-2・66頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=66) | 2024 |
| [art-studies-2023-mixed.csv](art-studies-2023-mixed.csv) | 2023 | [5-2・113頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=113) | 2023 |
| [biology-2023-mixed.csv](biology-2023-mixed.csv) | 2023 | [5-2・43頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=43) | 2023 |
| [bioresources-2023-mixed.csv](bioresources-2023-mixed.csv) | 2023 | [5-2・44頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=44) | 2023 |
| [bioresources-2024-mixed.csv](bioresources-2024-mixed.csv) | 2024 | [5-2・45頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=45) | 2024 |
| [bioresources-interdisciplinary-2023-mixed.csv](bioresources-interdisciplinary-2023-mixed.csv) | 2023 | [5-2・49頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=49) | 2023 |
| [bioresources-interdisciplinary-2024-mixed.csv](bioresources-interdisciplinary-2024-mixed.csv) | 2024 | [5-2・50頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=50) | 2024 |
| [chem-2022-mixed.csv](chem-2022-mixed.csv) | 2022 | [5-2・62頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2022/pdf/5-2.pdf#page=62) | 2023 |
| [chem-2023-mixed.csv](chem-2023-mixed.csv) | 2023 | [5-2・64頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=64) | 2023 |
| [chem-2025-mixed.csv](chem-2025-mixed.csv) | 2025 | [5-2・66頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2025/pdf/5-2.pdf#page=66) | 2025 |
| [coins-im-2023-mixed.csv](coins-im-2023-mixed.csv) | 2023 | [5-2・85頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=85) | 2023 |
| [coins-im-2026-mixed.csv](coins-im-2026-mixed.csv) | 2026 | [5-2・87頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2026/pdf/5-2.pdf#page=87) | 2026 |
| [coins-is-2023-mixed.csv](coins-is-2023-mixed.csv) | 2023 | [5-2・84頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=84) | 2023 |
| [coins-is-2026-mixed.csv](coins-is-2026-mixed.csv) | 2026 | [5-2・86頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2026/pdf/5-2.pdf#page=86) | 2026 |
| [coins-ss-2023-mixed.csv](coins-ss-2023-mixed.csv) | 2023 | [5-2・83頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=83) | 2023 |
| [coins-ss-2026-mixed.csv](coins-ss-2026-mixed.csv) | 2026 | [5-2・85頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2026/pdf/5-2.pdf#page=85) | 2026 |
| [comparative-culture-2023-mixed.csv](comparative-culture-2023-mixed.csv) | 2023 | [5-2・8頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=8) | 2023 |
| [disability-2023-mixed.csv](disability-2023-mixed.csv) | 2023 | [5-2・36頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=36) | 2023 |
| [earth-environment-2023-mixed.csv](earth-environment-2023-mixed.csv) | 2023 | [5-2・46頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=46) | 2023 |
| [earth-environment-2024-mixed.csv](earth-environment-2024-mixed.csv) | 2024 | [5-2・47頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=47) | 2024 |
| [earth-environment-2026-mixed.csv](earth-environment-2026-mixed.csv) | 2026 | [5-2・49頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2026/pdf/5-2.pdf#page=49) | 2026 |
| [earth-evolution-2023-mixed.csv](earth-evolution-2023-mixed.csv) | 2023 | [5-2・47頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=47) | 2023 |
| [earth-evolution-2024-mixed.csv](earth-evolution-2024-mixed.csv) | 2024 | [5-2・48頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=48) | 2024 |
| [earth-interdisciplinary-2023-mixed.csv](earth-interdisciplinary-2023-mixed.csv) | 2023 | [5-2・50頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=50) | 2023 |
| [earth-interdisciplinary-2024-mixed.csv](earth-interdisciplinary-2024-mixed.csv) | 2024 | [5-2・51頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2024/pdf/5-2.pdf#page=51) | 2024 |
| [education-2023-mixed.csv](education-2023-mixed.csv) | 2023 | [5-2・34頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=34) | 2023 |
| [esys-eme-2023-mixed.csv](esys-eme-2023-mixed.csv) | 2023 | [5-2・70頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=70) | 2023 |
| [esys-ies-2023-mixed.csv](esys-ies-2023-mixed.csv) | 2023 | [5-2・69頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=69) | 2023 |
| [humanities-archaeology-2023-mixed.csv](humanities-archaeology-2023-mixed.csv) | 2023 | [5-2・6頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=6) | 2023 |
| [humanities-history-2023-mixed.csv](humanities-history-2023-mixed.csv) | 2023 | [5-2・5頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=5) | 2023 |
| [humanities-linguistics-2023-mixed.csv](humanities-linguistics-2023-mixed.csv) | 2023 | [5-2・7頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=7) | 2023 |
| [humanities-philosophy-2023-mixed.csv](humanities-philosophy-2023-mixed.csv) | 2023 | [5-2・4頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=4) | 2023 |
| [international-development-2023-mixed.csv](international-development-2023-mixed.csv) | 2023 | [5-2・22頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=22) | 2023 |
| [international-medical-science-2023-mixed.csv](international-medical-science-2023-mixed.csv) | 2023 | [5-2・101頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=101) | 2023 |
| [international-relations-2023-mixed.csv](international-relations-2023-mixed.csv) | 2023 | [5-2・21頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=21) | 2023 |
| [japanese-art-2023-mixed.csv](japanese-art-2023-mixed.csv) | 2023 | [5-2・114頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=114) | 2023 |
| [japanese-culture-2023-mixed.csv](japanese-culture-2023-mixed.csv) | 2023 | [5-2・9頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=9) | 2023 |
| [klis-irm-2021-mixed.csv](klis-irm-2021-mixed.csv) | 2021 | [5-2・86頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2021/pdf/5-2.pdf#page=86) | 2023 |
| [klis-irm-2023-mixed.csv](klis-irm-2023-mixed.csv) | 2023 | [5-2・88頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=88) | 2023 |
| [klis-kis-2021-mixed.csv](klis-kis-2021-mixed.csv) | 2021 | [5-2・85頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2021/pdf/5-2.pdf#page=85) | 2023 |
| [klis-kis-2023-mixed.csv](klis-kis-2023-mixed.csv) | 2023 | [5-2・87頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=87) | 2023 |
| [klis-ksc-2021-mixed.csv](klis-ksc-2021-mixed.csv) | 2021 | [5-2・85頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2021/pdf/5-2.pdf#page=85) | 2023 |
| [klis-ksc-2023-mixed.csv](klis-ksc-2023-mixed.csv) | 2023 | [5-2・87頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=87) | 2023 |
| [mast-2021-mixed.csv](mast-2021-mixed.csv) | 2021 | [5-2・84頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2021/pdf/5-2.pdf#page=84) | 2023 |
| [mast-2023-mixed.csv](mast-2023-mixed.csv) | 2023 | [5-2・86頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=86) | 2023 |
| [mast-2025-mixed.csv](mast-2025-mixed.csv) | 2025 | [5-2・88頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2025/pdf/5-2.pdf#page=88) | 2025 |
| [math-2023-mixed.csv](math-2023-mixed.csv) | 2023 | [5-2・62頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=62) | 2023 |
| [medical-science-2023-mixed.csv](medical-science-2023-mixed.csv) | 2023 | [5-2・100頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=100) | 2023 |
| [medicine-2023-mixed.csv](medicine-2023-mixed.csv) | 2023 | [5-2・93頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=93) | 2023 |
| [new-medicine-2023-mixed.csv](new-medicine-2023-mixed.csv) | 2023 | [5-2・94頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=94) | 2023 |
| [nursing-2023-mixed.csv](nursing-2023-mixed.csv) | 2023 | [5-2・97頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=97) | 2023 |
| [physical-education-2023-mixed.csv](physical-education-2023-mixed.csv) | 2023 | [5-2・109頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=109) | 2023 |
| [physics-2023-mixed.csv](physics-2023-mixed.csv) | 2023 | [5-2・63頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=63) | 2023 |
| [physics-2025-mixed.csv](physics-2025-mixed.csv) | 2025 | [5-2・65頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2025/pdf/5-2.pdf#page=65) | 2025 |
| [policy-economics-2023-mixed.csv](policy-economics-2023-mixed.csv) | 2023 | [5-2・71頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=71) | 2023 |
| [policy-engineering-2023-mixed.csv](policy-engineering-2023-mixed.csv) | 2023 | [5-2・72頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=72) | 2023 |
| [policy-urban-2023-mixed.csv](policy-urban-2023-mixed.csv) | 2023 | [5-2・73頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=73) | 2023 |
| [psychology-2023-mixed.csv](psychology-2023-mixed.csv) | 2023 | [5-2・35頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=35) | 2023 |
| [public-health-nursing-2023-mixed.csv](public-health-nursing-2023-mixed.csv) | 2023 | [5-2・98頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=98) | 2023 |
| [social-economics-2023-mixed.csv](social-economics-2023-mixed.csv) | 2023 | [5-2・20頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=20) | 2023 |
| [social-law-2023-mixed.csv](social-law-2023-mixed.csv) | 2023 | [5-2・18頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=18) | 2023 |
| [social-politics-2023-mixed.csv](social-politics-2023-mixed.csv) | 2023 | [5-2・19頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=19) | 2023 |
| [social-sociology-2023-mixed.csv](social-sociology-2023-mixed.csv) | 2023 | [5-2・17頁](https://www.tsukuba.ac.jp/education/ug-courses-directory/2023/pdf/5-2.pdf#page=17) | 2023 |

## 履修細則PDFの識別情報

2023〜2026年度は `src/features/graduationCheck/curriculum/` の保存済みPDFを使用した。2021・2022年度は上記公式サイトから取得した。

| 年度 | SHA-256（5-2） |
| ---: | --- |
| 2021 | `b2be4ed06b4dfdad6a930de6af217c2a3b3664eb307bb97bb7e8d062a06dfd13` |
| 2022 | `7a61e73099e0f1baa13a1a46ca3e0758c4398fe629526543694013cb573af478` |
| 2023 | `e3ba733af90a4e273fce25959f00bf6a07ab32c762153c5e69ce4213ef2ca647` |
| 2024 | `506f814c8dfc630f414cff49f440ac59cf1fda64306d1581cbd605152ef94c54` |
| 2025 | `54030f8fe0e8d9e096a20e408300381d8f03ccaec08efab0412833c95e890174` |
| 2026 | `745bab5a17c7612ccdf8aa3e6df3b670e2f224b434e895c3d01b36c0d313030b` |
