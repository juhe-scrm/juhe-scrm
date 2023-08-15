
import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../../../config/constant';

type QueryEntepriseScriptListParams = Partial<{
  page: number;
  page_size: number;
}>
type CreateEntepriseScriptListParams = Partial<{
  group_id: string;
  name: string;
  quick_replies: [
    {
      content: string;
      content_type: number;
      deleted: number;
      name: string;
    }
  ]
}>
type QueryEnterpriseScriptGroupsParams = Partial<{
  page: number;
  page_size: number;
  group_id?: string;
  department_id?: number[];
  key_word?: string;
}>
type QueryDepartmentParams = Partial<{
  ext_dept_ids: number[]
  ext_parent_id: number,
  page: number,
  page_size: number,
  sort_field: string,
  sort_type: string,
  total_rows: number
}>

// 话术库分组详情
export async function QueryEnterpriseScriptGroups(params?: QueryEnterpriseScriptGroupsParams) {
  return request(`${StaffAdminApiPrefix}/quick-reply-groups`, {
    params,
  });
}

// 新增话术库组
export async function CreateEnterpriseScriptGroups(params: ScriptGroup.Item) {
  return request(`${StaffAdminApiPrefix}/quick-reply-group`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 更新话术库组
export async function UpdateEnterpriseScriptGroups(params: ScriptGroup.Item) {
  return request(`${StaffAdminApiPrefix}/quick-reply-group/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

// 删除话术库组
export async function DeleteEnterpriseScriptGroups(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/quick-reply-group/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取企业话术数据
export async function QueryEnterpriseScriptList(params?: QueryEntepriseScriptListParams) {
  return request(`${StaffAdminApiPrefix}/quick-replies`, {
    params,
  });
}

// 新增企业话术
export async function CreateEnterpriseScriptList(params?: CreateEntepriseScriptListParams) {
  return request(`${StaffAdminApiPrefix}/quick-reply`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 删除企业话术
export async function DeleteEnterpriseScriptList(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/quick-reply/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
// 更新企业话术
export async function UpdateEnterpriseScriptList(params: Script.Item) {
  return request(`${StaffAdminApiPrefix}/quick-reply`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

// 获取部门列表
export async function QueryDepartmentList(params?: QueryDepartmentParams) {
  return request(`${StaffAdminApiPrefix}/departments`, {
    params,
  });
}

// 获取上传文件预签名url
export async function GetSignedUrl(params: { file_name: string }) {
  return request(`${StaffAdminApiPrefix}/common/action/get-signed-url`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
