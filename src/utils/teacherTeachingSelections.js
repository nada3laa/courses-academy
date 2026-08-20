import {
  getCurriculumStages,
  getStageGrades,
  getSubjects,
} from "../services/APIService";

const idOf = (value) =>
  String(typeof value === "object" ? value?._id || value?.id || "" : value || "");
const arrayOf = (value) => Array.isArray(value) ? value : value ? [value] : [];
const responseList = (response, keys) => {
  const value = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(value)) return value;
  return keys.map((key) => value?.[key]).find(Array.isArray) || [];
};

export const resolveTeacherTeachingSelections = async (teacher = {}) => {
  if (Array.isArray(teacher.teachingSelections) && teacher.teachingSelections.some((item) => item.stages?.length)) {
    return teacher.teachingSelections;
  }

  const curricula = arrayOf(teacher.curriculums ?? teacher.curriculum);
  const selectedGradeIds = new Set(arrayOf(teacher.grades ?? teacher.grade).map(idOf));
  const selectedSubjectIds = new Set(arrayOf(teacher.subjects ?? teacher.subject).map(idOf));

  return Promise.all(curricula.map(async (curriculum) => {
    const stagesResponse = await getCurriculumStages(idOf(curriculum));
    const stages = responseList(stagesResponse, ["stages", "items"]);
    const resolvedStages = await Promise.all(stages.map(async (stage) => {
      const gradesResponse = await getStageGrades(idOf(stage));
      const grades = responseList(gradesResponse, ["grades", "items"])
        .filter((grade) => selectedGradeIds.has(idOf(grade)));
      const resolvedGrades = await Promise.all(grades.map(async (grade) => {
        const subjectsResponse = await getSubjects({ grade: idOf(grade) });
        const subjects = responseList(subjectsResponse, ["subjects", "items"])
          .filter((subject) => selectedSubjectIds.has(idOf(subject)));
        return { grade, subjects };
      }));
      return { stage, grades: resolvedGrades.filter((grade) => grade.subjects.length) };
    }));
    return { curriculum, stages: resolvedStages.filter((stage) => stage.grades.length) };
  }));
};
