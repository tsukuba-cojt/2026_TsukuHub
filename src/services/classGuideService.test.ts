import { beforeEach, expect, test, vi } from "vitest";
import type { ClassGuideArticleInput } from "../types/classGuide";
const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("../lib/supabase", () => ({ supabase: { from: mocks.from } }));
import { listAdminClassGuides, saveClassGuide } from "./classGuideService";

const input: ClassGuideArticleInput = {
  category: "course_selection", title: "授業の選び方", description: "", content: "本文",
  badge_label: null, cover_image_url: null, cover_theme: "selection", read_minutes: 5,
  sort_order: 0, published_at: "2026-11-20", status: "draft",
};
beforeEach(() => vi.clearAllMocks());

test("掲載大学なしでは記事を書き込まない", async () => {
  await expect(saveClassGuide(null, input, [])).rejects.toThrow("掲載対象大学");
  expect(mocks.from).not.toHaveBeenCalled();
});

test("一覧の対象大学を編集用に変換し、リレーションを保存内容に混ぜない", async () => {
  const query = { select: vi.fn(), order: vi.fn() };
  query.select.mockReturnValue(query);
  query.order.mockReturnValueOnce(query).mockResolvedValueOnce({ data: [{ ...input, id: "article", class_guide_article_universities: [{ university_id: "school" }] }], error: null });
  mocks.from.mockReturnValue(query);
  const [article] = await listAdminClassGuides();
  expect(article.university_ids).toEqual(["school"]);
  expect(article).not.toHaveProperty("class_guide_article_universities");
});

test("新しい掲載大学の登録が失敗しても以前の対象大学を削除しない", async () => {
  const error = new Error("target insert failed");
  const article = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { id: "article" }, error: null }) };
  const targets = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [{ university_id: "old" }], error: null }), upsert: vi.fn().mockResolvedValue({ error }), delete: vi.fn() };
  mocks.from.mockImplementation((table) => table === "class_guide_articles" ? article : targets);
  await expect(saveClassGuide("article", input, ["new"])).rejects.toBe(error);
  expect(targets.delete).not.toHaveBeenCalled();
});
