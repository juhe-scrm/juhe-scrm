import type {CommonQueryParams} from '@/services/common';

export type GroupChatItem = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  ext_chat_id: string;
  name: string;
  owner: string;
  owner_name: string;
  create_time: Date;
  notice: string;
  member_list?: any;
  admin_list?: any;
  status: number;
  total: number;
  today_join_member_num: number;
  today_quit_member_num: number;
  tags: any[];
  owner_avatar_url: string;
  owner_role_type: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: any;
}>;

export type QueryGroupChatParams = Partial<{
  create_time_end: string;
  create_time_start: string;
  group_tag_ids: number[];
  name: string;
  owners: string[];
  status: number;
  tags_union_type: string;
}> & CommonQueryParams;
