import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../../../config/constant';
import type {
  ContactWayGroupItem,
  ContactWayItem,
  QueryContactWayGroupParams,
  QueryContactWayParams,
} from '@/pages/StaffAdmin/ContactWay/data';
import type {
  CreateContactWayParam,
  UpdateContactWayParam,
} from '@/pages/StaffAdmin/ContactWay/data';

// 渠道活码分组
export async function QueryGroup(params?: QueryContactWayGroupParams) {
  return request(`${StaffAdminApiPrefix}/contact-way-groups`, {
    params,
  });
}

export async function DeleteGroup(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/contact-way-group/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function CreateGroup(params: ContactWayGroupItem) {
  return request(`${StaffAdminApiPrefix}/contact-way-group`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function UpdateGroup(params: ContactWayGroupItem) {
  return request(`${StaffAdminApiPrefix}/contact-way-group/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

// 获取渠道活码详情
export async function GetDetail(id: string) {
  return request(`${StaffAdminApiPrefix}/contact-way/${id}`);
}

// 渠道活码
export async function Query(params?: QueryContactWayParams) {
  return request(`${StaffAdminApiPrefix}/contact-ways`, {
    params,
  });
}

export async function Delete(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/contact-way/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function Create(params: CreateContactWayParam) {
  return request(`${StaffAdminApiPrefix}/contact-way`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function Update(id: string, params: UpdateContactWayParam) {
  return request(`${StaffAdminApiPrefix}/contact-way/${id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function BatchUpdate(params: { ids: string[] } & ContactWayItem) {
  return request(`${StaffAdminApiPrefix}/contact-way/action/batch-update`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
