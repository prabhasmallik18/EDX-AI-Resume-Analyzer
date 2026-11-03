import { clearSession } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const getJson = async (response, fallbackMessage) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // Token expired or invalid: log out and go to the login page.
  if (response.status === 401) {
    clearSession();
    window.location.assign("/login");
    throw new Error("Your session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
};

export const uploadResume = async (file, token) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch(`${BASE_URL}/resume/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return getJson(response, "Upload failed.");
};

export const getMyResumes = async (token) => {
  const response = await fetch(`${BASE_URL}/resume/my-resumes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return getJson(response, "Unable to load resumes.");
};

export const getResumeById = async (id, token) => {
  const response = await fetch(`${BASE_URL}/resume/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return getJson(response, "Unable to load resume analysis.");
};

export const deleteResume = async (id, token) => {
  const response = await fetch(`${BASE_URL}/resume/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return getJson(response, "Unable to delete resume.");
};

export const getResumeStats = async (token) => {
  const response = await fetch(`${BASE_URL}/resume/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return getJson(response, "Unable to load statistics.");
};

export const matchJob = async (id, payload, token) => {
  const response = await fetch(`${BASE_URL}/resume/${id}/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return getJson(response, "Unable to match this resume to the job.");
};

export const reanalyzeResume = async (id, token) => {
  const response = await fetch(`${BASE_URL}/resume/${id}/reanalyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return getJson(response, "Unable to analyse this resume again.");
};
