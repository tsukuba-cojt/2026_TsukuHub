import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { UniversityContext } from "../components/university/universityContextValue";
import { mockCircles, type CircleDetail as Detail } from "../components/circle/mockCircles";
import CircleDetail from "./CircleDetail";

vi.mock("../components/utility/Globalnav", () => ({ default: () => null }));
vi.mock("../components/utility/Footer", () => ({ default: () => null }));

const original = structuredClone(mockCircles[0]);
afterEach(() => { mockCircles[0] = structuredClone(original); });

function render(detail: Partial<Detail>) {
  mockCircles[0] = { ...original, members: "約42名", detail: { ...original.detail, ...detail } };
  return renderToStaticMarkup(
    <UniversityContext.Provider value={{ university: null, loading: false, error: null, path: (value = "/") => value, isFeatureEnabled: () => true }}>
      <MemoryRouter initialEntries={["/circles/c1"]}>
        <Routes><Route path="/circles/:circleId" element={<CircleDetail />} /></Routes>
      </MemoryRouter>
    </UniversityContext.Provider>,
  );
}

describe("サークル詳細の任意項目", () => {
  it("雰囲気が未入力ならブロックを省き、タグのみ・説明のみでも表示できる", () => {
    expect(render({ atmosphereTags: [], atmosphereDescription: "" })).not.toContain("circleDetailMoodText");
    expect(render({ atmosphereTags: [], atmosphereDescription: "" })).not.toContain("circleDetailMoodTags");
    const tagsOnly = render({ atmosphereTags: ["自由な雰囲気"], atmosphereDescription: "" });
    expect(tagsOnly).toContain("自由な雰囲気");
    expect(tagsOnly).not.toContain("circleDetailMoodText");
    const textOnly = render({ atmosphereTags: [], atmosphereDescription: "学年を問わず交流できます" });
    expect(textOnly).toContain("学年を問わず交流できます");
    expect(textOnly).not.toContain("circleDetailMoodTags");
  });

  it("空欄の活動時間・分布・リンクを省略し、所属人数を表示する", () => {
    const html = render({ activityTime: "", gradeMembers: [], facultyRatios: [], links: [] });
    expect(html).not.toContain("<th>活動時間</th>");
    expect(html).not.toContain("circleDetailGrades");
    expect(html).not.toContain("circleDetailRatioBar");
    expect(html).not.toContain("外部リンク・SNS");
    expect(html).toContain('約<strong class="circleNumber">42</strong>名');
  });

  it("学類6年と院4年を区別し、分布合計を所属人数に使わない", () => {
    const html = render({ gradeMembers: [{ grade: 6, count: 2 }, { grade: 4, program: "graduate", count: 3 }] });
    expect(html).toContain('学類<span class="circleNumber">6</span>年');
    expect(html).toContain('院<span class="circleNumber">4</span>年');
    expect(html).toContain('約<strong class="circleNumber">42</strong>名');
  });

  it("入力された活動時間・院のコース・リンクを表示する", () => {
    const html = render({ activityTime: "18:00〜21:00", facultyRatios: [{ name: "情報理工", program: "graduate", percent: 25 }], links: [{ label: "公式サイト", text: "https://example.com/", url: "https://example.com/" }] });
    expect(html).toContain("<th>活動時間</th>");
    expect(html).toContain("18:00〜21:00");
    expect(html).toContain("院：情報理工");
    expect(html).toContain("未入力の割合");
    expect(html).toContain('href="https://example.com/"');
  });
});
