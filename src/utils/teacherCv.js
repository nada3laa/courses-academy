import { getAssetUrl } from "../services/APIService";

const fileValue = (value) => {
  if (typeof value === "string") return value;
  return value?.url || value?.secureUrl || value?.path || value?.fileUrl || "";
};

export const getTeacherCvUrl = (teacher) => {
  const user =
    teacher?.user && typeof teacher.user === "object" ? teacher.user : {};
  const source = { ...user, ...teacher };
  const value =
    source.cv ||
    source.cvUrl ||
    source.resume ||
    source.resumeUrl ||
    source.documents?.cv ||
    source.documents?.resume;

  return getAssetUrl(fileValue(value));
};

export const getTeacherFileUrls = (teacher) => {
  const user =
    teacher?.user && typeof teacher.user === "object" ? teacher.user : {};
  const source = { ...user, ...teacher };
  const files = Array.isArray(source.files) ? source.files : [];
  const legacyCvUrl = getTeacherCvUrl(teacher);
  const urls = [
    ...files.map(fileValue).map(getAssetUrl),
    legacyCvUrl,
  ].filter(Boolean);

  return [...new Set(urls)];
};
