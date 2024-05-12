interface FormItemProps {
  id?: number; // 部门id
  higherDeptOptions: Record<string, unknown>[];
  pId: number;
  name: string;
  principal: string;
  phone: string | number;
  email: string;
  sort: number;
  status: number;
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
