import type {CommonQueryParams} from '@/services/common';

export type GroupChatTagGroupItem = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  customer_group_tag_id: string;
  name: string;
  tags: GroupChatTag[];
  delete_tag_ids: string[];
}>;

export type GroupChatTag = Partial<{
  id: string;
  ext_corp_id: string;
  ext_creator_id: string;
  customer_group_tag_group_id: string;
  name: string;
}>;

export type QueryGroupChatTagGroupParams = {
  name?: string;
} & CommonQueryParams;
