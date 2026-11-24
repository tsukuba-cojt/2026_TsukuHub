/** 将来のDB接続用契約。現在のmockCirclesとは独立し、DB接続は行わない。
 * カラム・制約・保存手順: docs/circle-data-model.md
 * UUID、ISO日付、ISO日時はDB/API境界で検証する。
 */
type UUID = string;
type ISODate = string;
type ISODateTime = string;

export type CircleCategoryCode = "culture" | "sports" | "academic" | "volunteer";
export type CircleOrganizationCode = "recognized" | "unrecognized";
export type CirclePublicationStatus = "draft" | "published" | "archived";
export type CircleAcademicProgram = "undergraduate" | "graduate";
export type CircleTagKind = "feature" | "atmosphere";

export type CircleRow = {
  id: UUID;
  university_id: UUID;
  name: string;
  category: CircleCategoryCode;
  organization_type: CircleOrganizationCode;
  description: string;
  members_count: number;
  activity_days: string | null;
  activity_time: string | null;
  activity_place: string | null;
  fee_description: string | null;
  image_storage_path: string | null;
  atmosphere_description: string | null;
  additional_info: string | null;
  status: CirclePublicationStatus;
  version: number;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

/** 学群・研究群ごとに表示する学類・学位プログラム・専攻の選択肢。 */
export type AcademicAffiliationRow = {
  id: UUID;
  university_id: UUID;
  program: CircleAcademicProgram;
  code: string;
  group_name: string;
  name: string;
  is_active: boolean;
  source_url: string | null;
  checked_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

// programとgradeの組で学類1〜6年、院1〜4年を表す。
export type CircleGradeCount =
  | { program: "undergraduate"; grade: 1 | 2 | 3 | 4 | 5 | 6; count: number }
  | { program: "graduate"; grade: 1 | 2 | 3 | 4; count: number };

export type CircleGradeMemberRow = CircleGradeCount & { circle_id: UUID };

export type CircleAffiliationRatio = {
  affiliation_id: UUID | null;
  program: CircleAcademicProgram;
  name_snapshot: string;
  percent: number;
  position: number;
};

export type CircleAffiliationRatioRow = CircleAffiliationRatio & {
  id: UUID;
  circle_id: UUID;
};

export type CircleTagValue = { kind: CircleTagKind; name: string; position: number };
export type CircleTagRow = CircleTagValue & { circle_id: UUID };

export type CircleLinkValue = { label: string; url: string; position: number };
export type CircleLinkRow = CircleLinkValue & { id: UUID; circle_id: UUID };

export type CircleNoticeRow = {
  id: UUID;
  circle_id: UUID;
  notice_date: ISODate;
  title: string;
  body: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

/** 掲載する所属人数とは別の、サークル情報を編集できるアカウント。 */
export type CircleEditorRow = {
  circle_id: UUID;
  user_id: UUID;
  role: "owner" | "editor";
  created_at: ISODateTime;
};

export type CircleEditableFields = Pick<CircleRow,
  | "name" | "category" | "description" | "members_count"
  | "activity_days" | "activity_time" | "activity_place"
  | "fee_description" | "image_storage_path" | "atmosphere_description" | "additional_info"
>;

/** 全項目保存。配列の省略を許さず、空配列は削除を意味する。
 * 認証ユーザーと大学・編集権限はサーバー側で検証する。
 * status / organization_type / editors は別の権限付き操作で管理する。
 */
export type CircleSaveInput = {
  circle_id: UUID;
  expected_version: number;
  fields: CircleEditableFields;
  grade_members: CircleGradeCount[];
  affiliation_ratios: CircleAffiliationRatio[];
  tags: CircleTagValue[];
  links: CircleLinkValue[];
  notices: Array<Pick<CircleNoticeRow, "notice_date" | "title" | "body"> & { id: UUID | null }>;
};

/** 編集画面で読むまとまり。口コミはページングする別APIで取得する。 */
export type CircleManagementData = {
  circle: CircleRow;
  grade_members: CircleGradeMemberRow[];
  affiliation_ratios: CircleAffiliationRatioRow[];
  tags: CircleTagRow[];
  links: CircleLinkRow[];
  notices: CircleNoticeRow[];
};
