export type CatalogCourse = {
  academic_year?: number;
  course_number: string;
  course_name: string;
  method: string;
  credits: string;
  target_year: string;
  semester: string;
  schedule: string;
  classroom?: string;
  instructor: string;
  overview: string;
  remarks: string;
};

export type CourseCatalogFile = {
  schema_version?: string;
  university: string;
  academic_year?: number;
  updated: string;
  source?: string;
  source_url?: string;
  source_sha256?: string;
  repository_commit?: string;
  source_row_count?: number;
  skipped_row_count?: number;
  duplicate_course_code_count?: number;
  parse_warning_count?: number;
  courses: CatalogCourse[];
};
