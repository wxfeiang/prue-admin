import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";
type Result = {
  success: boolean;
  data: Array<any>;
};
const fileUpload = baseUrlApi("/base/uploadLocal");
/** 地图数据 */
export const mapJson = (params?: object) => {
  return http.request<Result>("get", "/get-map-info", { params });
};

/** 文件上传 */
export const formUpload = data => {
  return http.request<Result>(
    "post",
    fileUpload,
    { data },
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};
