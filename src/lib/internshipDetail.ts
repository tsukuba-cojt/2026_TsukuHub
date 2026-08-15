export const splitSelectionSteps = (value: string) =>
  value
    .split(/\s*(?:→|➡|＞|>|／|\/|、|,)+\s*/)
    .map((step) => step.trim())
    .filter(Boolean);
