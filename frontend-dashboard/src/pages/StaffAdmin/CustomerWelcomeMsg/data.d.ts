import type { CommonQueryParams } from '@/services/common';

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

export type MsgType = 'image' | 'link' | 'miniprogram' | 'video';

export interface Attachment {
  id: string;
  msgtype: MsgType;
  name: string;
  image?: Image;
  link?: Link;
  video?: Video;
  miniprogram?: Miniprogram;
}

export interface WelcomeMsg {
  text: string;
  attachments?: Attachment[];
}

export interface TimePeriodMsg {
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  welcome_msg: WelcomeMsg2;
  main_welcome_msg_id: string;
  enable_time_period_msg: number;
  time_period_msg?: any;
  effective_at: number[];
  start_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}

export interface Department {
  id: string;
  ext_id: number;
  name: string;
}

export interface Staff {
  id: string;
  avatar_url: string;
  ext_staff_id: string;
  name: string;
}

export interface CustomerWelcomeMsgItem {
  id: string;
  name: string;
  ext_corp_id: string;
  ext_creator_id: string;
  welcome_msg: WelcomeMsg;
  main_welcome_msg_id?: any;
  enable_time_period_msg: number;
  time_period_msg: TimePeriodMsg[];
  effective_at?: any;
  start_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
  department: Department[];
  staffs: Staff[];
}


export type CreateCustomerWelcomeMsgParam = {
  name: string;
  welcome_msg: WelcomeMsg;
  ext_staff_ids: string[];
  enable_time_period_msg: number;
  ext_department_ids: number[];
  time_period_msg: TimePeriodMsg[];
};

export type UpdateCustomerWelcomeMsgParam = Partial<{
  id: string;
  name: string;
  welcome_msg: WelcomeMsg;
  ext_staff_ids: string[];
  enable_time_period_msg: number;
  ext_department_ids: number[];
  time_period_msg: TimePeriodMsg[];
}>;

export type QueryCustomerWelcomeMsgParam = CommonQueryParams;
