import { useContext, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { fetchCourseAccess, fetchPublicCourse } from '../features/course-management/api/coursesApi';

export default function CourseEnrollmentGuard({ children }) {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchPublicCourse(slug).then((course) => fetchCourseAccess(course.id)).then((access) => {
      if (active) setState({ loading: false, allowed: Boolean(access?.hasAccess ?? access?.access ?? access?.enrolled) });
    }).catch(() => active && setState({ loading: false, allowed: false }));
    return () => { active = false; };
  }, [slug, user]);

  if (!user) return <Navigate to='/login' replace state={{ from: `/my-courses/${slug}` }} />;
  if (state.loading) return <div className='grid min-h-[50vh] place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' /></div>;
  if (!state.allowed) return <Navigate to={`/courses/${slug}`} replace />;
  return children;
}
