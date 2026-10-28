// サークル口コミの送信処理。
// 授業側（classReviewService.createClassReview）と同じインターフェースにしているが、
// サークル口コミ用の Supabase テーブルが未作成のため、現時点では insert を行わずエラーを返す。
// テーブル作成後は下のコメントアウト部分を有効化する（カラム名は授業側の命名規則に合わせた案）。

export type CircleReviewInput = {
  circleId: string;
  rating: number;
  activityFrequency: string;
  intensity: string;
  annualCost: string;
  beginnerFriendly: string;
  compatibility: string;
  reviewerStatus: string;
  comment: string;
  anonymous: boolean;
};

export const createCircleReview = async (input: CircleReviewInput, universityId: string) => {
  // const { error } = await supabase.from("circle_reviews").insert({
  //   circle_id: input.circleId,
  //   university_id: universityId,
  //   rating: input.rating,
  //   activity_frequency: input.activityFrequency || null,
  //   intensity: input.intensity || null,
  //   annual_cost: input.annualCost || null,
  //   beginner_friendly: input.beginnerFriendly || null,
  //   compatibility: input.compatibility || null,
  //   reviewer_status: input.reviewerStatus || null,
  //   comment: input.comment.trim() || null,
  //   anonymous: input.anonymous,
  // });
  // if (error) throw error;
  void input;
  void universityId;
  throw new Error("circle_reviews テーブルが未作成です");
};
