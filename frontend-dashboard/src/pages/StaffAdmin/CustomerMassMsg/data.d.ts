import type { CommonQueryParams } from '@/services/common';

export type MsgType = 'image' | 'link' | 'miniprogram' | 'video';

export interface Image {
  title: string;
  media_id?: string;
  pic_url: string;
}

export interface Link {
  title: string;
  url: string;
  picurl?: string;
  desc?: string;
}

export interface Video {
  title: string;
  media_id: string;
}

export interface Miniprogram {
  title: string;
  pic_media_id: string;
  app_id: string;
  page: string;
}


export interface Attachment {
  id: string;
  msgtype: MsgType;
  name: string;
  image?: Image;
  link?: Link;
  video?: Video;
  miniprogram?: Miniprogram;
}

export interface Msg {
  text: string;
  attachments?: Attachment[];
}

export interface ExtCustomerFilter {
  ext_staff_ids?: string[];
  ext_customer_ids?: string[];
  ext_group_chat_ids?: string[];
  gender?: number;
  ext_department_ids?: any;
  ext_tag_ids?: string[];
  tag_logical_condition?: any;
  exclude_ext_tag_ids?: string[];
  start_time?: string;
  end_time?: string;
}

export interface Staff {
  id: string;
  avatar_url: string;
  ext_staff_id: string;
  name: string;
}

export interface CustomerMassMsgItem {
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  send_type: number;
  exd_staff_ids: string[];
  ext_department_ids?: any;
  msg: Msg;
  ext_msg_id: string;
  mission_status: number;
  ext_customer_filter_enable: number;
  ext_customer_filter: ExtCustomerFilter;
  delivered_num: number;
  success_num: number;
  undelivered_num: number;
  failed_num: number;
  staffs?: Staff[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface CreateCustomerMassMsgParam {
  id?: string;
  ext_customer_filter_enable: 1 | 2;
  chat_type: string;
  ext_staff_ids: string[];
  msg: Msg;
  ext_customer_filter?: ExtCustomerFilter;
  send_at: string;
  send_type: number;
  ext_department_ids: number[];
}

export type QueryCustomerMassMsgParam = CommonQueryParams;
