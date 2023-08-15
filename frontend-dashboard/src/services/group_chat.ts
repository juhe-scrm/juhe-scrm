import request from '@/utils/request';
import type { CommonQueryParams } from '@/services/common';
import { StaffAdminApiPrefix } from '../../config/constant';

export interface GroupChatMainInfoItem {
  ext_chat_id: string;
  name: string;
  owner_name: string;
}

export type QueryGroupChatParams = CommonQueryParams;

// QueryGroupChat 查询员工列表
export async function QueryGroupChatMainInfo(params: QueryGroupChatParams) {
  return request(`${StaffAdminApiPrefix}/group-chat/action/get-all`, {
    method: 'POST',
    params,
  });
}
