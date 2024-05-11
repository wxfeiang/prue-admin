import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type Result = {
  success: boolean;
  data?: Array<any>;
};
type ResultObj = {
  success: boolean;
  data?: any;
};
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
const emplist = baseUrlApi("/employee/list");
const empChangestaus = baseUrlApi("/employee/status");
const menuTree = baseUrlApi("/menu/tree");
const Menu = baseUrlApi("/menu");
const menuList = baseUrlApi("/menu/list");
const roleList = baseUrlApi("/role/list");
const Role = baseUrlApi("/role");
const getRolePermissions = baseUrlApi("/role/rolePermissions");
const updateRole = baseUrlApi("/role/updateRole");

/** 获取系统管理-用户管理列表 */
export const getUserList = (data?: object) => {
  return http.request<ResultTable>("post", emplist, { data });
};

/** 获取系统管理-用户管理列表 */
export const getUserStatus = (params?: any) => {
  return http.request<ResultTable>(
    "post",
    empChangestaus + "/" + params.status,
    { params: { ids: params.ids } }
  );
};

/** 系统管理-用户管理-获取所有角色列表 */
export const getAllRoleList = () => {
  return http.request<Result>("get", "/list-all-role");
};

/** 系统管理-用户管理-根据userId，获取对应角色id列表（userId：用户id） */
export const getRoleIds = (data?: object) => {
  return http.request<Result>("post", "/list-role-ids", { data });
};

/** 获取系统管理-角色管理列表 */
export const getRoleList = (data: object) => {
  return http.request<ResultTable>("post", roleList, { data });
};

/** 获取系统管理-角色新增/编辑 */
export const actionRole = (data: object) => {
  return http.request<ResultTable>("post", Role, { data });
};
/** 角色管理-删除 */
export const delRole = (params: object) => {
  return http.request<ResultTable>("delete", Role, { params });
};

/** 角色管理-权限表-菜单权限 */
export const getRoleMenu = (params: object) => {
  return http.request<ResultTable>("get", Role, { params });
};

/** 获取角色管理-权限-菜单权限-根据角色 id 查对应菜单 */
export const getRoleMenuIds = (params: object) => {
  return http.request<ResultObj>("get", getRolePermissions, { params });
};

/** 获取角色管理-权限-角色 -分派权限 */
export const actionRoleMenuIds = (data: object) => {
  return http.request<Result>("put", updateRole, { data });
};

/** 获取系统管理-菜单树 */
export const getMenuTree = () => {
  return http.request<Result>("get", menuTree);
};

/** 获取系统管理-菜单管理列表 */
export const getMenuList = () => {
  return http.request<Result>("get", menuList);
};

/** 获取系统管理-菜单管理列表 */
export const actionMenu = (data: object) => {
  return http.request<Result>("post", Menu, { data });
};

/** 获取系统管理-部门管理列表 */
export const getDeptList = (data?: object) => {
  return http.request<Result>("post", "/dept", { data });
};

/** 获取系统监控-在线用户列表 */
export const getOnlineLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/online-logs", { data });
};

/** 获取系统监控-登录日志列表 */
export const getLoginLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/login-logs", { data });
};

/** 获取系统监控-操作日志列表 */
export const getOperationLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/operation-logs", { data });
};

/** 获取系统监控-系统日志列表 */
export const getSystemLogsList = (data?: object) => {
  return http.request<ResultTable>("post", "/system-logs", { data });
};

/** 获取系统监控-系统日志-根据 id 查日志详情 */
export const getSystemLogsDetail = (data?: object) => {
  return http.request<Result>("post", "/system-logs-detail", { data });
};
