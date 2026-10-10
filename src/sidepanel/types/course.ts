export type RawCourse = {
  id: number;
  fullname: string;
  idnumber: string | null;
  viewurl: string;
  coursecategory: string;
};

export type Course = {
  id: number;
  title: string;
  lecturer: string | null;
  day: number | null;
  period: number | null; // 1 to 8. null for online and special courses
  isOnline: boolean;
  category: string;
  link: string;
};
