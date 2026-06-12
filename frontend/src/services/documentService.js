import api from "../api/axios";

export const getDocuments = async () => {
  const response = await api.get("/api/documents");
  return response.data;
};