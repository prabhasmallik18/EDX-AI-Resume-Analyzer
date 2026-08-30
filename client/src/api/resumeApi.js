const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getJson = async (response, fallbackMessage) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
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
