import request from '@/utils/request';
import {StaffAdminApiPrefix} from '../../../../config/constant';
import type {CustomerItem, QueryCustomerParams} from '@/pages/StaffAdmin/Customer/data';

export type UpdateCustomerTagsParams = Partial<{
  add_ext_tag_ids: string[];
  remove_ext_tag_ids: string[];
  ext_customer_ids: string[];
  ext_staff_id: string;
}>

export type CustomerInternalTagsParams = Partial<{
  add_tags: string[];
  ext_customer_id: string;
  ext_staff_id: string;
}>

export interface CustomerInterface {
  is_notify_staff: number;
}

export type QueryCustomerEventsParams = Partial<{
  event_type: string;
  page: number;
  page_size: number;
  sort_field: string;
  sort_type: string;
  total_rows: number;
}> & {
  ext_customer_id: string;
  ext_staff_id: string;
}

export type QueryPersonalTagsParams = Partial<{
  page: number;
  page_size: number;
  sort_field: string;
  sort_type: string;
  total_rows: number;
}> & {
  ext_staff_id: string;
}

export type UpdateBasicInfoAndRemarkParams = Partial<{
  age: number;
  description: string;
  email: string;
  phone_number: string;
  remark_field: { remark_id: string, remark_type: string, remark_value: string }[];
}> & {
  ext_staff_id: string;
  ext_customer_id: string;
}

// 查询
export async function QueryCustomer(params?: QueryCustomerParams) {
  return request(`${StaffAdminApiPrefix}/customers`, {
    method: 'GET',
    params,
  });
}

// 客户详情
export async function GetCustomerDetail(ext_id: string) {
  return request(`${StaffAdminApiPrefix}/customer/${ext_id}`, {
    method: 'GET',
  });
}

// 导出
export async function ExportCustomer(params?: QueryCustomerParams) {
  return request(`${StaffAdminApiPrefix}/customers/action/export`, {
    responseType: 'blob',
    method: 'GET',
    params,
  });
}

// 增加标签(企业)
export async function UpdateCustomerTags(params: UpdateCustomerTagsParams) {
  return request(`${StaffAdminApiPrefix}/customer/action/update-tags`, {
    method: 'POST',
    data: {
      ...params
    },
  });
}

// 增加标签（个人）
export async function CustomerInternalTags(params: CustomerInternalTagsParams) {
  return request(`${StaffAdminApiPrefix}/customer/action/update-internal-tags`, {
    method: 'POST',
    data: {
      ...params
    },
  });
}

export async function UpdateCustomer(params: CustomerItem) {
  return request(`${StaffAdminApiPrefix}/customer`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 客户动态列表
export async function QueryCustomerEvents(params: QueryCustomerEventsParams) {
  return request(`${StaffAdminApiPrefix}/customer/events`, {
    method: 'GET',
    params,
  });
}

// 内部标签列表
export async function QueryInternalTags(params: QueryPersonalTagsParams) {
  return request(`${StaffAdminApiPrefix}/customer/internal-tags`, {
    method: 'GET',
    params,
  });
}

// 删除内部标签
export async function DeleteInternalTags(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/customer/internal-tag/action/delete`, {
    method: 'POST',
    params,
  });
}

// 创建内部标签
export async function CreateInternalTag(params: { names: string[] }) {
  return request(`${StaffAdminApiPrefix}/customer/internal-tag`, {
    method: 'POST',
    params,
  });
}

// 自定义信息列表(键值对信息)
export async function QueryCustomerRemark() {
  return request(`${StaffAdminApiPrefix}/customer/remark`, {
    method: 'GET',
  });
}

// 客户基本信息展示规则
export async function GetCustomerBasicInfoDisplay() {
  return request(`${StaffAdminApiPrefix}/customer/info/displays`, {
    method: 'GET',
  });
}

// 基本信息&自定义信息取值
export async function GetBasicInfoAndRemarkValues(params: { ext_staff_id: string, ext_customer_id: string }) {
  return request(`${StaffAdminApiPrefix}/customer/info`, {
    method: 'GET',
    params
  });
}

// 更新基本信息&自定义信息
export async function UpdateBasicInfoAndRemark(params: UpdateBasicInfoAndRemarkParams) {
  return request(`${StaffAdminApiPrefix}/customer/info`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

