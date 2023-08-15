import type { CommonQueryParams, Pager } from '@/services/common';

export type ContactWayGroupItem = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  name: string;
  sort_weight: number;
  count: number;
  is_default: number;
}>;

export type ContactWayGroupListData = {
  items: ContactWayGroupItem[];
  pager: Partial<Pager>;
};

export type QueryContactWayGroupParams = {
  id?: number;
  name?: string;
} & CommonQueryParams;

export interface Image {
  media_id: string;
  pic_url: string;
}

export interface Link {
  title: string;
  url: string;
  picurl: string;
  desc: string;
}

export interface Video {
  media_id: string;
}

export interface Miniprogram {
  title: string;
  pic_media_id: string;
  app_id: string;
  page: string;
}

export interface Attachment {
  msgtype: string;
  image: Image;
  link: Link;
  video: Video;
  miniprogram: Miniprogram;
}

export interface AutoReply {
  text: string;
  attachments: Attachment[];
}

export interface Staff {
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  contact_way_id: string;
  avatar_url: string;
  add_customer_count: number;
  daily_add_customer_count: number;
  daily_add_customer_limit: number;
  staff_id: string;
  ext_staff_id: string;
  name: string;
  online: number;
  schedule_enable: number;
  weekdays: string[];
  start_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface BackupStaff {
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  contact_way_id: string;
  avatar_url: string;
  add_customer_count: number;
  daily_add_customer_count: number;
  daily_add_customer_limit: number;
  staff_id: string;
  ext_staff_id: string;
  name: string;
  online: number;
  schedule_enable: number;
  weekdays?: any;
  start_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface ScheduleStaff {
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  contact_way_id: string;
  contact_way_schedule_id: string;
  add_customer_count: number;
  daily_add_customer_count: number;
  daily_add_customer_limit: number;
  ext_staff_id: string;
  name: string;
  avatar_url: string;
  online: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export type Schedule = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  contact_way_id: string;
  daily_add_customer_limit: number;
  weekdays: string[];
  start_time: any;
  end_time: any;
  staffs: ScheduleStaff[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;

  ext_staff_ids?: string[];
}>;

export interface CustomerTag {
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  ext_tag_id: string;
  ext_id: string;
  name: string;
  group_name: string;
  create_time: number;
  order: number;
  type: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export type ContactWayItem = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  name: string;
  config_id: string;
  group_id: string;
  qr_code: string;
  remark: string;
  skip_verify: number;
  state: string;
  add_customer_count: number;
  auto_reply_type: number;
  auto_reply: AutoReply;
  customer_desc: string;
  customer_desc_enable: number;
  customer_remark: string;
  customer_remark_enable: number;
  daily_add_customer_limit_enable: number;
  schedule_enable: number;
  staff_control_enable: number;
  staffs?: Staff[];
  backup_staffs: BackupStaff[];
  schedules?: Schedule[];
  customer_tags: CustomerTag[];
  auto_tag_enable: number;
  customer_tag_ext_ids: string[];
  auto_skip_verify_enable: number;
  skip_verify_start_time: string;
  skip_verify_end_time: string;
  ext_staff_ids: string[];
  nickname_block_enable: number;
  nickname_block_list: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}>;

export type ContactWayListData = {
  items: ContactWayItem[];
  pager: Partial<Pager>;
};

export type QueryContactWayParams = {
  id?: number;
  name?: string;
} & CommonQueryParams;

export interface Text {
  content: string;
}

export interface StaffParam {
  id?: string;
  ext_staff_id: string;
  daily_add_customer_limit?: number;
}

export interface BackupStaffParam {
  id?: string;
  ext_staff_id: string;
  daily_add_customer_limit?: number;
}

export interface CreateContactWayParam {
  name: string;
  group_id: string;
  remark: string;
  skip_verify: number | boolean;
  auto_reply_type: number;
  auto_reply?: AutoReply;
  customer_desc: string;
  customer_desc_enable: number | boolean;
  customer_remark: string;
  customer_remark_enable: number | boolean;
  daily_add_customer_limit_enable?: number | boolean;
  daily_add_customer_limit: number;
  schedule_enable: number;
  auto_tag_enable: number | boolean;
  customer_tag_ext_ids: string[];
  staffs?: StaffParam[];
  backup_staffs?: BackupStaffParam[];
  schedules?: Schedule[];
  auto_skip_verify_enable: number | boolean;
  skip_verify_start_time: any;
  skip_verify_end_time: any;
  staff_control_enable: number | boolean;
  nickname_block_enable: number | boolean;
  nickname_block_list: string[];
}

export interface UpdateContactWayParam extends CreateContactWayParam {
  id: string;
}
