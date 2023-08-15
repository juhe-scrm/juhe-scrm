
import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../../../config/constant';

type QueryStaffsParams = Partial<{
  ext_department_ids: number;
  name: string;
  page: number;
  page_size: number;
  role_id: number | string;
  sort_field: string;
  sort_type: string;
  total_rows: number;
  type: string;
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

// 同步企微员工数据
export async function Sync() {
  return request(`${StaffAdminApiPrefix}/staff`, {
    method: 'POST',
  });
}
// 获取企微员工数据
export async function QueryStaffsList(params?: QueryStaffsParams) {
  return request(`${StaffAdminApiPrefix}/staffs`, {
    params,
  });
}
// 获取部门列表
export async function QueryDepartmentList(params?: QueryDepartmentParams) {
  return request(`${StaffAdminApiPrefix}/departments`, {
    params,
  });
}
