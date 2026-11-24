import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { UniversityContext } from "../components/university/universityContextValue";
import { mockCircles } from "../components/circle/mockCircles";
import CircleEdit from "./CircleEdit";

vi.mock("../components/utility/Globalnav", () => ({ default: () => null }));
vi.mock("../components/utility/Footer", () => ({ default: () => null }));

const original = structuredClone(mockCircles[0]);
afterEach(() => { mockCircles[0] = structuredClone(original); });

function renderEditor() {
  return renderToStaticMarkup(
    <UniversityContext.Provider value={{ university: null, loading: false, error: null, path: (value = "/") => `/tsukuba${value}`, isFeatureEnabled: () => true }}>
      <MemoryRouter initialEntries={["/tsukuba/circles/c1/edit"]}>
        <Routes><Route path="/:universitySlug/circles/:circleId/edit" element={<CircleEdit />} /></Routes>
      </MemoryRouter>
    </UniversityContext.Provider>,
  );
}

describe("サークル編集画面の雰囲気入力", () => {
  it("編集URLで雰囲気のタグ・説明欄と既存の値を表示する", () => {
    const html = renderEditor();
    expect(html).toContain('id="circleEditAtmosphereTags"');
    expect(html).toContain('id="circleEditAtmosphereDescription"');
    expect(html).toContain(original.detail.atmosphereDescription);
    expect(html).toContain(`#${original.detail.atmosphereTags[0]}`);
  });

  it("雰囲気が未入力でも編集用の入力欄を表示する", () => {
    mockCircles[0].detail.atmosphereTags = [];
    mockCircles[0].detail.atmosphereDescription = "";
    const html = renderEditor();
    expect(html).toContain('id="circleEditAtmosphereTags"');
    expect(html).toContain('id="circleEditAtmosphereDescription"');
  });
});
