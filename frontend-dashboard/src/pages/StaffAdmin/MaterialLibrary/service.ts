import request from '@/utils/request';
import {StaffAdminApiPrefix} from '../../../../config/constant';

type QueryMaterialLibraryTagsParams = Partial<{
  name: string;
  page: number;
  page_size: number;
  sort_field: string;
  sort_type: string;
  total_rows: number;
}>

type QueryMaterialListParams = Partial<{
  title: string;
  page: number;
  page_size: number;
  sort_field: string;
  sort_type: string;
  total_rows: number;
  material_type: string;
  material_tag_list: string[];
}>

export type MaterialParams = Partial<{
  id: string;
  content: string;
  digest: string;
  file_size: string;
  file_url: string;
  link: string;
  material_tag_list: string[];
  title: string;
  material_type: string;
}>


// 查询素材库标签列表
export async function QueryMaterialLibraryTags(params?: QueryMaterialLibraryTagsParams) {
  return request(`${StaffAdminApiPrefix}/material/lib/tags`, {
    params,
  });
}

// 新增素材库标签
export async function CreateMaterialLibraryTag(params: { names: string[] }) {
  return request(`${StaffAdminApiPrefix}/material/lib/tag`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除素材库标签
export async function DeleteMaterialLibraryTag(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/material/lib/tag/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 新增素材库素材
export async function CreateMaterial(params: MaterialParams) {
  return request(`${StaffAdminApiPrefix}/material/lib`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 查询素材库列表
export async function QueryMaterialList(params?: QueryMaterialListParams) {
  return request(`${StaffAdminApiPrefix}/material/libs`, {
    params,
  });
}

// 更新素材
export async function UpdateMaterial(params: MaterialParams) {
  return request(`${StaffAdminApiPrefix}/material/lib/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

// 删除素材
export async function DeleteMaterial(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/material/lib/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
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
// 获取素材库侧边栏开关状态
export async function getMaterialSidebarStatus(params?: any) {
  return request(`${StaffAdminApiPrefix}/material/lib/sidebar-status`,{
    params,
  });
}

// 更新素材库侧边栏开关状态
export async function updateMaterialSidebarStatus(params: {status: number}) {
  return request(`${StaffAdminApiPrefix}/material/lib/sidebar-status`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}
