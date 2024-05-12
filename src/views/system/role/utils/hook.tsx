import {
  actionRole,
  actionRoleMenuIds,
  delRole,
  getMenuList,
  getRoleList,
  getRoleMenuIds
} from "@/api/system";
import { addDialog } from "@/components/ReDialog";
import { transformI18n } from "@/plugins/i18n";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection, getKeyList, handleTree } from "@pureadmin/utils";
import dayjs from "dayjs";
import { ElMessageBox } from "element-plus";
import { h, onMounted, reactive, ref, toRaw, watch, type Ref } from "vue";
import { usePublicHooks } from "../../hooks";
import editForm from "../form.vue";
import type { FormItemProps } from "../utils/types";

export function useRole(treeRef: Ref) {
  const form = reactive({
    name: "",
    code: "",
    status: ""
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const treeData = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(false);
  const treeSearchValue = ref();
  const switchLoadMap = ref({});
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const { switchStyle } = usePublicHooks();
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "角色编号",
      prop: "id"
    },
    {
      label: "角色名称",
      prop: "name"
    },
    {
      label: "角色标识",
      prop: "code"
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      ),
      minWidth: 90
    },
    {
      label: "备注",
      prop: "describe",
      minWidth: 160
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "!h-[20px]",
  //     "reset-margin",
  //     "!text-gray-500",
  //     "dark:!text-white",
  //     "dark:hover:!text-primary"
  //   ];
  // });

  function onChange({ row }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        let params = {
          ...row
        };
        const { success } = await actionRole(params);
        if (success) {
          message("已成功修改角色状态", {
            type: "success"
          });
        }
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  function handleDelete(row) {
    ElMessageBox.confirm(
      `确认要<strong>删除</strong><strong style='color:var(--el-color-primary)'> ${row.name} 角色</strong>吗?`,
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
        const { success } = await delRole(params);
        if (success) {
          message(`您删除了角色名称为${row.name}的这条数据`, {
            type: "success"
          });
          onSearch();
        }
      })
      .catch(() => {
        message(`取消操作!`, { type: "info" });
      });
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch(); // 刷新表格数据
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch(); // 刷新表格数据
  }

  function handleSelectionChange(val) {
    console.log("表格多选", val);
  }

  async function onSearch() {
    loading.value = true;
    try {
      const params = {
        ...toRaw(form),
        pageSize: pagination.pageSize,
        currentPage: pagination.currentPage
      };
      const { data } = await getRoleList(params);
      dataList.value = data.list;
      pagination.total = data.total;
      pagination.pageSize = data.pageSize;
      pagination.currentPage = data.currentPage;
    } finally {
      loading.value = false;
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          id: row?.id ?? "",
          name: row?.name ?? "",
          code: row?.code ?? "",
          describe: row?.describe ?? ""
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
          message(`您${title}了角色名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (valid) {
            await actionRole(curData);
            chores();
          }
        });
      }
    });
  }

  /** 菜单权限 */
  async function handleMenu(row?: any) {
    const { id } = row;
    if (id) {
      curRow.value = row;
      isShow.value = true;
      const { data } = await getRoleMenuIds({ id });
      const roleMenu = data.roleMenu as any[];
      const roleIds = roleMenu.map(item => item.mId);
      treeRef.value.setCheckedKeys(roleIds);
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存 */
  async function handleSave() {
    const { name } = curRow.value;
    try {
      let params = {
        ...curRow.value,
        roleMenu: treeRef.value.getCheckedKeys()
      };
      //TODO: 分派权限
      const { success } = await actionRoleMenuIds(params);
      if (success) {
        message(`角色名称为${name}的菜单权限修改成功`, {
          type: "success"
        });
      }
    } catch (error) {}
  }

  /** 数据权限 可自行开发 */
  // function handleDatabase() {}

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return transformI18n(node.title)!.includes(query);
  };

  onMounted(async () => {
    onSearch();
    const { data } = await getMenuList();
    treeData.value = handleTree(data, "id", "pId", "children");
    treeIds.value = getKeyList(data, "id");
  });

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleSave,
    handleDelete,
    filterMethod,
    transformI18n,
    onQueryChanged,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
