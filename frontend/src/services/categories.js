import { apiGet } from "./api";

export async function listCategories() {
  return await apiGet("/api/categories");
}

