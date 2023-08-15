import type {CommonQueryParams} from '@/services/common';

export type RoleItem = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  name: string;
  description: string;
  type: string;
  count: number;
  sort_weight: number;
  is_default: number;
  permission_ids: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}>;


export type CreateRoleParam = {
  name: string;
  description: string;
  permission_ids: string[];
};

export type UpdateRoleParam = Partial<{
  id: string;
  name: string;
  description: string;
  permission_ids: string[];
}>;

// AssignRoleToStaffParam 对员工授予角色
export type AssignRoleToStaffParam = {
  role_id: string;
  ext_staff_ids: string[];
};

// QueryRoleStaffsParam 查询某角色下的员工列表
export type QueryRoleStaffsParam = Partial<{
  staff_id: string;
  ext_staff_id: string;
  name: string;
  role_id: string;
  role_type: string;
}> & CommonQueryParams;


export type QueryRoleParam = {
  name?: string;
} & CommonQueryParams;
