import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../config/constant';
import type { CommonQueryParams, CommonResp, Pager } from '@/services/common';

export interface StaffInterface {
  id: string;
  ext_corp_id: string;
  ext_staff_id: string;
  role_id: string;
  type: string;
  name: string;
  address: string;
  alias: string;
  avatar_url: string;
  email: string;
  gender: number;
  status: number;
  mobile: string;
  qr_code_url: string;
  telephone: string;
  is_enabled: boolean;
  signature: string;
  external_position: string;
  external_profile: string;
  extattr: string;
  external_user_count: number;
  corp_id: string;
  dept_ids: number[];
  order?: any;
  is_leader_in_dept?: any;
  welcome_msg_id: string;
}

export type QueryStaffParams = {
  ext_department_id?: number; // 部门ID
  name?: string;
  role_id?: string; // 角色ID
  role_type?: string; // 角色类型 Admin DepartmentAdmin Staff
} & CommonQueryParams;

// QueryStaff 查询员工列表
export async function QueryStaffs(params: QueryStaffParams): Promise<
  {
    data?: {
      items?: StaffInterface[];
      pager: Pager;
    };
  } & CommonResp
> {
  return request(`${StaffAdminApiPrefix}/staffs`, {
    params,
  });
}

export interface SimpleStaffInterface {
  id: string;
  ext_id: string;
  avatar_url: string;
  role_type: string;
  name: string;
  departments: {
    ext_id: number;
    name: string;
    ext_parent_id: number;
  }[];
}

// QuerySimpleStaffs 查询员工概况
export async function QuerySimpleStaffs(params: QueryStaffParams): Promise<
  {
    data?: {
      items?: SimpleStaffInterface[];
      pager: Pager;
    };
  } & CommonResp
> {
  return request(`${StaffAdminApiPrefix}/staff/action/get-all`, {
    params,
  });
}
