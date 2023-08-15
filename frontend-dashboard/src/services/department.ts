import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../config/constant';
import type { CommonQueryParams } from '@/services/common';

export interface DepartmentInterface {
  staff_num?: any;
  id: string;
  ext_corp_id: string;
  ext_id: number;
  name: string;
  ext_parent_id: number;
  order: number;
  welcome_msg_id: string;
  sub_departments?: DepartmentInterface[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

// QueryDepartment 查询部门
export async function QueryDepartment(params: CommonQueryParams & { ext_dept_ids?: number[]; ext_parent_id?: string;}) {
  return request(`${StaffAdminApiPrefix}/departments`, {
    params,
  });
}
