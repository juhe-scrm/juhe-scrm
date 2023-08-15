import request from '@/utils/request';
import {StaffAdminApiPrefix} from '../../../../config/constant';

type QueryStaffsParams = Partial<{
  name: string;
  page: number;
  page_size: number;
  role_id: number | string;
  sort_field: string;
  sort_type: string;
  total_rows: number;
  type: string;
}> & {
  enable_msg_arch: number;
  ext_department_ids: number | number[];
}

type QueryDepartmentParams = Partial<{
  ext_dept_ids: number[]
  ext_parent_id: string;
  page: number;
  page_size: number;
  sort_field: string;
  sort_type: string;
  total_rows: number;
}>
type QueryChatSessionsParams = Partial<{
  page: number;
  page_size: number;
  sort_field: string;
  sort_type: string;
  total_rows: number;
  name: string;
}> & {
  session_type: string;
  ext_staff_id: string;
}

type QueryChatMessagesParams = Partial<{
  page: number;
  page_size: number;
  sort_field: string;
  sort_type: string;
  total_rows: number;
  max_id: string;
  min_id: string;
  limit: number;
  send_at_start: string;
  send_at_end: string;
}> & {
  receiver_id: string;
  ext_staff_id: string;
}

type SearchMessagesParams = {
  ext_staff_id: string;
  ext_peer_id: string;
  keyword: string;
}

// 获取员工数据
export async function QueryStaffsList(params?: QueryStaffsParams) {
  return request(`${StaffAdminApiPrefix}/staffs`, {
    params,
  });
}

// 获取部门列表
export async function QueryDepartmentList(params?: QueryDepartmentParams) {
  return request(`${StaffAdminApiPrefix}/departments`, {
    params,
  });
}

// 获取会话列表
export async function QueryChatSessions(params?: QueryChatSessionsParams) {
  return request(`${StaffAdminApiPrefix}/customer/chat-sessions`, {
    params,
  });
}

// 获取消息详情
export async function QueryChatMessages(params?: QueryChatMessagesParams) {
  return request(`${StaffAdminApiPrefix}/customer/session-msgs`, {
    params,
  });
}

// 搜索消息
export async function SearchMessages(params: SearchMessagesParams) {
  return request(`${StaffAdminApiPrefix}/customer/session-msg/action/search`, {
    method: 'POST', data: {
      ...params,
    },
  });
}
