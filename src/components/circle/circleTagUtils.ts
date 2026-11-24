export const CIRCLE_TAG_LIMIT = 10;
export const CIRCLE_TAG_LENGTH = 30;

// #の有無や区切り方にかかわらず、保存するタグは単語の配列に揃える。
export function addCircleTags(current: string[], input: string): { tags: string[]; error?: string } {
  const tags = [...new Set([...current, ...input.split(/[\s,、，#＃]+/u)].filter(Boolean))];
  if (tags.some((tag) => Array.from(tag).length > CIRCLE_TAG_LENGTH)) {
    return { tags: current, error: `タグは1つ${CIRCLE_TAG_LENGTH}文字以内で入力してください` };
  }
  if (tags.length > CIRCLE_TAG_LIMIT) {
    return { tags: current, error: `タグは${CIRCLE_TAG_LIMIT}個まで追加できます` };
  }
  return { tags };
}
