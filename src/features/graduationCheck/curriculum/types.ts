/**
 * 公式資料から正規化した卒業要件の交換形式。
 *
 * これはPDF抽出直後のRaw形式でも、ブラウザが直接評価するコンパイル済み形式でもない。
 * 出典を保持したまま人手確認・静的検証を行うための中間表現である。
 */

export type CurriculumArea =
  | "specialized"
  | "specialized_foundation"
  | "basic_common"
  | "basic_related"
  | "other";

export type RequirementKind =
  | "required"
  | "elective_required"
  | "elective"
  | "free";

export type CreditConstraint = {
  /** 固定値。指定時は minimum / maximum と併用しない */
  exact?: number;
  minimum?: number;
  /** 卒業単位へ計上できる上限。履修可能上限とは区別する */
  maximum?: number;
  /** 公式資料上の表記。判定には使用しない */
  displayText?: string;
};

export type SourceReference = {
  documentId: string;
  /** PDFファイル先頭を1としたページ番号。冊子に印刷されたページ番号とは別物。 */
  pdfPages: number[];
  /** 「160」「別表第1」など、原資料上に印刷されたページ・別表の表示。 */
  printedPageLabels?: string[];
  tableName?: string;
  cell?: string;
  note?: string;
  rawText?: string;
};

export type SourceDocument = {
  documentId: string;
  fileName: string;
  kind:
    | "official_graduation_requirements"
    | "official_course_catalog"
    | "course_catalog_snapshot"
    | "other";
  /** ファイル名の年度。入学年度とは独立して扱う。 */
  editionYear: number;
  /** PDFなどページを持つ資料だけが指定する。 */
  pageCount?: number;
  sha256?: string;
  sourceUrl?: string;
  repositoryCommit?: string;
  snapshotDate?: string;
  retrievedAt?: string;
  license?: string;
  provenanceNote?: string;
};

export type CurriculumApplicability = {
  admissionYearFrom: number;
  admissionYearTo: number | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  transitionRuleText?: string | null;
};

export type CourseReference = {
  code?: string;
  name?: string;
  aliases?: string[];
  expectedCredits?: number;
};

/** 成績CSVに常に存在する科目番号・科目名だけで実行できる照合条件。 */
export type TranscriptSubjectMatcher =
  | { type: "all_courses" }
  | { type: "course_code"; values: string[] }
  | { type: "course_name"; values: string[] }
  | { type: "code_prefix"; values: string[] }
  | {
      type: "code_range";
      from: string;
      to: string;
      inclusive?: boolean;
    }
  | { type: "all_of"; conditions: TranscriptSubjectMatcher[] }
  | { type: "any_of"; conditions: TranscriptSubjectMatcher[] }
  | { type: "not"; condition: TranscriptSubjectMatcher };

export type MatcherResolution = {
  /** DBなしでは manual、固定した科目カタログを使う場合だけ catalog_snapshot。 */
  method: "manual" | "catalog_snapshot";
  matcher: TranscriptSubjectMatcher;
  catalogDocumentId?: string;
  note?: string;
};

export type SubjectMatcher =
  | { type: "all_courses" }
  | { type: "course_code"; values: string[] }
  | { type: "course_name"; values: string[] }
  | { type: "code_prefix"; values: string[] }
  | {
      type: "code_range";
      from: string;
      to: string;
      inclusive?: boolean;
    }
  | { type: "course_tag"; values: string[]; resolution?: MatcherResolution }
  | {
      type: "offering_organization";
      operator: "inside" | "outside";
      schoolIds?: string[];
      collegeIds?: string[];
      programIds?: string[];
      resolution?: MatcherResolution;
    }
  | {
      type: "external_designation";
      designationId: string;
      resolution?: MatcherResolution;
    }
  | { type: "all_of"; conditions: SubjectMatcher[] }
  | { type: "any_of"; conditions: SubjectMatcher[] }
  | { type: "not"; condition: SubjectMatcher };

export type FulfillmentRule =
  | {
      type: "credits_from";
      matcher: SubjectMatcher;
      credits: CreditConstraint;
    }
  | {
      type: "all_courses";
      courses: CourseReference[];
    }
  | {
      type: "all_of";
      requirements: FulfillmentRule[];
    }
  | {
      type: "any_of";
      alternatives: FulfillmentRule[];
    }
  | {
      type: "at_least";
      count: number;
      alternatives: FulfillmentRule[];
    };

export type RequirementPlacement = {
  /** 公式表の横軸（専門、専門基礎、共通、関連） */
  area: CurriculumArea;
  /** 公式表の縦軸（必修、選択必修、選択、自由） */
  kind: RequirementKind;
};

export type RequirementRule = {
  id: string;
  label: string;
  placement: RequirementPlacement;
  fulfillment: FulfillmentRule;
  applicability?: Partial<CurriculumApplicability>;
  allocation?: {
    priority?: number;
    allowDoubleCounting?: boolean;
  };
  sourceRefs: SourceReference[];
  notes?: string[];
  reviewStatus: "unreviewed" | "needs_review" | "approved";
};

export type AggregateConstraint = {
  id: string;
  label: string;
  targetRequirementIds: string[];
  credits: CreditConstraint;
  applicability?: Partial<CurriculumApplicability>;
  sourceRefs: SourceReference[];
};

export type CourseEquivalence = {
  id: string;
  target: CourseReference;
  alternative: FulfillmentRule;
  applicability?: Partial<CurriculumApplicability>;
  sourceRefs: SourceReference[];
};

export type AdditionalConstraint =
  | {
      id: string;
      type: "prerequisite";
      /** この要件を満たす前に prerequisite を満たす必要がある */
      targetRequirementId: string;
      prerequisite: FulfillmentRule;
      sourceRefs: SourceReference[];
    }
  | {
      id: string;
      type: "minimum_gpa";
      minimum: number;
      scope: "graduation" | "early_graduation" | "progression";
      sourceRefs: SourceReference[];
    }
  | {
      id: string;
      type: "manual_review";
      conditionText: string;
      /** true の条件が残るカリキュラムは実行用形式へコンパイルしない */
      blocksCompilation: boolean;
      sourceRefs: SourceReference[];
    };

export type SourceCoverageItem = {
  id: string;
  label: string;
  kind: "table_cell" | "footnote" | "provision" | "transition_clause";
  sourceRef: SourceReference;
  disposition:
    | {
        type: "modeled";
        /** Requirement / Aggregate / Equivalence / AdditionalConstraint のID。 */
        targetIds?: string[];
        /** applicabilityやtotalCreditsなど、IDを持たない項目への参照。 */
        targetPaths?: ("applicability" | "totalCredits" | "allocationPolicy")[];
      }
    | {
        type: "not_applicable";
        reason: string;
      }
    | {
        type: "manual_review";
        issue: string;
        blocksCompilation: boolean;
      };
};

export type NormalizedCurriculum = {
  schemaVersion: "normalized-curriculum-1.0.0";
  curriculumId: string;
  sourceDocuments: SourceDocument[];
  organization: {
    universityId: string;
    schoolId: string;
    schoolName: string;
    collegeId: string;
    collegeName: string;
    programId: string | null;
    programName: string | null;
  };
  applicability: CurriculumApplicability;
  totalCredits: CreditConstraint;
  requirements: RequirementRule[];
  aggregateConstraints: AggregateConstraint[];
  equivalencies: CourseEquivalence[];
  additionalConstraints: AdditionalConstraint[];
  /** 関係する表セル・注記を一件ずつ棚卸しし、拾い漏れを検出する台帳。 */
  sourceCoverage: SourceCoverageItem[];
  allocationPolicy: {
    allowDoubleCounting: boolean;
    onMultipleMatch: "ambiguous" | "priority";
    onNoMatch: "unclassified";
  };
  notes: string[];
  review: {
    status: "unreviewed" | "needs_review" | "approved";
    reviewedBy?: string;
    reviewedAt?: string;
  };
};

