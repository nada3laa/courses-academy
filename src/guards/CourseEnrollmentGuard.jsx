import { useContext } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { courses } from "../data/staticData";
import { isEnrolledInCourse } from "../utils/courseEnrollments";

export default function CourseEnrollmentGuard({ children }) {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const course = courses.find((item) => item.slug === slug);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `/my-courses/${slug}` }} />;
  }

  if (!course || !isEnrolledInCourse(user, slug)) {
    return <Navigate to={course ? `/courses/${slug}` : "/courses"} replace />;
  }

  return children;
}
