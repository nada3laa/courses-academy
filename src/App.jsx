import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import toast, { Toaster, ToastBar } from "react-hot-toast";

import HomeLayout from "./components/layout/HomeLayout";
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import RegisterPage from "./pages/auth/RegisterPage";
import OtpPage from "./pages/auth/OtpPage";
import TeacherDetailsPage from "./pages/auth/TeacherDetailsPage";
import PendingPage from "./pages/auth/PendingPage";
import { AccountTypePage } from "./pages/auth/AccountTypePage";

import Home from "./pages/parent/Home";
import AddChildPage from "./pages/parent/add-child/AddChildPage";
import LessonsSchedule from "./pages/parent/LessonsSchedule";
import Notifications from "./pages/parent/Notifications";
import SubscriptionPage from "./pages/parent/SubscriptionPage";
import ChildrenPage from "./pages/parent/ChildrenPage";

import { AuthContext } from "./context/AuthContext";
import { getDashboardPathByRole } from "./utils/roles";

import RegisterSuccessPage from "./pages/auth/RegisterSuccessPage";
import TeacherHome from "./pages/teacher/TeacherHome";
import StudentHome from "./pages/student/StudentHome";
import StudentGroupsPage from "./pages/student/StudentGroupsPage";
import StudentSchedulePage from "./pages/student/SchedulePage";
import StudentDetailsPages from "./pages/auth/StudentDetailsPages";
import StudentSubjectsPages from "./pages/auth/StudentSubjectsPages";
import StudentPackagesPage from "./pages/auth/StudentPackagesPage";
import StudentOrderSummaryPage from "./pages/auth/StudentOrderSummaryPage";
import SubscriptionOrderStatusPage from "./pages/student/SubscriptionOrderStatusPage";
import GroupsPage from "./pages/teacher/groups/GroupsPage";
import GroupLessonsPage from "./pages/teacher/groups/GroupLessonsPage";
import GroupStudentsPage from "./pages/teacher/groups/GroupStudentsPage";
import StudentDetailsPage from "./pages/teacher/groups/StudentDetailsPage";
// import CreateGroupPage from "./components/teacher/groups/CreateGroupPage";
import CreateLessonPage from "./components/teacher/groups/lessons/CreateLessonPage";
import AssignmentsPage from "./pages/teacher/assignments/AssignmentsPage";
import Schedule from "./pages/teacher/schedule/Schedule";
import Messages from "./pages/parent/Messages";
import LessonDetailsPage from "./pages/teacher/groups/LessonDetailsPage";
import AddAssignmentPage from "./components/teacher/assignments/AddAssignmentPage";
import Notificationss from "./pages/teacher/notifications/Notifications";
import AssignmentDetailsPage from "./pages/teacher/assignments/AssignmentDetailsPage";
import TeacherMessages from "./pages/teacher/messages/Messages";
import AccountSettingsPage from "./pages/parent/AccountSettings";
import TeacherAccountSettingsPage from "./pages/teacher/TeacherAccountSettingsPage";
import EarningsPage from "./pages/teacher/EarningsPage";

// ✅ Guards
import TeacherGuard from "./guards/TeacherGuard";
import InstructorGuard from "./guards/InstructorGuard";
import StudentGuard from "./guards/StudentGuard";
import AdminHome from "./pages/admin/AdminHome";
import AdminSchedulePage from "./pages/admin/SchedulePage";
import AdminAccountSettingsPage from "./pages/admin/AdminAccountSettingsPage";
import AdminNotificationss from "./pages/admin/notifications/Notifications";
import UsersPage from "./pages/admin/users/Userspage";
import GroupsPages from "./pages/admin/groups/Groupspage";
import AttendancePage from "./pages/admin/groups/attendance/AttendancePage";
import CreateGroupPages from "./pages/admin/groups/CreateGroupPage";
import SupervisorsPage from "./pages/admin/supervisors/SupervisorsPage";
import TeachersPage from "./pages/admin/teachers/TeachersPage";
import TeacherSessionsPage from "./pages/admin/teachers/TeacherSessionsPage";
import RecordingsPages from "./pages/admin/recordings/RecordingsPage";
import AdminMessages from "./pages/admin/messages/Adminmessages";
import SubscriptionsPage from "./pages/admin/subscriptions/SubscriptionsPage";
import SubscriptionRequestsPage from "./pages/admin/subscriptions/SubscriptionRequestsPage";
import ActivateSubscriptionPage from "./pages/admin/subscriptions/ActivateSubscriptionPage";
import SubscriptionDetailsPage from "./pages/admin/subscriptions/SubscriptionDetailsPage";
import SubscriptionOrderReviewPage from "./pages/admin/subscriptions/SubscriptionOrderReviewPage";
import AdminPaymentsPage from "./pages/admin/payments/AdminPaymentsPage";
import PaymentDetailsPage from "./pages/admin/payments/PaymentDetailsPage";
import TeacherSalariesPage from "./pages/admin/teacher-salaries/TeacherSalariesPage";
import CreateCurriculumPage from "./pages/admin/curriculum/CreateCurriculumPage";
import StudentAccountSettingsPage from "./pages/student/StudentAccountSettingsPage";
import StudentNotifications from "./pages/student/Notifications";
import StudentSubscriptionPage from "./pages/student/StudentSubscriptionPage";
import RenewalPage from "./pages/subscription/RenewalPage";
import AddSubjectPage from "./pages/subscription/AddSubjectPage";
import StudentMessagess from "./pages/student/messages/Messages";
import StudentAssignmentsPage from "./pages/student/assignments/StudentAssignmentsPage";
import StudentGroupLessonsPage from "./pages/student/groupLessons/Studentgrouplessonspage";
import StudentLessonDetailsPage from "./pages/student/groupLessons/Studentlessondetailspage";
import LessonFilesPage from "./pages/student/groupLessons/Lessonfilespage";
import CreateSchedulePage from "./components/teacher/groups/lessons/CreateSchedulePage";
import AttendanceRegistrationPage from "./pages/teacher/groups/AttendanceRegistrationPage";
import SessionDetailsPage from "./pages/shared/SessionDetailsPage";
import AddSubscriptionPage from "./pages/admin/subscriptions/Addsubscriptionpage";
import AllBlogsPage from "./components/landing/AllBlogsPage";
import BlogsPage from "./pages/admin/BlogsPage.jsx/BlogsPage";
import BlogFormPage from "./pages/admin/BlogsPage.jsx/BlogFormPage";
import BlogPostPage from "./components/landing/Blogpostpage";
import StudentPaymentsPage from "./pages/student/StudentPaymentsPage";
import StudentCoursesPage from "./features/course-management/pages/student/StudentCoursesPage";
import MyCourseDetailsPage from "./features/course-management/pages/student/MyCourseDetailsPage";
import CoursePlayerPage from "./features/course-management/pages/student/CoursePlayerPage";
import CoursePaymentPage from "./features/course-management/pages/student/CourseCheckoutPage";
import CourseEnrollmentGuard from "./guards/CourseEnrollmentGuard";
import CoursesPage from "./pages/CoursesPage";
import InstructorPage from "./pages/InstructorPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import ExamPage from "./pages/student/ExamPage";
import ExamResultPage from "./pages/student/ExamResultPage";
import CertificatePage from "./pages/CourseCertificatePage";
import TeacherCoursesPage from "./features/course-management/pages/TeacherCoursesPage";
import TeacherCourseFormPage from "./features/course-management/pages/TeacherCourseFormPage";
import TeacherCourseDetailsPage from "./features/course-management/pages/TeacherCourseDetailsPage";
import AdminCoursesPage from "./features/course-management/pages/AdminCoursesPage";
import AdminCourseDetailsPage from "./features/course-management/pages/AdminCourseDetailsPage";
import AdminQuizReviewPage from "./features/course-management/pages/AdminQuizReviewPage";
import AdminCourseFormPage from "./features/course-management/pages/AdminCourseFormPage";
import CourseFinancesPage from "./pages/admin/course-finances/CourseFinancesPage";
import CommissionSettingsPage from "./pages/admin/course-finances/CommissionSettingsPage";

function App() {
  const { user, checkingAccountState } = useContext(AuthContext);

  if (checkingAccountState) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#F5F7FB]"
        dir="rtl"
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#123C91] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-left"
        reverseOrder={false}
        toastOptions={{
          duration: 10000,
          style: { direction: "rtl" },
        }}
      >
        {(currentToast) => (
          <ToastBar toast={currentToast}>
            {({ icon, message }) => (
              <div className="relative -m-2 flex min-w-72 items-center gap-2 overflow-hidden p-2 pb-3">
                {icon}
                <div className="flex-1">{message}</div>
                <button
                  type="button"
                  onClick={() => toast.dismiss(currentToast.id)}
                  className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-full text-lg leading-none text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  aria-label="إغلاق الرسالة"
                >
                  ×
                </button>
                <span
                  key={currentToast.id}
                  className="toast-countdown absolute inset-x-0 bottom-0 h-1 rounded-full bg-[#123C91]"
                  aria-hidden="true"
                />
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>

      <Routes>
        {/* Landing */}
        <Route element={<HomeLayout />}>
          <Route index element={<Landing />} />
          <Route path="/blogs" element={<AllBlogsPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
           <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailsPage />} />
          <Route path="/instructors/:id" element={<InstructorPage />} />
        </Route>
        {/* Auth */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={getDashboardPathByRole(user)} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/select-account-type"
          element={
            user ? (
              <Navigate to={getDashboardPathByRole(user)} replace />
            ) : (
              <AccountTypePage />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={getDashboardPathByRole(user)} replace />
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route
          path="/register/student-details"
          element={<StudentDetailsPages />}
        />
        <Route path="/register/subjects" element={<StudentSubjectsPages />} />
        <Route path="/register/packages" element={<StudentPackagesPage />} />
        <Route
          path="/register/order-summary"
          element={<StudentOrderSummaryPage />}
        />
        <Route
          path="/subscription-orders/:orderId/status"
          element={
            user ? (
              <SubscriptionOrderStatusPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/payment/success"
          element={
            user ? (
              <SubscriptionOrderStatusPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/register/success" element={<RegisterSuccessPage />} />
        <Route
          path="/register/teacher-details"
          element={<TeacherDetailsPage />}
        />
        <Route path="/pending" element={<PendingPage />} />
        <Route
          path="/account-state"
          element={<Navigate to="/pending" replace />}
        />
        {/* Parent */}
        <Route
          path="/parent-dashboard"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent-dashboard/add-child"
          element={user ? <AddChildPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent/schedule"
          element={
            user ? <LessonsSchedule /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/parent/classrooms/:classroomId/sessions/:sessionId"
          element={
            user ? (
              <SessionDetailsPage role="parent" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/parent/children"
          element={user ? <ChildrenPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent/notifications"
          element={user ? <Notifications /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent/subscription"
          element={
            user ? <SubscriptionPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/parent/subscriptions/:id/renew"
          element={
            user ? (
              <RenewalPage role="parent" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/parent/subscriptions/:id/add-subject"
          element={
            user ? (
              <AddSubjectPage role="parent" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/parent/students/:studentId/subscription/packages"
          element={
            user ? <StudentPackagesPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/parent/messages"
          element={user ? <Messages /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent/settings"
          element={
            user ? <AccountSettingsPage /> : <Navigate to="/login" replace />
          }
        />
        {/* ✅ Student — محمي بـ StudentGuard */}
        <Route
          path="/student-dashboard"
          element={
            <StudentGuard>
              <StudentHome />
            </StudentGuard>
          }
        />
        <Route
          path="/student/settings"
          element={
            <StudentGuard>
              <StudentAccountSettingsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <StudentGuard>
              <StudentNotifications />
            </StudentGuard>
          }
        />
        <Route
          path="/student/subscription"
          element={
            <StudentGuard>
              <StudentSubscriptionPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/subscriptions/:id/renew"
          element={
            <StudentGuard>
              <RenewalPage role="student" />
            </StudentGuard>
          }
        />
        <Route
          path="/student/subscriptions/:id/add-subject"
          element={
            <StudentGuard>
              <AddSubjectPage role="student" />
            </StudentGuard>
          }
        />
        <Route
          path="/student/messages"
          element={
            <StudentGuard>
              <StudentMessagess />
            </StudentGuard>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <StudentGuard>
              <StudentAssignmentsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <StudentGuard>
              <StudentSchedulePage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/groups"
          element={
            <StudentGuard>
              <StudentGroupsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/groups/:groupId/lessons"
          element={
            <StudentGuard>
              <StudentGroupLessonsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/groups/:groupId/lessons/:lessonId"
          element={
            <StudentGuard>
              <StudentLessonDetailsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/groups/:groupId/lessons/:lessonId/files"
          element={
            <StudentGuard>
              <LessonFilesPage />
            </StudentGuard>
          }

        />
        <Route
          path="/student/payments"
          element={
            <StudentGuard>
              <StudentPaymentsPage />
            </StudentGuard>
          }

        />

        <Route path="/student-dashboard/courses" element={<StudentGuard><StudentCoursesPage /></StudentGuard>} />
        <Route path="/my-courses/:slug" element={<StudentGuard><CourseEnrollmentGuard><MyCourseDetailsPage /></CourseEnrollmentGuard></StudentGuard>} />
        <Route path="/payment/courses/:slug" element={<StudentGuard><CoursePaymentPage /></StudentGuard>} />
        <Route path="/learn/:slug" element={<StudentGuard><CoursePlayerPage /></StudentGuard>} />
        <Route path="/exam/:slug" element={<StudentGuard><ExamPage /></StudentGuard>} />
         <Route path="/exam-result/:slug" element={<StudentGuard><ExamResultPage /></StudentGuard>} />
        <Route path="/certificate/:slug" element={<StudentGuard><CertificatePage /></StudentGuard>} />


        {/* ✅ Teacher — محمي بـ TeacherGuard */}
        <Route
          path="/teacher-dashboard"
          element={
            <TeacherGuard>
              <TeacherHome />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups"
          element={
            <TeacherGuard>
              <GroupsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/lessons"
          element={
            <TeacherGuard>
              <GroupLessonsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/students"
          element={
            <TeacherGuard>
              <GroupStudentsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/students/:studentId"
          element={
            <TeacherGuard>
              <StudentDetailsPage />
            </TeacherGuard>
          }
        />
        {/* <Route path="/add-new-group" element={<TeacherGuard><CreateGroupPage /></TeacherGuard>} /> */}
        <Route
          path="/teacher/groups/:groupId/lessons/new"
          element={<CreateLessonPage />}
        />
        <Route
          path="/teacher/groups/:groupId/lessons/:lessonId"
          element={<LessonDetailsPage />}
        />
        <Route
          path="/teacher/groups/:groupId/lessons/schedule/new"
          element={<CreateSchedulePage />}
        />
        <Route
          path="/teacher/tasks"
          element={
            <TeacherGuard>
              <AssignmentsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/schedule"
          element={
            <TeacherGuard>
              <Schedule />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/lessons/:lessonId"
          element={
            <TeacherGuard>
              <LessonDetailsPage />
            </TeacherGuard>
          }
        />{" "}
        <Route
          path="/assignments/new"
          element={
            <TeacherGuard>
              <AddAssignmentPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/notifications"
          element={
            <TeacherGuard>
              <Notificationss />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/assignments/:assignmentId"
          element={
            <TeacherGuard>
              <AssignmentDetailsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/messages"
          element={
            <TeacherGuard>
              <TeacherMessages />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <TeacherGuard>
              <TeacherAccountSettingsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/earnings"
          element={
            <TeacherGuard>
              <EarningsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/lessons/:lessonId/attendance"
          element={
            <TeacherGuard>
              <AttendanceRegistrationPage />
            </TeacherGuard>
          }
        />

         <Route path="/teacher/courses" element={<TeacherGuard><InstructorGuard><TeacherCoursesPage /></InstructorGuard></TeacherGuard>} />
        <Route path="/teacher/courses/new" element={<TeacherGuard><InstructorGuard><TeacherCourseFormPage /></InstructorGuard></TeacherGuard>} />
        <Route path="/teacher/courses/:courseId" element={<TeacherGuard><InstructorGuard><TeacherCourseDetailsPage /></InstructorGuard></TeacherGuard>} />
        <Route path="/teacher/courses/:courseId/edit" element={<TeacherGuard><InstructorGuard><TeacherCourseFormPage /></InstructorGuard></TeacherGuard>} />
        {/* Admin */}
        
           <Route path="/admin/courses" element={user ? <AdminCoursesPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/courses/:courseId" element={user ? <AdminCourseDetailsPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/courses/:courseId/quizzes/:lessonId" element={user ? <AdminQuizReviewPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/courses/new" element={user ? <AdminCourseFormPage /> : <Navigate to="/login" replace />} />
        <Route path="/admin/courses/:courseId/edit" element={user ? <AdminCourseFormPage /> : <Navigate to="/login" replace />} />


          <Route
  path="/admin/course-finances"
  element={user ? <CourseFinancesPage /> : <Navigate to="/login" replace />}
/>
<Route
  path="/admin/course-finances/commission-settings"
  element={user ? <CommissionSettingsPage /> : <Navigate to="/login" replace />}
/>

        <Route
          path="/admin-dashboard"
          element={user ? <AdminHome /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/settings"
          element={
            user ? (
              <AdminAccountSettingsPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/notifications"
          element={
            user ? <AdminNotificationss /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/users"
          element={user ? <UsersPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/groups"
          element={user ? <GroupsPages /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/groups/:groupId/lessons"
          element={
            user ? (
              <GroupLessonsPage role="admin" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/groups/:groupId/lessons/new"
          element={
            user ? (
              <CreateLessonPage role="admin" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/groups/:groupId/schedule"
          element={
            user ? (
              <CreateSchedulePage role="admin" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/schedule"
          element={
            user ? <AdminSchedulePage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/classrooms/:classroomId/sessions/:sessionId"
          element={
            user ? (
              <SessionDetailsPage role="admin" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/groups/:groupId/attendance"
          element={user ? <AttendancePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/groups/new"
          element={
            user ? <CreateGroupPages /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/supervisors"
          element={
            user ? <SupervisorsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/teachers"
          element={user ? <TeachersPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/teachers/:teacherId/sessions/:sessionStatus"
          element={
            user ? <TeacherSessionsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/records"
          element={
            user ? <RecordingsPages /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/messages"
          element={user ? <AdminMessages /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/subscription"
          element={
            user ? <SubscriptionsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/subscriptions/requests"
          element={
            user ? (
              <SubscriptionRequestsPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/subscription-orders/:id"
          element={
            user ? (
              <SubscriptionOrderReviewPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/payments"
          element={
            user ? <AdminPaymentsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/payments/:id"
          element={
            user ? <PaymentDetailsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/teacher-salaries"
          element={
            user ? <TeacherSalariesPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/subscriptions/:id"
          element={
            user ? (
              <SubscriptionDetailsPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/blogs"
          element={user ? <BlogsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/blogs/add"
          element={user ? <BlogFormPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/blogs/:id/edit"
          element={user ? <BlogFormPage /> : <Navigate to="/login" replace />}
        />
        {/* <Route path="/admin/subscriptions/requests/:id" element={user ? <RequestDetailsPage  /> : <Navigate to="/login" replace />} />     */}
        <Route
          path="/admin/subscriptions/requests/:id/activate"
          element={
            user ? (
              <ActivateSubscriptionPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/curriculum/create"
          element={
            user ? <CreateCurriculumPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/curriculum/:curriculumId/edit"
          element={
            user ? <CreateCurriculumPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/subscriptions/add"
          element={
            user ? <AddSubscriptionPage /> : <Navigate to="/login" replace />
          }
        />
        {/* Fallback */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={getDashboardPathByRole(user)} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
