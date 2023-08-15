import type {CommonQueryParams} from '@/services/common';

export interface ExternalProfile {
  external_corp_name: string;
  external_attr?: any;
}

export type CustomerItem = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  ext_customer_id: string;
  name: string;
  position: string;
  corp_name: string;
  avatar: string;
  type: number;
  gender: number;
  unionid: string;
  external_profile: ExternalProfile;
  staff_relations: StaffRelation[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}>;

export type TextInfo = {
  value: string;
}

export type StaffRelation = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  ext_staff_id: string;
  ext_customer_id: string;
  remark: string;
  description: string;
  createtime: Date;
  remark_corp_name: string;
  remark_mobiles: any[];
  add_way: number;
  oper_userid: string;
  state: string;
  customer_delete_staff_at: Date;
  staff_delete_customer_at: Date;
  is_notified: number;
  ext_tag_ids?: any;
  customer_staff_tags: CustomerRelationTag[];
  internal_tags?: string [];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}>

export type CustomerRelationTag = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  customer_staff_id: string;
  ext_tag_id: string;
  group_name: string;
  tag_name: string;
  type: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}>

export type QueryCustomerParams = {
  channel_type: string;
  end_time: number;
  ext_staff_id: string;
  gender: number;
  name: string;
  out_flow_status: number;
  page: number;
  page_size: number;
  sort_field: string;
  sort_type: string;
  start_time: number;
  tag_union_type: string;
} & CommonQueryParams;

declare module CustomerEvents {

  export interface Item {
    id: string;
    ext_corp_id: string;
    ext_creator_id: string;
    content: string;
    event_type: string;
    event_name: string;
    ext_customer_id: string;
    ext_staff_id: string;
    relate_staff_avatar: string;
    relate_staff_name: string;
    send_at: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
  }

  export interface Pager {
    page: number;
    page_size: number;
    total_rows: number;
  }

  export interface Data {
    items: Item[];
    pager: Pager;
  }

  export interface RootObject {
    code: number;
    message: string;
    data: Data;
  }

}

declare module InternalTags {

  export interface Item {
    id: string;
    ext_corp_id: string;
    ext_creator_id: string;
    ext_staff_id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
  }

  export interface Pager {
    page: number;
    page_size: number;
    total_rows: number;
  }

  export interface Data {
    items: Item[];
    pager: Pager;
  }

  export interface RootObject {
    code: number;
    message: string;
    data: Data;
  }

}

