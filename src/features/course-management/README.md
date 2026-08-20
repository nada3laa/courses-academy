# Course Management

This folder contains the teacher, admin, and student course-management feature
and can be copied as one unit to another project.

## Structure

- `pages/`: teacher/admin management pages and student course pages.
- `components/`: management and student course UI components.
- `utils/`: local course persistence helpers.
- `index.js`: public exports for the feature.

## External dependencies

The feature currently expects these shared project files:

- `src/components/teacher/layout/TeacherLayout.jsx`
- `src/components/admin/layout/AdminLayout.jsx`
- `src/assets/courses/`
- `src/data/staticData.js`
- `src/data/courseContent.js`
- `src/data/instructorsData.js`
- `src/utils/courseEnrollments.js`
- `src/utils/courseProgress.js`
- `src/context/AuthContext.jsx`

It also uses `react`, `react-router-dom`, `react-hot-toast`, `lucide-react`, and
Tailwind CSS.
