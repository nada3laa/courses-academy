import { createContext, useCallback, useState, useEffect } from "react";
import { getMyInstructorProfile, getMyProfile, login as loginApi } from "../services/APIService";
import { getDatabaseUserFromAccountState } from "../utils/accountState";

export const AuthContext = createContext();

const roleFromToken = (token) => {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const claims = JSON.parse(atob(normalized));
    return claims.role || claims.user?.role || null;
  } catch {
    return null;
  }
};

const restoreUser = () => {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) return null;
  const parsedUser = JSON.parse(savedUser);
  const role =
    parsedUser.role || roleFromToken(localStorage.getItem("token"));
  return role ? { ...parsedUser, role } : parsedUser;
};

const withoutStoredAccountState = (storedUser) => {
  if (!storedUser || typeof storedUser !== "object") return storedUser;
  const ordinaryData = { ...storedUser };
  [
    "status",
    "registrationStatus",
    "registration_status",
    "profileStatus",
    "isActive",
    "profileCompleted",
    "isProfileComplete",
  ].forEach((field) => delete ordinaryData[field]);
  return ordinaryData;
};

const userDataForStorage = (source) => {
  if (!source || typeof source !== "object") return null;
  const allowedFields = [
    "id",
    "_id",
    "userId",
    "profileId",
    "fullName",
    "name",
    "username",
    "email",
    "phone",
    "role",
    "country",
    "countryCode",
    "academicLevel",
    "studentType",
    "accountType",
    "instructorId",
    "instructorStatus",
    "timezone",
  ];

  return Object.fromEntries(
    allowedFields
      .filter((field) => source[field] !== undefined && source[field] !== null)
      .map((field) => [field, source[field]]),
  );
};

const persistUser = (source) => {
  const storedUser = userDataForStorage(source);
  if (storedUser) localStorage.setItem("user", JSON.stringify(storedUser));
  else localStorage.removeItem("user");
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return restoreUser();
    } catch {
      return null;
    }
  });
  const [checkingAccountState, setCheckingAccountState] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    let active = true;
    const ordinaryUser = withoutStoredAccountState(restoreUser());

    getMyProfile()
      .then((response) => {
        if (!active) return;
        const databaseUser = getDatabaseUserFromAccountState(response);
        const freshUser = { ...ordinaryUser, ...databaseUser };
        setUser(freshUser);
        persistUser(freshUser);
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          return;
        }

        // Never keep an old activation decision when the backend check fails.
        setUser(ordinaryUser);
        persistUser(ordinaryUser);
      })
      .finally(() => {
        if (active) setCheckingAccountState(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    console.log("الرد من الـ API:", res.data);

    const responseUser = res.data.data;
    const token = res.data.token;
    const tokenRole = roleFromToken(token);
    let finalUser =
      responseUser && typeof responseUser === "object"
        ? {
            ...responseUser,
            role: responseUser.role || tokenRole,
          }
        : responseUser;

    if (["user", "teacher"].includes(finalUser?.role)) {
      try {
        const instructorResponse = await getMyInstructorProfile();
        const instructor = instructorResponse.data?.data || instructorResponse.data;
        finalUser = {
          ...finalUser,
          accountType: "instructor",
          instructorId: instructor?._id || instructor?.id,
          instructorStatus: instructor?.status,
        };
      } catch {
        // A normal role=user account may not have an instructor profile.
      }
    }

    console.log("البيانات التي سيتم حفظها:", finalUser);

    setUser(finalUser);
    persistUser(finalUser);

    if (token) {
      localStorage.setItem("token", token);
    }

    return { user: finalUser, token };
  };

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    persistUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateUser, checkingAccountState }}>
      {children}
    </AuthContext.Provider>
  );
};
