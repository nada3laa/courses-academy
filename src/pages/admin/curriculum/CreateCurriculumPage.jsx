import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Save, Loader2 } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import CurriculumForm from "../../../components/admin/curriculum/CurriculumForm";
import StageAccordion from "../../../components/admin/curriculum/StageAccordion";
// تأكد من استيراد الدوال دي من ملف الـ service بتاعك
import {
  createCurriculum,
  createStage,
  createGrade,
  createSubject,
  deleteGrade,
  deleteStage,
  deleteSubject,
  getCurriculum,
  getCurriculumStages,
  getStageGrades,
  getSubjects,
  updateCurriculum,
  updateGrade,
  updateStage as updateStageRequest,
  updateSubject,
} from "../../../services/APIService";
import Breadcrumbs from "../../shared/Breadcrumbs";

const CreateCurriculumPage = () => {
  const navigate = useNavigate();
  const { curriculumId } = useParams();
  const isEditing = Boolean(curriculumId);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [originalStructure, setOriginalStructure] = useState([]);
  const [curriculum, setCurriculum] = useState({
    name: { ar: "", en: "" },
    description: "",
    country: "",
    stages: [],
  });

  const extractList = (response) => {
    const body = response?.data?.data ?? response?.data ?? response ?? [];
    return Array.isArray(body) ? body : body.items || body.results || [];
  };
  const entityId = (entity) => {
    if (!entity) return "";
    if (typeof entity === "string") return entity;
    return (
      entity._id?.$oid ||
      entity.id?.$oid ||
      entity._id ||
      entity.id ||
      entity.value ||
      entity.data?._id ||
      entity.data?.id ||
      entity._doc?._id ||
      entity._doc?.id ||
      ""
    );
  };
  const responseEntity = (response) => {
    const body = response?.data?.data ?? response?.data ?? response ?? {};
    if (entityId(body)) return body;
    if (body.item && typeof body.item === "object") return body.item;
    if (body.data && typeof body.data === "object") return body.data;
    if (body.stage && typeof body.stage === "object") return body.stage;
    if (body.grade && typeof body.grade === "object") return body.grade;
    if (body.subject && typeof body.subject === "object") return body.subject;
    if (body.curriculum && typeof body.curriculum === "object") return body.curriculum;
    return body;
  };
  const apiErrorMessage = (err) => {
    const data = err.response?.data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.msg === "string") return data.msg;
    if (Array.isArray(data?.errors)) {
      return data.errors
        .map((item) => item?.message || item?.msg || item)
        .filter(Boolean)
        .join("، ");
    }
    if (data && typeof data === "object") {
      const fieldMessages = Object.values(data)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => {
          if (typeof value === "string") return value;
          if (typeof value?.message === "string") return value.message;
          if (typeof value?.msg === "string") return value.msg;
          return "";
        })
        .filter(Boolean);
      if (fieldMessages.length) return fieldMessages.join("، ");
    }
    if (err.response?.status) return `فشل الطلب (${err.response.status})`;
    if (err.request) return "تعذر الاتصال بالخادم";
    return "حدث خطأ أثناء الحفظ";
  };
  const withSaveStep = async (label, action, payload) => {
    try {
      const response = await action();
      if (response?.data?.success === false) {
        const err = new Error(response.data?.message || "Request failed");
        err.response = { data: response.data, status: response.status };
        err.config = response.config;
        throw err;
      }
      return response;
    } catch (err) {
      err.saveStep = label;
      err.savePayload = payload;
      throw err;
    }
  };
  const requireSavedId = (id, label, response) => {
    if (id) return id;
    const err = new Error(`Missing saved id for ${label}`);
    err.saveStep = label;
    err.savePayload = response?.data ?? response;
    throw err;
  };
  const assertDistinctId = ({ id, forbiddenId, label, payload }) => {
    if (String(id) !== String(forbiddenId)) return;
    const err = new Error(`${label} resolved to the wrong id`);
    err.saveStep = label;
    err.savePayload = payload;
    throw err;
  };
  const assertSubjectRelations = ({ savedCurriculumId, stageId, gradeId, subject }) => {
    const payload = { curriculum: savedCurriculumId, stage: stageId, grade: gradeId, name: subject.name };
    assertDistinctId({
      id: stageId,
      forbiddenId: savedCurriculumId,
      label: `رقم المرحلة للمادة "${subject.name.ar}" يساوي رقم المنهج`,
      payload,
    });
    assertDistinctId({
      id: gradeId,
      forbiddenId: savedCurriculumId,
      label: `رقم الصف للمادة "${subject.name.ar}" يساوي رقم المنهج`,
      payload,
    });
    assertDistinctId({
      id: gradeId,
      forbiddenId: stageId,
      label: `رقم الصف للمادة "${subject.name.ar}" يساوي رقم المرحلة`,
      payload,
    });
  };
  const sameName = (left, right) => {
    const normalizedLeft = normalizedName(left);
    const normalizedRight = normalizedName(right);
    return (
      normalizedLeft.ar.trim() === normalizedRight.ar.trim() &&
      normalizedLeft.en.trim() === normalizedRight.en.trim()
    );
  };
  const newestMatchingByName = (items, name) =>
    [...items].reverse().find((item) => sameName(item.name, name));
  const stagePayload = ({ savedCurriculumId, stage }) => ({
    curriculum: savedCurriculumId,
    name: stage.name,
  });
  const gradePayload = ({ savedCurriculumId, stageId, grade }) => ({
    curriculum: savedCurriculumId,
    stage: stageId,
    name: grade.name,
  });
  const subjectPayload = ({ savedCurriculumId, stageId, gradeId, subject }) => ({
    curriculum: savedCurriculumId,
    stage: stageId,
    grade: gradeId,
    name: subject.name,
  });
  const resolveCreatedStageId = async ({ response, savedCurriculumId, stage }) => {
    const createdId = entityId(responseEntity(response));
    if (createdId) return createdId;

    const stagesResponse = await withSaveStep(
      `إعادة تحميل المرحلة "${stage.name.ar}" بعد إنشائها`,
      () => getCurriculumStages(savedCurriculumId),
      { curriculum: savedCurriculumId },
    );
    const savedStage = newestMatchingByName(extractList(stagesResponse), stage.name);
    return requireSavedId(
      entityId(savedStage),
      `قراءة رقم المرحلة "${stage.name.ar}"`,
      stagesResponse,
    );
  };
  const resolveCreatedGradeId = async ({ response, stageId, grade }) => {
    const createdId = entityId(responseEntity(response));
    if (createdId) return createdId;

    const gradesResponse = await withSaveStep(
      `إعادة تحميل الصف "${grade.name.ar}" بعد إنشائه`,
      () => getStageGrades(stageId),
      { stage: stageId },
    );
    const savedGrade = newestMatchingByName(extractList(gradesResponse), grade.name);
    return requireSavedId(
      entityId(savedGrade),
      `قراءة رقم الصف "${grade.name.ar}"`,
      gradesResponse,
    );
  };
  const createGradeWithSubjects = async ({ savedCurriculumId, stageId, grade }) => {
    assertDistinctId({
      id: stageId,
      forbiddenId: savedCurriculumId,
      label: `رقم المرحلة للصف "${grade.name.ar}" يساوي رقم المنهج`,
      payload: { curriculum: savedCurriculumId, stage: stageId, name: grade.name },
    });
    const payload = gradePayload({ savedCurriculumId, stageId, grade });
    const response = await withSaveStep(
      `إضافة الصف "${grade.name.ar}"`,
      () => createGrade(payload),
      payload,
    );
    const gradeId = await resolveCreatedGradeId({ response, stageId, grade });
    console.info("Curriculum save success:", {
      step: "create grade",
      stageId,
      gradeId,
      grade: grade.name,
      payload,
    });

    for (const subject of grade.subjects) {
      assertSubjectRelations({ savedCurriculumId, stageId, gradeId, subject });
      const subjectData = subjectPayload({
        savedCurriculumId,
        stageId,
        gradeId,
        subject,
      });
      const subjectResponse = await withSaveStep(
        `إضافة المادة "${subject.name.ar}"`,
        () => createSubject(subjectData),
        subjectData,
      );
      const subjectId = requireSavedId(
        entityId(responseEntity(subjectResponse)),
        `قراءة رقم المادة "${subject.name.ar}"`,
        subjectResponse,
      );
      console.info("Curriculum save success:", {
        step: "create subject",
        gradeId,
        subjectId,
        subject: subject.name,
        payload: subjectData,
      });
    }
  };
  const createStageWithChildren = async ({ savedCurriculumId, stage }) => {
    const payload = stagePayload({ savedCurriculumId, stage });
    const response = await withSaveStep(
      `إضافة المرحلة "${stage.name.ar}"`,
      () => createStage(payload),
      payload,
    );
    const stageId = await resolveCreatedStageId({
      response,
      savedCurriculumId,
      stage,
    });
    console.info("Curriculum save success:", {
      step: "create stage",
      stageId,
      stage: stage.name,
      payload,
    });

    for (const grade of stage.grades) {
      await createGradeWithSubjects({ savedCurriculumId, stageId, grade });
    }
  };
  const deleteSubjectRecord = async (subject) => {
    const subjectId = entityId(subject);
    if (!subjectId) return;
    await withSaveStep(
      `حذف المادة "${subject.name?.ar || subject.name?.en || subjectId}"`,
      () => deleteSubject(subjectId),
      { subjectId },
    );
    console.info("Curriculum save success:", {
      step: "delete subject",
      subjectId,
      subject: subject.name,
    });
  };
  const deleteGradeWithSubjects = async (grade) => {
    const gradeId = entityId(grade);
    if (!gradeId) return;

    for (const subject of grade.subjects || []) {
      await deleteSubjectRecord(subject);
    }

    await withSaveStep(
      `حذف الصف "${grade.name?.ar || grade.name?.en || gradeId}"`,
      () => deleteGrade(gradeId),
      { gradeId },
    );
    console.info("Curriculum save success:", {
      step: "delete grade",
      gradeId,
      grade: grade.name,
    });
  };
  const deleteStageWithChildren = async (stage) => {
    const stageId = entityId(stage);
    if (!stageId) return;

    for (const grade of stage.grades || []) {
      await deleteGradeWithSubjects(grade);
    }

    await withSaveStep(
      `حذف المرحلة "${stage.name?.ar || stage.name?.en || stageId}"`,
      () => deleteStage(stageId),
      { stageId },
    );
    console.info("Curriculum save success:", {
      step: "delete stage",
      stageId,
      stage: stage.name,
    });
  };
  const saveSubject = async ({
    savedCurriculumId,
    stageId,
    gradeId,
    subject,
    savedSubject,
  }) => {
    const savedGradeId = requireSavedId(
      gradeId,
      `تحديد الصف للمادة "${subject.name.ar}"`,
      subject,
    );

    if (savedSubject) {
      await withSaveStep(
        `تحديث المادة "${subject.name.ar}"`,
        () => updateSubject(entityId(subject), { name: subject.name }),
        { name: subject.name },
      );
      console.info("Curriculum save success:", {
        step: "update subject",
        subject: subject.name,
        subjectId: entityId(subject),
        gradeId: savedGradeId,
      });
      return;
    }

    const payload = subjectPayload({
      savedCurriculumId,
      stageId,
      gradeId: savedGradeId,
      subject,
    });
    assertSubjectRelations({
      savedCurriculumId,
      stageId,
      gradeId: savedGradeId,
      subject,
    });
    const subjectResponse = await withSaveStep(
      `إضافة المادة "${subject.name.ar}"`,
      () => createSubject(payload),
      payload,
    );
    const subjectId = requireSavedId(
      entityId(responseEntity(subjectResponse)),
      `قراءة رقم المادة "${subject.name.ar}"`,
      subjectResponse,
    );
    console.info("Curriculum save success:", {
      step: "create subject",
      subject: subject.name,
      subjectId,
      gradeId: savedGradeId,
      payload,
    });
  };
  const saveGradeTree = async ({
    savedCurriculumId,
    stageId,
    grade,
    savedGrade,
  }) => {
    let gradeId = entityId(savedGrade) || "";

    if (savedGrade) {
      await withSaveStep(
        `تحديث الصف "${grade.name.ar}"`,
        () => updateGrade(gradeId, { name: grade.name }),
        { name: grade.name },
      );
      console.info("Curriculum save success:", {
        step: "update grade",
        grade: grade.name,
        gradeId,
        stageId,
      });
    } else {
      await createGradeWithSubjects({ savedCurriculumId, stageId, grade });
      return;
    }

    const currentSubjectIds = new Set(grade.subjects.map(entityId).filter(Boolean));
    for (const oldSubject of savedGrade?.subjects || []) {
      if (!currentSubjectIds.has(entityId(oldSubject))) {
        await deleteSubjectRecord(oldSubject);
      }
    }

    for (const subject of grade.subjects) {
      const savedSubject = savedGrade?.subjects.find(
        (item) => entityId(item) === entityId(subject),
      );
      await saveSubject({
        savedCurriculumId,
        stageId,
        gradeId,
        subject,
        savedSubject,
      });
    }
  };
  const saveStageTree = async ({ savedCurriculumId, stage, savedStage }) => {
    let stageId = entityId(savedStage) || "";

    if (savedStage) {
      await withSaveStep(
        `تحديث المرحلة "${stage.name.ar}"`,
        () => updateStageRequest(stageId, { name: stage.name }),
        { name: stage.name },
      );
      console.info("Curriculum save success:", {
        step: "update stage",
        stage: stage.name,
        stageId,
      });
    } else {
      await createStageWithChildren({ savedCurriculumId, stage });
      return;
    }

    const currentGradeIds = new Set(stage.grades.map(entityId).filter(Boolean));
    for (const oldGrade of savedStage?.grades || []) {
      if (!currentGradeIds.has(entityId(oldGrade))) {
        await deleteGradeWithSubjects(oldGrade);
      }
    }

    for (const grade of stage.grades) {
      const savedGrade = savedStage?.grades.find(
        (item) => entityId(item) === entityId(grade),
      );
      await saveGradeTree({
        savedCurriculumId,
        stageId,
        grade,
        savedGrade,
      });
    }
  };
  const logSaveError = (err) => {
    console.group("Curriculum save error");
    console.error("Step:", err.saveStep || "Unknown step");
    console.error("Toast message:", apiErrorMessage(err));
    console.error("HTTP status:", err.response?.status);
    console.error("HTTP status text:", err.response?.statusText);
    console.error("Request method:", err.config?.method?.toUpperCase());
    console.error("Request URL:", err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err.config?.url);
    console.error("Payload:", err.savePayload || err.config?.data);
    console.error("Response data:", err.response?.data);
    console.error("Full error:", err);
    console.groupEnd();
  };
  const normalizedName = (name) =>
    typeof name === "string"
      ? { ar: name, en: name }
      : { ar: name?.ar || "", en: name?.en || "" };

  useEffect(() => {
    if (!curriculumId) return;
    const loadCurriculum = async () => {
      setLoading(true);
      try {
        const [curriculumResponse, stagesResponse] = await Promise.all([
          getCurriculum(curriculumId),
          getCurriculumStages(curriculumId),
        ]);
        const data = curriculumResponse.data?.data ?? curriculumResponse.data;
        const stages = await Promise.all(extractList(stagesResponse).map(async (stage) => {
          const grades = await Promise.all(extractList(await getStageGrades(entityId(stage))).map(async (grade) => ({
            ...grade,
            id: entityId(grade),
            name: normalizedName(grade.name),
            subjects: extractList(await getSubjects({ grade: entityId(grade) })).map((subject) => ({
              ...subject,
              id: entityId(subject),
              name: normalizedName(subject.name),
            })),
          })));
          return { ...stage, id: entityId(stage), name: normalizedName(stage.name), grades };
        }));
        setCurriculum({
          name: normalizedName(data.name),
          description: data.description || "",
          country: entityId(data.country) || data.country || "",
          stages,
        });
        setOriginalStructure(stages);
      } catch (err) {
        toast.error(err.response?.data?.message || "تعذر تحميل بيانات المنهج");
      } finally {
        setLoading(false);
      }
    };
    loadCurriculum();
  }, [curriculumId]);

  const validate = () => {
    if (!curriculum.name.ar.trim() || !curriculum.name.en.trim()) {
      toast.error("يرجى إدخال اسم المنهج بالعربية والإنجليزية");
      return false;
    }
    if (!curriculum.country) {
      toast.error("يرجى اختيار الدولة");
      return false;
    }
    if (curriculum.stages.length === 0) {
      toast.error("يجب إضافة مرحلة دراسية واحدة على الأقل");
      return false;
    }

    for (const stage of curriculum.stages) {
      // تعديل هنا: التأكد من العربي والإنجليزي
      if (!stage.name.ar.trim() || !stage.name.en.trim()) {
        toast.error("جميع المراحل يجب أن تحتوي على اسم بالعربي والإنجليزي");
        return false;
      }
      if (stage.grades.length === 0) {
        toast.error(
          `مرحلة "${stage.name.ar}" يجب أن تحتوي على صف دراسي واحد على الأقل`,
        );
        return false;
      }
      for (const grade of stage.grades) {
        // تعديل هنا: التأكد من العربي والإنجليزي
        if (!grade.name.ar.trim() || !grade.name.en.trim()) {
          toast.error("جميع الصفوف يجب أن تحتوي على اسم بالعربي والإنجليزي");
          return false;
        }
        if (grade.subjects.length === 0) {
          toast.error(
            `صف "${grade.name.ar}" يجب أن يحتوي على مادة واحدة على الأقل`,
          );
          return false;
        }
        for (const subject of grade.subjects) {
          if (!subject.name.ar.trim() || !subject.name.en.trim()) {
            toast.error("جميع المواد يجب أن تحتوي على اسم بالعربي والإنجليزي");
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (saving) return;

    setSaving(true);
    try {
      if (isEditing) {
        const curriculumPayload = {
          name: curriculum.name,
          country: curriculum.country,
        };
        if (curriculum.description?.trim()) {
          curriculumPayload.description = curriculum.description.trim();
        }
        await withSaveStep("تحديث بيانات المنهج", () =>
          updateCurriculum(curriculumId, curriculumPayload),
          curriculumPayload,
        );
        const currentStageIds = new Set(curriculum.stages.map(entityId).filter(Boolean));
        for (const oldStage of originalStructure) {
          if (!currentStageIds.has(entityId(oldStage))) {
            await deleteStageWithChildren(oldStage);
          }
        }
        for (const stage of curriculum.stages) {
          const savedStage = originalStructure.find((item) => entityId(item) === entityId(stage));
          await saveStageTree({
            savedCurriculumId: curriculumId,
            stage,
            savedStage,
          });
        }
        toast.success("تم تحديث المنهج بنجاح");
        navigate("/admin/curriculum");
        return;
      }

      const curriculumRes = await withSaveStep("إضافة بيانات المنهج", () => createCurriculum({
        name: { ar: curriculum.name.ar, en: curriculum.name.en },
        country: curriculum.country,
      }), {
        name: { ar: curriculum.name.ar, en: curriculum.name.en },
        country: curriculum.country,
      });
      const createdCurriculumId = requireSavedId(
        entityId(responseEntity(curriculumRes)),
        "قراءة رقم المنهج الجديد",
        curriculumRes,
      );

      for (const stage of curriculum.stages) {
        await createStageWithChildren({
          savedCurriculumId: createdCurriculumId,
          stage,
        });
      }
      toast.success("تم بناء المنهج بالكامل بنجاح");
      navigate("/admin/curriculum");
    } catch (err) {
      const message = apiErrorMessage(err);
      logSaveError(err);
      toast.error(err.saveStep ? `${err.saveStep}: ${message}` : message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addStage = () => {
    setCurriculum((prev) => ({
      ...prev,
      stages: [
        ...prev.stages,
        { id: crypto.randomUUID(), name: { ar: "", en: "" }, grades: [] },
      ],
    }));
  };

  const updateStage = (stageId, updatedStage) => {
    setCurriculum((prev) => ({
      ...prev,
      stages: prev.stages.map((s) => (s.id === stageId ? updatedStage : s)),
    }));
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const removeStage = async (stageId) => {
    const savedStage = originalStructure.find(
      (stage) => entityId(stage) === stageId,
    );
    if (isEditing && savedStage) {
      setSaving(true);
      try {
        await deleteStageWithChildren(savedStage);
        toast.success("تم حذف المرحلة بنجاح");
        refreshPage();
      } catch (err) {
        logSaveError(err);
        toast.error(apiErrorMessage(err));
      } finally {
        setSaving(false);
      }
      return;
    }

    setCurriculum((prev) => ({
      ...prev,
      stages: prev.stages.filter((s) => s.id !== stageId),
    }));
  };

  const removeGrade = async (stageId, gradeId) => {
    const savedStage = originalStructure.find(
      (stage) => entityId(stage) === stageId,
    );
    const savedGrade = savedStage?.grades?.find(
      (grade) => entityId(grade) === gradeId,
    );
    if (isEditing && savedGrade) {
      setSaving(true);
      try {
        await deleteGradeWithSubjects(savedGrade);
        toast.success("تم حذف الصف بنجاح");
        refreshPage();
      } catch (err) {
        logSaveError(err);
        toast.error(apiErrorMessage(err));
      } finally {
        setSaving(false);
      }
      return;
    }

    setCurriculum((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId
          ? { ...stage, grades: stage.grades.filter((grade) => grade.id !== gradeId) }
          : stage,
      ),
    }));
  };

  const removeSubject = async (stageId, gradeId, subjectId) => {
    const savedStage = originalStructure.find(
      (stage) => entityId(stage) === stageId,
    );
    const savedGrade = savedStage?.grades?.find(
      (grade) => entityId(grade) === gradeId,
    );
    const savedSubject = savedGrade?.subjects?.find(
      (subject) => entityId(subject) === subjectId,
    );
    if (isEditing && savedSubject) {
      setSaving(true);
      try {
        await deleteSubjectRecord(savedSubject);
        toast.success("تم حذف المادة بنجاح");
        refreshPage();
      } catch (err) {
        logSaveError(err);
        toast.error(apiErrorMessage(err));
      } finally {
        setSaving(false);
      }
      return;
    }

    setCurriculum((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              grades: stage.grades.map((grade) =>
                grade.id === gradeId
                  ? {
                      ...grade,
                      subjects: grade.subjects.filter(
                        (subject) => subject.id !== subjectId,
                      ),
                    }
                  : grade,
              ),
            }
          : stage,
      ),
    }));
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div dir="rtl" className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="animate-spin text-[#123C91]" size={28} />
          </div>
        ) : (
          <>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-['Tajawal'] font-bold text-[24px] text-[#1F2937]">
              {isEditing ? "تعديل المنهج" : "إنشاء منهج جديد"}
            </h2>
            <p className="text-[#8C9198] text-[15px]">
              {isEditing ? "تعديل بيانات وهيكل المنهج الدراسي" : "بناء هيكل المنهج والمراحل والصفوف الدراسية"}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[#123C91] text-white [&_svg]:text-white px-6 py-2.5 rounded-lg font-['Tajawal'] hover:bg-[#0F3278] transition-all disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {saving ? "جاري الحفظ..." : isEditing ? "حفظ التعديلات" : "حفظ المنهج"}
          </button>
        </div>

        <CurriculumForm
          data={curriculum}
          onChange={(field, value) =>
            setCurriculum((prev) => ({ ...prev, [field]: value }))
          }
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-['Tajawal'] font-bold text-[18px] text-[#1F2937]">
              المراحل الدراسية
            </h3>
            <button
              onClick={addStage}
              className="flex items-center gap-1.5 text-[#123C91] font-['Tajawal'] text-[14px] hover:underline"
            >
              <Plus size={16} /> إضافة مرحلة
            </button>
          </div>
          {curriculum.stages.map((stage) => (
            <StageAccordion
              key={stage.id}
              stage={stage}
              onUpdate={(updated) => updateStage(stage.id, updated)}
              onRemove={() => removeStage(stage.id)}
              onRemoveGrade={(gradeId) => removeGrade(stage.id, gradeId)}
              onRemoveSubject={(gradeId, subjectId) =>
                removeSubject(stage.id, gradeId, subjectId)
              }
            />
          ))}
        </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateCurriculumPage;
