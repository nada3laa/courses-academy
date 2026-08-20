import { getAssetUrl } from "../services/APIService";

export const getAssignmentAttachmentUrl = (assignment) => {
  const attachment = assignment?.attachments?.[0];
  const path =
    (typeof attachment === "string" ? attachment : null) ||
    attachment?.url ||
    attachment?.secureUrl ||
    attachment?.secure_url ||
    attachment?.fileUrl ||
    attachment?.path;

  return getAssetUrl(path);
};
