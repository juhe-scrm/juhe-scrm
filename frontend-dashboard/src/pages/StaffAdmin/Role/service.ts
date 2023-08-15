import request from '@/utils/request';
import {StaffAdminApiPrefix} from '../../../../config/constant';
import type {
  AssignRoleToStaffParam,
  CreateRoleParam,
  QueryRoleParam,
  QueryRoleStaffsParam,
  UpdateRoleParam
} from "@/pages/StaffAdmin/Role/data";

export async function Query(params?: QueryRoleParam) {
  return request(`${StaffAdminApiPrefix}/roles`, {
    params: {
      ...params,
      sort_type: 'desc',
      sort_field: 'sort_weight',
    },
  });
}

export async function Create(params: CreateRoleParam) {
  return request(`${StaffAdminApiPrefix}/role`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// AssignRoleToStaff 对员工授予角色
export async function AssignRoleToStaff(params: AssignRoleToStaffParam) {
  return request(`${StaffAdminApiPrefix}/role/action/assign-to-staffs`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 查询授权员工
export async function QueryRoleStaff(params?: QueryRoleStaffsParam) {
  return request(`${StaffAdminApiPrefix}/role/action/query-staffs`, {
    params,
  });
}


export async function Update(params: UpdateRoleParam) {
  return request(`${StaffAdminApiPrefix}/role/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function Get(id: string) {
  return request(`${StaffAdminApiPrefix}/role/${id}`, {
    method: 'GET',
  });
}
