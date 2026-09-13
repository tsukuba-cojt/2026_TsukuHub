export type CatalogCourse = {
  course_number: string;
  course_name: string;
  method: string;
  credits: string;
  target_year: string;
  semester: string;
  schedule: string;
  instructor: string;
  overview: string;
  remarks: string;
  /** 外部シラバス URL（大阪: KOAN 外部シラバス等） */
  syllabus_url?: string;
};

export type CourseCatalogFile = {
  university: string;
  updated: string;
  source?: string;
  courses: CatalogCourse[];
};
