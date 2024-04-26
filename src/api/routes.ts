import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type Result = {
  success: boolean;
  data: Array<any>;
};
const ROUTER = baseUrlApi("/menu/roleMenu");
export const getAsyncRoutes = params => {
  //return http.request<Result>("get", "/get-async-routes");
  return http.request<Result>("get", ROUTER, { params });
};
