import { baseUrlApi } from "@/api/utils";
import { http } from "@/utils/http";

type ResultTable = {
  success: boolean;
  data?: {
    /** 列表数据 */
    list?: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};
const FileList = baseUrlApi("/serveresource/list");
const Role = baseUrlApi("/role");
/** 获取文件资源列表 */
export const getFileList = (data?: object) => {
  return http.request<ResultTable>("POST", FileList, { data });
};
/** 获取系统管理-角色编辑 */
export const actionRole = (data: any) => {
  const method = data?.id ? "put" : "post";
  return http.request<ResultTable>(method, Role, { data });
};

/** 角色管理-删除 */
export const delRole = (params: object) => {
  return http.request<ResultTable>("delete", Role, { params });
};
