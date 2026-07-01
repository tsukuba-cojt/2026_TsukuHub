import Globalnav from "../components/utility/Globalnav";
import Footer from "../components/utility/Footer";
import ClassSearchPanel from "../components/class/ClassSearchPanel";
import ClassSortBar from "../components/class/ClassSortBar";
import ClassCard, { type ClassCourse } from "../components/class/ClassCard";
import ClassPagination from "../components/class/ClassPagination";
import "../styles/class/Class.css";

const courses: ClassCourse[] = [
  {
    id: "psychology-1",
    code: "ABC1234",
    category: "人文・文化学群",
    categoryTone: "coral",
    title: "心理学入門",
    teacher: "山田 太郎",
    term: "春A",
    period: "月2・3",
    credits: "2単位",
    rating: 4.0,
    reviews: 32,
  },
  {
    id: "data-science",
    code: "ABC1234",
    category: "情報学群",
    categoryTone: "cyan",
    title: "データサイエンス入門",
    teacher: "山田 太郎",
    term: "春A",
    period: "月2・3",
    credits: "2単位",
    rating: 4.2,
    reviews: 32,
  },
  {
    id: "psychology-2",
    code: "ABC1234",
    category: "人文・文化学群",
    categoryTone: "coral",
    title: "心理学入門",
    teacher: "山田 太郎",
    term: "春A",
    period: "月2・3",
    credits: "2単位",
    rating: 4.0,
    reviews: 32,
  },
  {
    id: "psychology-3",
    code: "ABC1234",
    category: "人文・文化学群",
    categoryTone: "coral",
    title: "心理学入門",
    teacher: "山田 太郎",
    term: "春A",
    period: "月2・3",
    credits: "2単位",
    rating: 4.0,
    reviews: 32,
  },
];

function Class() {
  return (
    <div className="classPage">
      <Globalnav />
      <main className="classPageLayout">
        <p className="classBreadcrumb">ホーム &gt; 授業・履修</p>
        <ClassSearchPanel />
        <ClassSortBar />
        <div className="classCourseList">
          {courses.map((course) => (
            <ClassCard course={course} key={course.id} />
          ))}
        </div>
        <ClassPagination />
      </main>
      <Footer />
    </div>
  );
}

export default Class;
