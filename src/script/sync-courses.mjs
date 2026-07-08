import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

const CSV_URL =
  "https://raw.githubusercontent.com/Mimori256/kdb-parse/main/kdb.csv";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,        
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

async function main() {
  // 1. CSVを取得
  const res = await fetch(CSV_URL);
  const csvText = await res.text();

  // 2. パース
  const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  // 3. Supabase用にマッピング
  const rows = data.map((row) => ({
    course_number: row["科目番号"],
    course_name: row["科目名"],
    method: row["授業方法"],
    credits: row["単位数"],
    target_year: row["標準履修年次"],
    semester: row["実施学期"],
    schedule: row["曜時限"],
    classroom: row["教室"],
    instructor: row["担当教員"],
    overview: row["授業概要"],
    remarks: row["備考"],
    auditor_eligible: row["科目等履修生申請可否"],
    auditor_conditions: row["申請条件"],
    course_name_en: row["英語(日本語)科目名"],
    course_code: row["科目コード"],
    requirement_name: row["要件科目名"],
    data_updated_at: row["データ更新日"],
    synced_at: new Date().toISOString(),
  }));

  // 4. バッチUPSERT（1000件ずつ）
  const BATCH_SIZE = 1000;
  let total = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("courses")
      .upsert(batch, { onConflict: "course_number" });

    if (error) {
      console.error(`Batch ${i} failed:`, error.message);
      process.exit(1);
    }
    total += batch.length;
  }

  console.log(`Synced ${total} courses successfully.`);
}

main();