import { DelOrganization, actionOrganization, getDeptList } from "@/api/system";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";
import { cloneDeep, deviceDetection, isAllEmpty } from "@pureadmin/utils";
import dayjs from "dayjs";
import { ElMessageBox } from "element-plus";
import { h, onMounted, reactive, ref } from "vue";
import { usePublicHooks } from "../../hooks";
import editForm from "../form.vue";
import type { FormItemProps } from "../utils/types";

export function useDept() {
  const form = reactive({
    name: "",
    status: null
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const { tagStyle } = usePublicHooks();

  const columns: TableColumnList = [
    {
      label: "部门名称",
      prop: "name",
      width: 180,
      align: "left"
    },
    {
      label: "排序",
      prop: "sort",
      minWidth: 70
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 320
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getDeptList(); // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点pId，pId取父节点id

    let newData = data;
    if (!isAllEmpty(form.name)) {
      // 前端搜索部门名称
      newData = newData.filter(item => item.name.includes(form.name));
    }
    if (!isAllEmpty(form.status)) {
      // 前端搜索状态
      newData = newData.filter(item => item.status === form.status);
    }
    dataList.value = newData; // handleTree(newData); // 处理成树结构
    loading.value = false;
  }

  function formatHigherDeptOptions(treeList) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].disabled = treeList[i].status === 0 ? true : false;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}部门`,
      props: {
        formInline: {
          id: row?.id ?? null,
          higherDeptOptions: formatHigherDeptOptions(cloneDeep(dataList.value)),
          pId: row?.pId ?? 0,
          name: row?.name ?? "",
          principal: row?.principal ?? "",
          phone: row?.phone ?? "",
          email: row?.email ?? "",
          sort: row?.sort ?? 0,
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了部门名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            console.log("curData", curData);
            // 表单规则校验通过
            delete curData.higherDeptOptions;
            const { success } = await actionOrganization(curData);
            if (success) {
              chores();
            }
          }
        });
      }
    });
  }

  function handleDelete(row) {
    ElMessageBox.confirm(
      `是否确认删除部门名称为${row.name}的这条数据${row?.children?.length > 0 ? "。注意下级菜单也会一并删除，请谨慎操作" : "?"}`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        let params = {
          id: row.id
        };
        const { success } = await await DelOrganization(params);
        if (success) {
          message(`您删除了部门名称为${row.name}的这条数据`, {
            type: "success"
          });
          onSearch();
        }
      })
      .catch(() => {
        message(`取消操作!`, { type: "info" });
      });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改部门 */
    openDialog,
    /** 删除部门 */
    handleDelete,
    handleSelectionChange
  };
}
