import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../../../config/constant';
import type {
  CreateCustomerTagParam,
  CustomerTagGroupItem,
  QueryCustomerTagGroupParams,
} from '@/pages/StaffAdmin/CustomerTag/data';

// 查询流失提醒记录
export async function Query(params?: QueryCustomerTagGroupParams) {
  return request(`${StaffAdminApiPrefix}/customer/tag-groups`, {
    params,
  });
}

export async function Delete(params: { ext_ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/customer/tag-group/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function Create(params: CustomerTagGroupItem) {
  return request(`${StaffAdminApiPrefix}/customer/tag-group`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function CreateTag(params: CreateCustomerTagParam) {
  return request(`${StaffAdminApiPrefix}/customer/tag`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function Sync() {
  return request(`${StaffAdminApiPrefix}/customer/tag/action/sync`, {
    method: 'POST',
  });
}

export async function Update(
  params: CustomerTagGroupItem & { ext_id: string; remove_ext_tag_ids: string[] },
) {
  return request(`${StaffAdminApiPrefix}/customer/tag-group/${params.ext_id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

// 交换标签组排序权重
export async function ExchangeOrder(params: { id: string; exchange_order_id: string }) {
  return request(`${StaffAdminApiPrefix}/customer/tag-group/action/exchange-order`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
