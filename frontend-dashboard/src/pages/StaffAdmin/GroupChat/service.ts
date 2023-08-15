import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../../../config/constant';
import type { QueryGroupChatParams } from '@/pages/StaffAdmin/GroupChat/data';
import type { GroupChatItem } from '@/pages/StaffAdmin/GroupChat/data';

// 查询客户群记录
export async function QueryCustomerGroupsList(params?: QueryGroupChatParams) {
  return request(`${StaffAdminApiPrefix}/group-chats`, {
    params,
  });
}

// 导出记录
export async function ExportCustomerGroupsList(params?: QueryGroupChatParams) {
  return request(`${StaffAdminApiPrefix}/group-chat/action/export`, {
    responseType: 'blob',
    params,
  });
}

export async function QueryCustomerGroupsOwners(params?: GroupChatItem) {
  return request(`${StaffAdminApiPrefix}/group-chat/owners`, {
    params,
  });
}

export type UpdateGroupChatTagsParams = {
  group_chat_ids: string[];
  add_tag_ids: string[];
  remove_tag_ids: string[];
};


// 批量打标签
export async function UpdateGroupChatTags(params: UpdateGroupChatTagsParams) {
  return request(`${StaffAdminApiPrefix}/group-chat/action/update-tags`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
