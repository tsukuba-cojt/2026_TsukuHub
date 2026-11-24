import { beforeEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), storageFrom: vi.fn(), upload: vi.fn() }));
vi.mock("../lib/supabase", () => ({ supabase: { rpc: mocks.rpc, storage: { from: mocks.storageFrom } } }));
import { publishMenuPhotos, uploadMenuPhoto } from "./cafeteriaMenuService";
beforeEach(() => { vi.clearAllMocks(); mocks.storageFrom.mockReturnValue({ upload: mocks.upload }); });
test("写真を選択した全学食へ、前回更新日時を添えて一括登録する", async () => {
  mocks.rpc.mockResolvedValue({ data: [], error: null });
  await publishMenuPhotos([{ university_id: "school", cafeteria_id: "one", name: "1" }, { university_id: "school", cafeteria_id: "two", name: "2" }], "2026-11-24", "owner/photo.jpg", { "school/one": "previous" });
  expect(mocks.rpc).toHaveBeenCalledWith("publish_cafeteria_photos", {
    p_targets: [{ university_id: "school", cafeteria_id: "one", expected_updated_at: "previous" }, { university_id: "school", cafeteria_id: "two", expected_updated_at: null }],
    p_menu_date: "2026-11-24", p_photo_path: "owner/photo.jpg",
  });
});
test("未選択なら保存せず、競合エラーを隠さない", async () => {
  await expect(publishMenuPhotos([], "2026-11-24", "p", {})).rejects.toThrow("担当学食");
  expect(mocks.rpc).not.toHaveBeenCalled();
  const error = new Error("conflict"); mocks.rpc.mockResolvedValue({ error });
  await expect(publishMenuPhotos([{ university_id: "s", cafeteria_id: "c", name: "c" }], "2026-11-24", "p", {})).rejects.toBe(error);
});
test("非画像ファイルをアップロードしない", async () => {
  await expect(uploadMenuPhoto({ type: "text/html", size: 100 } as File, "u")).rejects.toThrow();
  expect(mocks.upload).not.toHaveBeenCalled();
});
