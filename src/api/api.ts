import axios from "axios";

// const api = axios.create({
//   baseURL: "https://monospermous-watchfully-luetta.ngrok-free.dev/api",
//   headers: {
//     "ngrok-skip-browser-warning": "true"
//   }
// });

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getTables = () => api.get("/schema");

export const getSchema = (table: string) =>
  api.get(`/schema/${table}`);

export const createTable = (data: any) =>
  api.post("/schema", data);

export const addColumn = (table: string, data: any) =>
  api.post(`/schema/${table}/column`, data);

export const deleteColumn = (table: string, column: string) =>
  api.delete(`/schema/${table}/column/${column}`);

export const updateColumn = (table: string, name: string, data: any) =>
  api.put(`/schema/${table}/column/${name}`, data);


//tables

export const getTableData = (
  table: string,
  params: {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  }
) => api.get(`/table/${table}`, { params });

export const insertData = (table: string, data: any) =>
  api.post(`/table/${table}`, data);


export const getSingleData = (table: string, id: string) =>
  api.get(`/table/${table}/${id}`);

export const updateData = (table: string, id: string, data: any) =>
  api.put(`/table/${table}/${id}`, data);

export const deleteData = (table: string, id: string) =>
  api.delete(`/table/${table}/${id}`);


export const uploadFiles = (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export default api;