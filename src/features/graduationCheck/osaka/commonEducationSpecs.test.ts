import { describe, expect, it } from "vitest";
import {
  buildCommonEducationRules,
  commonEducationSpecs,
  getCommonEducationSpec,
} from "./data/requirements/commonEducation";

const commonGroupMin = (spec: ReturnType<typeof getCommonEducationSpec>) => {
  if (spec.dentistryHumanitiesSocial) {
    return 4 + spec.info;
  }
  let min =
    spec.humanities +
    spec.social +
    spec.comprehensive +
    spec.info;
  if (!spec.excludeNaturalSciences) min += spec.natural;
  return min;
};

describe("osaka common education specs (24 disciplines)", () => {
  it.each(Object.keys(commonEducationSpecs))(
    "%s has valid spec and select rules",
    (specKey) => {
      const spec = getCommonEducationSpec(specKey);
      const rules = buildCommonEducationRules(spec);
      expect(rules.selectMinimumUnit).toBeGreaterThan(0);
      expect(rules.groups).toHaveLength(4);
      expect(rules.groups[0][1]).toBe(commonGroupMin(spec));
      expect(rules.groups[1][1]).toBe(spec.foundation);
      expect(rules.groups[2][1]).toBe(spec.specialized);
    }
  );
});
