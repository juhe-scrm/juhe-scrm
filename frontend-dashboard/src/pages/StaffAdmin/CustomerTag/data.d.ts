import type { CommonQueryParams, Pager } from '@/services/common';

export type CustomerTagGroupItem = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  ext_id: string;
  name: string;
  create_time: number;
  order: number;
  department_list?: number[];
  tags: CustomerTag[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;

  remove_ext_tag_ids?: string[];
}>;

export type CreateCustomerTagParam = Partial<CustomerTag> & {
  ext_tag_group_id: string;
  names: string[];
};

export type CreateCustomerTagGroupParam = Partial<{
  department_list: number[];
  tag_name: string[];
  name: string;
}>;

export type CustomerTag = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  ext_tag_id: string;
  ext_id: string;
  group_name: string;
  name: string;
  create_time: number;
  order: number;
  type: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}>;

export type CustomerTagGroupListData = {
  items: CustomerTagGroupItem[];
  pager: Partial<Pager>;
};

export type QueryCustomerTagGroupParams = {
  ext_department_ids?: number[];
  name?: string;
} & CommonQueryParams;
