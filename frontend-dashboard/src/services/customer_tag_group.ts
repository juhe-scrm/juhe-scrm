import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../config/constant';
import type { CommonQueryParams, CommonResp, Pager } from '@/services/common';

export interface CustomerTagGroupInterface {
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  ext_id: string;
  name: string;
  create_time: number;
  order: number;
  department_list?: number[];
  tags: Tag[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface Tag {
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  ext_id: string;
  ext_group_id: string;
  name: string;
  group_name: string;
  create_time: number;
  order: number;
  type: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export type QueryCustomerTagGroupParams = {
  ext_department_id?: number; // 部门ID
  name?: string;
} & CommonQueryParams;

// QueryCustomerTagGroup 查询客户标签组列表
export async function QueryCustomerTagGroups(params: QueryCustomerTagGroupParams): Promise<
  {
    data?: {
      items?: CustomerTagGroupInterface[];
      pager: Pager;
    };
  } & CommonResp
> {
  return request(`${StaffAdminApiPrefix}/customer/tag-groups`, {
    params,
  });
}
