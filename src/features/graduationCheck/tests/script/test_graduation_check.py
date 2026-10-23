"""data/*.csv を実装本体で解析・判定し、同名の *.expected.json と比較する。"""

from __future__ import annotations

import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


TESTS_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = TESTS_ROOT.parents[3]
DATA_ROOT = TESTS_ROOT / "data"


class GraduationCheckCsvTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if shutil.which("node") is None:
            raise RuntimeError("Node.js が必要です。")
        compiler = PROJECT_ROOT / "node_modules/typescript/bin/tsc"
        if not compiler.is_file():
            raise RuntimeError("プロジェクトルートで npm ci を実行してください。")

        # 本体のTypeScriptを一度コンパイルする。生成物は一時ディレクトリに隔離。
        temporary = tempfile.TemporaryDirectory(prefix="graduation-check-")
        cls.addClassCleanup(temporary.cleanup)
        output = Path(temporary.name)
        result = subprocess.run(
            [
                "node", str(compiler), "--ignoreConfig",
                "--target", "ES2023", "--module", "commonjs",
                "--moduleResolution", "node", "--ignoreDeprecations", "6.0",
                "--esModuleInterop", "--skipLibCheck", "--types", "node",
                "--outDir", str(output),
                str(TESTS_ROOT / "script/run_graduation_check.ts"),
            ],
            cwd=PROJECT_ROOT, capture_output=True, text=True, encoding="utf-8",
            timeout=120,
        )
        if result.returncode:
            raise RuntimeError(f"TypeScriptのコンパイルに失敗:\n{result.stdout}{result.stderr}")
        cls.runner = output / "tests/script/run_graduation_check.js"
        cls.node_environment = {
            **os.environ,
            "NODE_PATH": str(PROJECT_ROOT / "node_modules"),
        }

    def assert_expected(self, actual: object, expected: object, path: str) -> None:
        """JSONの指定項目を再帰比較。配列は全要素、浮動小数点は誤差を許容する。"""
        if isinstance(expected, dict):
            self.assertIsInstance(actual, dict, path)
            for key, value in expected.items():
                self.assertIn(key, actual, f"{path}.{key}")
                self.assert_expected(actual[key], value, f"{path}.{key}")
        elif isinstance(expected, list):
            self.assertIsInstance(actual, list, path)
            self.assertEqual(len(actual), len(expected), path)
            for index, value in enumerate(expected):
                self.assert_expected(actual[index], value, f"{path}[{index}]")
        elif isinstance(expected, float):
            self.assertIsInstance(actual, (int, float), path)
            self.assertAlmostEqual(actual, expected, places=9, msg=path)
        else:
            self.assertEqual(actual, expected, path)

    def test_all_csv_fixtures(self) -> None:
        csv_files = sorted(DATA_ROOT.glob("*.csv"))
        self.assertTrue(csv_files, f"CSVがありません: {DATA_ROOT}")
        self.assertEqual(
            {file.stem for file in csv_files},
            {file.name.removesuffix(".expected.json") for file in DATA_ROOT.glob("*.expected.json")},
            "各CSVと同名の .expected.json を1対1で配置してください。",
        )
        for csv_file in csv_files:
            with self.subTest(csv=csv_file.name):
                fixture = json.loads(csv_file.with_suffix(".expected.json").read_text(encoding="utf-8"))
                expected = fixture["expected"]
                # 空の期待値や空CSVを通過させない。主要な集計値は各ケースで明示する。
                self.assertGreater(expected["courseCount"], 0)
                for key in ("csvErrors", "summary", "categories", "gpa", "assignments"):
                    self.assertIn(key, expected)
                result = subprocess.run(
                    ["node", str(self.runner)],
                    input=json.dumps({
                        "csvText": csv_file.read_text(encoding="utf-8-sig"),
                        "selection": fixture["selection"],
                        "publicRoot": str(PROJECT_ROOT / "public"),
                    }),
                    cwd=PROJECT_ROOT, env=self.node_environment,
                    capture_output=True, text=True, encoding="utf-8", timeout=30,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                actual = json.loads(result.stdout)
                # 全科目の分類を完全一致で確認する。その他のレポート項目は部分一致。
                self.assertEqual(actual["assignments"], expected["assignments"], csv_file.name)
                self.assertEqual(len(actual["assignments"]), actual["courseCount"], csv_file.name)
                self.assert_expected(actual, expected, csv_file.name)


if __name__ == "__main__":
    unittest.main(verbosity=2)
