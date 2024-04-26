import { http } from "@/utils/http";
import { baseUrlApi } from "./utils";

type Result = {
  success: boolean;
  data?: Array<any>;
  message?: string;
  status?: number;
  code?: number;
};

const captchaImage = baseUrlApi("/base/captchaImage");

/** 基础 图片验证码 */
export const getCodeImg = (data?: object) => {
  return http.request<Result>("post", captchaImage, { data });
};
