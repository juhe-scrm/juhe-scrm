import request from '@/utils/request';
import {StaffAdminApiPrefix} from '../../../../config/constant';
import type {
  GroupChatTagGroupItem,
  QueryGroupChatTagGroupParams,
} from '@/pages/StaffAdmin/GroupChatTag/data';

// 查询
export async function Query(params?: QueryGroupChatTagGroupParams) {
  return request(`${StaffAdminApiPrefix}/group-chat/tag-groups`, {
    method: 'GET',
    params,
  });
}

// 删除
export async function Delete(params: { ext_ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/group-chat/tag-group/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 新建
export async function Create(params: GroupChatTagGroupItem) {
  return request(`${StaffAdminApiPrefix}/group-chat/tag-group`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export type CreateGroupChatTagParams = {
  group_id: string;
  names: string[];
};


// 加标签
export async function CreateTags(params: CreateGroupChatTagParams) {
  return request(`${StaffAdminApiPrefix}/group-chat/tag`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 更新
export async function Update(
  params: GroupChatTagGroupItem
) {
  return request(`${StaffAdminApiPrefix}/group-chat/tag-group`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

