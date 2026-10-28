import type {
  CreditConstraint,
  FulfillmentRule,
  NormalizedCurriculum,
  SourceReference,
  SubjectMatcher,
} from "./types";

export type CurriculumValidationIssue = {
  severity: "error" | "warning";
  code: string;
  path: string;
  message: string;
};

export type CurriculumCompilationAssessment = {
  canCompile: boolean;
  issues: CurriculumValidationIssue[];
};

const isFiniteNonNegative = (value: number | undefined) =>
  value === undefined || (Number.isFinite(value) && value >= 0);

const validateCredits = (
  credits: CreditConstraint,
  path: string,
  issues: CurriculumValidationIssue[]
) => {
  if (
    !isFiniteNonNegative(credits.exact) ||
    !isFiniteNonNegative(credits.minimum) ||
    !isFiniteNonNegative(credits.maximum)
  ) {
    issues.push({
      severity: "error",
      code: "invalid-credit-value",
      path,
      message: "単位数は0以上の有限な数値で指定してください。",
    });
  }
  if (
    credits.exact !== undefined &&
    (credits.minimum !== undefined || credits.maximum !== undefined)
  ) {
    issues.push({
      severity: "error",
      code: "conflicting-credit-constraint",
      path,
      message: "exact は minimum / maximum と併用できません。",
    });
  }
  if (
    credits.minimum !== undefined &&
    credits.maximum !== undefined &&
    credits.minimum > credits.maximum
  ) {
    issues.push({
      severity: "error",
      code: "reversed-credit-range",
      path,
      message: "minimum は maximum 以下である必要があります。",
    });
  }
  if (
    credits.exact === undefined &&
    credits.minimum === undefined &&
    credits.maximum === undefined
  ) {
    issues.push({
      severity: "error",
      code: "empty-credit-constraint",
      path,
      message: "exact / minimum / maximum のいずれかが必要です。",
    });
  }
};

const validateSourceRefs = (
  refs: SourceReference[],
  path: string,
  knownDocuments: Map<string, number | undefined>,
  issues: CurriculumValidationIssue[]
) => {
  if (refs.length === 0) {
    issues.push({
      severity: "error",
      code: "missing-source-reference",
      path,
      message: "判定規則には公式資料の参照が必要です。",
    });
  }
  refs.forEach((ref, index) => {
    const documentExists = knownDocuments.has(ref.documentId);
    const pageCount = knownDocuments.get(ref.documentId);
    if (!documentExists) {
      issues.push({
        severity: "error",
        code: "unknown-source-document",
        path: `${path}[${index}].documentId`,
        message: `未登録の出典文書です: ${ref.documentId}`,
      });
    }
    if (
      ref.pdfPages.length === 0 ||
      ref.pdfPages.some(
        (page) =>
          !Number.isInteger(page) ||
          page < 1 ||
          (pageCount !== undefined && page > pageCount)
      )
    ) {
      issues.push({
        severity: "error",
        code: "invalid-source-pages",
        path: `${path}[${index}].pdfPages`,
        message:
          "PDFページは1以上かつ文書の総ページ数以下の整数を1件以上指定してください。",
      });
    }
  });
};

/** 否定の外側に、区分を確定できる肯定条件が存在するか。 */
const hasPositiveAnchor = (
  matcher: SubjectMatcher,
  negated = false
): boolean => {
  if (matcher.type === "not") {
    return hasPositiveAnchor(matcher.condition, !negated);
  }
  if (matcher.type === "all_of" || matcher.type === "any_of") {
    return matcher.conditions.some((condition) =>
      hasPositiveAnchor(condition, negated)
    );
  }
  return !negated;
};

const validateMatcher = (
  matcher: SubjectMatcher,
  path: string,
  issues: CurriculumValidationIssue[],
  knownCatalogDocuments: Set<string>,
  requirePositiveAnchor = true
) => {
  if (requirePositiveAnchor && !hasPositiveAnchor(matcher)) {
    issues.push({
      severity: "error",
      code: "negative-only-matcher",
      path,
      message:
        "否定条件だけでは科目区分を確定できません。開講組織などの肯定条件が必要です。",
    });
  }
  if (matcher.type === "all_of" || matcher.type === "any_of") {
    if (matcher.conditions.length === 0) {
      issues.push({
        severity: "error",
        code: "empty-logical-matcher",
        path,
        message: "論理条件には1件以上の子条件が必要です。",
      });
    }
    matcher.conditions.forEach((condition, index) =>
      validateMatcher(
        condition,
        `${path}.conditions[${index}]`,
        issues,
        knownCatalogDocuments,
        false
      )
    );
    return;
  }
  if (matcher.type === "not") {
    validateMatcher(
      matcher.condition,
      `${path}.condition`,
      issues,
      knownCatalogDocuments,
      false
    );
    return;
  }
  if (
    matcher.type === "offering_organization" &&
    !matcher.schoolIds?.length &&
    !matcher.collegeIds?.length &&
    !matcher.programIds?.length
  ) {
    issues.push({
      severity: "error",
      code: "empty-organization-matcher",
      path,
      message: "開講組織条件には比較対象の組織IDが必要です。",
    });
  }
  if (
    matcher.type === "course_tag" ||
    matcher.type === "offering_organization" ||
    matcher.type === "external_designation"
  ) {
    if (matcher.resolution === undefined) {
      issues.push({
        severity: "warning",
        code: "matcher-needs-transcript-resolution",
        path,
        message:
          "成績CSVだけでは評価できない条件です。科目番号・科目名による解決結果が必要です。",
      });
    } else {
      if (
        matcher.resolution.method === "catalog_snapshot" &&
        (!matcher.resolution.catalogDocumentId ||
          !knownCatalogDocuments.has(matcher.resolution.catalogDocumentId))
      ) {
        issues.push({
          severity: "error",
          code: "unknown-catalog-resolution-source",
          path: `${path}.resolution.catalogDocumentId`,
          message:
            "カタログによる解決には、登録済み科目カタログの文書IDが必要です。",
        });
      }
      validateMatcher(
        matcher.resolution.matcher,
        `${path}.resolution.matcher`,
        issues,
        knownCatalogDocuments
      );
    }
  }
  if (
    "values" in matcher &&
    Array.isArray(matcher.values) &&
    matcher.values.length === 0
  ) {
    issues.push({
      severity: "error",
      code: "empty-matcher-values",
      path: `${path}.values`,
      message: "照合値を1件以上指定してください。",
    });
  }
};

const validateFulfillment = (
  fulfillment: FulfillmentRule,
  path: string,
  issues: CurriculumValidationIssue[],
  knownCatalogDocuments: Set<string>
) => {
  if (fulfillment.type === "credits_from") {
    validateMatcher(
      fulfillment.matcher,
      `${path}.matcher`,
      issues,
      knownCatalogDocuments
    );
    validateCredits(fulfillment.credits, `${path}.credits`, issues);
    return;
  }
  if (fulfillment.type === "all_courses") {
    if (fulfillment.courses.length === 0) {
      issues.push({
        severity: "error",
        code: "empty-course-list",
        path: `${path}.courses`,
        message: "必修科目を1件以上指定してください。",
      });
    }
    fulfillment.courses.forEach((course, index) => {
      if (!course.code?.trim() && !course.name?.trim()) {
        issues.push({
          severity: "error",
          code: "unidentifiable-course",
          path: `${path}.courses[${index}]`,
          message: "科目番号または科目名が必要です。",
        });
      }
    });
    return;
  }

  const children =
    fulfillment.type === "all_of"
      ? fulfillment.requirements
      : fulfillment.alternatives;
  if (children.length === 0) {
    issues.push({
      severity: "error",
      code: "empty-fulfillment-group",
      path,
      message: "複合要件には1件以上の子要件が必要です。",
    });
  }
  if (
    fulfillment.type === "at_least" &&
    (!Number.isInteger(fulfillment.count) ||
      fulfillment.count < 1 ||
      fulfillment.count > children.length)
  ) {
    issues.push({
      severity: "error",
      code: "invalid-at-least-count",
      path: `${path}.count`,
      message: "count は1以上かつ候補数以下の整数である必要があります。",
    });
  }
  children.forEach((child, index) =>
    validateFulfillment(
      child,
      `${path}.children[${index}]`,
      issues,
      knownCatalogDocuments
    )
  );
};

export const validateNormalizedCurriculum = (
  curriculum: NormalizedCurriculum
): CurriculumValidationIssue[] => {
  const issues: CurriculumValidationIssue[] = [];
  const knownDocuments = new Map<string, number | undefined>();
  const knownCatalogDocuments = new Set<string>();
  curriculum.sourceDocuments.forEach((document, index) => {
    const path = `sourceDocuments[${index}]`;
    if (knownDocuments.has(document.documentId)) {
      issues.push({
        severity: "error",
        code: "duplicate-source-document-id",
        path: `${path}.documentId`,
        message: `出典文書IDが重複しています: ${document.documentId}`,
      });
    }
    if (!Number.isInteger(document.editionYear) || document.editionYear < 1) {
      issues.push({
        severity: "error",
        code: "invalid-source-edition-year",
        path: `${path}.editionYear`,
        message: "出典文書の年度は正の整数で指定してください。",
      });
    }
    if (
      document.pageCount !== undefined &&
      (!Number.isInteger(document.pageCount) || document.pageCount < 1)
    ) {
      issues.push({
        severity: "error",
        code: "invalid-source-page-count",
        path: `${path}.pageCount`,
        message: "出典文書の総ページ数は1以上の整数で指定してください。",
      });
    }
    if (
      document.kind === "official_graduation_requirements" &&
      document.pageCount === undefined
    ) {
      issues.push({
        severity: "error",
        code: "missing-source-page-count",
        path: `${path}.pageCount`,
        message: "卒業要件PDFには総ページ数が必要です。",
      });
    }
    if (
      document.kind === "course_catalog_snapshot" &&
      (!document.sha256 ||
        !document.sourceUrl ||
        !document.repositoryCommit ||
        !document.snapshotDate)
    ) {
      issues.push({
        severity: "error",
        code: "incomplete-catalog-provenance",
        path,
        message:
          "科目カタログにはSHA-256、取得元URL、コミット、スナップショット日が必要です。",
      });
    }
    knownDocuments.set(document.documentId, document.pageCount);
    if (
      document.kind === "official_course_catalog" ||
      document.kind === "course_catalog_snapshot"
    ) {
      knownCatalogDocuments.add(document.documentId);
    }
  });
  if (
    curriculum.applicability.admissionYearTo !== null &&
    curriculum.applicability.admissionYearFrom >
      curriculum.applicability.admissionYearTo
  ) {
    issues.push({
      severity: "error",
      code: "reversed-admission-years",
      path: "applicability",
      message: "入学年度の開始年は終了年以下である必要があります。",
    });
  }
  validateCredits(curriculum.totalCredits, "totalCredits", issues);

  const requirementIds = new Set<string>();
  curriculum.requirements.forEach((requirement, index) => {
    const path = `requirements[${index}]`;
    if (requirementIds.has(requirement.id)) {
      issues.push({
        severity: "error",
        code: "duplicate-requirement-id",
        path: `${path}.id`,
        message: `要件IDが重複しています: ${requirement.id}`,
      });
    }
    requirementIds.add(requirement.id);
    validateFulfillment(
      requirement.fulfillment,
      `${path}.fulfillment`,
      issues,
      knownCatalogDocuments
    );
    validateSourceRefs(
      requirement.sourceRefs,
      `${path}.sourceRefs`,
      knownDocuments,
      issues
    );
    if (requirement.reviewStatus !== "approved") {
      issues.push({
        severity: "warning",
        code: "unapproved-requirement",
        path: `${path}.reviewStatus`,
        message: "未承認の要件は実行用データへコンパイルできません。",
      });
    }
  });

  const aggregateIds = new Set<string>();
  curriculum.aggregateConstraints.forEach((constraint, index) => {
    const path = `aggregateConstraints[${index}]`;
    if (aggregateIds.has(constraint.id)) {
      issues.push({
        severity: "error",
        code: "duplicate-aggregate-id",
        path: `${path}.id`,
        message: `合算制約IDが重複しています: ${constraint.id}`,
      });
    }
    aggregateIds.add(constraint.id);
    if (constraint.targetRequirementIds.length === 0) {
      issues.push({
        severity: "error",
        code: "empty-aggregate-targets",
        path: `${path}.targetRequirementIds`,
        message: "合算制約には1件以上の対象要件が必要です。",
      });
    }
    constraint.targetRequirementIds.forEach((id, targetIndex) => {
      if (!requirementIds.has(id)) {
        issues.push({
          severity: "error",
          code: "unknown-requirement-reference",
          path: `${path}.targetRequirementIds[${targetIndex}]`,
          message: `存在しない要件IDを参照しています: ${id}`,
        });
      }
    });
    validateCredits(constraint.credits, `${path}.credits`, issues);
    validateSourceRefs(
      constraint.sourceRefs,
      `${path}.sourceRefs`,
      knownDocuments,
      issues
    );
  });

  const equivalenceIds = new Set<string>();
  curriculum.equivalencies.forEach((equivalence, index) => {
    const path = `equivalencies[${index}]`;
    if (equivalenceIds.has(equivalence.id)) {
      issues.push({
        severity: "error",
        code: "duplicate-equivalence-id",
        path: `${path}.id`,
        message: `読み替えIDが重複しています: ${equivalence.id}`,
      });
    }
    equivalenceIds.add(equivalence.id);
    if (!equivalence.target.code?.trim() && !equivalence.target.name?.trim()) {
      issues.push({
        severity: "error",
        code: "unidentifiable-equivalence-target",
        path: `${path}.target`,
        message: "読み替え先には科目番号または科目名が必要です。",
      });
    }
    validateFulfillment(
      equivalence.alternative,
      `${path}.alternative`,
      issues,
      knownCatalogDocuments
    );
    validateSourceRefs(
      equivalence.sourceRefs,
      `${path}.sourceRefs`,
      knownDocuments,
      issues
    );
  });

  const additionalConstraintIds = new Set<string>();
  curriculum.additionalConstraints.forEach((constraint, index) => {
    const path = `additionalConstraints[${index}]`;
    if (additionalConstraintIds.has(constraint.id)) {
      issues.push({
        severity: "error",
        code: "duplicate-additional-constraint-id",
        path: `${path}.id`,
        message: `追加制約IDが重複しています: ${constraint.id}`,
      });
    }
    additionalConstraintIds.add(constraint.id);
    validateSourceRefs(
      constraint.sourceRefs,
      `${path}.sourceRefs`,
      knownDocuments,
      issues
    );
    if (constraint.type === "prerequisite") {
      if (!requirementIds.has(constraint.targetRequirementId)) {
        issues.push({
          severity: "error",
          code: "unknown-prerequisite-target",
          path: `${path}.targetRequirementId`,
          message: `存在しない要件IDを参照しています: ${constraint.targetRequirementId}`,
        });
      }
      validateFulfillment(
        constraint.prerequisite,
        `${path}.prerequisite`,
        issues,
        knownCatalogDocuments
      );
    } else if (
      constraint.type === "minimum_gpa" &&
      (!Number.isFinite(constraint.minimum) || constraint.minimum < 0)
    ) {
      issues.push({
        severity: "error",
        code: "invalid-gpa-constraint",
        path: `${path}.minimum`,
        message: "GPA条件は0以上の有限な数値で指定してください。",
      });
    } else if (
      constraint.type === "manual_review" &&
      constraint.blocksCompilation
    ) {
      issues.push({
        severity: "warning",
        code: "manual-review-blocks-compilation",
        path,
        message: "未構造化の条件を解決するまでコンパイルできません。",
      });
    }
  });

  const modeledIds = new Set([
    ...requirementIds,
    ...aggregateIds,
    ...equivalenceIds,
    ...additionalConstraintIds,
  ]);
  if (curriculum.sourceCoverage.length === 0) {
    issues.push({
      severity: "error",
      code: "missing-source-coverage",
      path: "sourceCoverage",
      message: "表セル・注記の拾い漏れを確認する出典台帳が必要です。",
    });
  }
  const coverageIds = new Set<string>();
  curriculum.sourceCoverage.forEach((item, index) => {
    const path = `sourceCoverage[${index}]`;
    if (coverageIds.has(item.id)) {
      issues.push({
        severity: "error",
        code: "duplicate-source-coverage-id",
        path: `${path}.id`,
        message: `出典台帳IDが重複しています: ${item.id}`,
      });
    }
    coverageIds.add(item.id);
    validateSourceRefs([item.sourceRef], `${path}.sourceRef`, knownDocuments, issues);
    if (item.disposition.type === "modeled") {
      const targetIds = item.disposition.targetIds ?? [];
      const targetPaths = item.disposition.targetPaths ?? [];
      if (targetIds.length === 0 && targetPaths.length === 0) {
        issues.push({
          severity: "error",
          code: "empty-source-coverage-targets",
          path: `${path}.disposition.targetIds`,
          message: "モデル化済みの出典には対応する規則IDまたは項目パスが必要です。",
        });
      }
      targetIds.forEach((targetId, targetIndex) => {
        if (!modeledIds.has(targetId)) {
          issues.push({
            severity: "error",
            code: "unknown-source-coverage-target",
            path: `${path}.disposition.targetIds[${targetIndex}]`,
            message: `存在しない規則IDを参照しています: ${targetId}`,
          });
        }
      });
    } else if (
      item.disposition.type === "manual_review" &&
      item.disposition.blocksCompilation
    ) {
      issues.push({
        severity: "warning",
        code: "source-coverage-blocks-compilation",
        path: `${path}.disposition`,
        message: "未解決の出典断片があるためコンパイルできません。",
      });
    }
  });

  if (curriculum.review.status !== "approved") {
    issues.push({
      severity: "warning",
      code: "unapproved-curriculum",
      path: "review.status",
      message: "カリキュラム全体のレビューが完了していません。",
    });
  }

  return issues;
};

/**
 * 現在のwarningはすべて、未解決matcher・未承認・手動確認待ちを表す。
 * そのためerrorだけでなくwarningが1件でもある間は実行形式へ進めない。
 */
export const assessCurriculumCompilation = (
  curriculum: NormalizedCurriculum
): CurriculumCompilationAssessment => {
  const issues = validateNormalizedCurriculum(curriculum);
  return { canCompile: issues.length === 0, issues };
};

