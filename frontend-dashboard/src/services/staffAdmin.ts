import request from '@/utils/request';
import {StaffAdminApiPrefix} from '../../config/constant';

export interface StaffAdminRoleInterface {
  id: string;
  ext_corp_id: string;
  tenant_id: string;
  name: string;
  description: string;
  type: string;
  count: number;
  sort_weight: number;
  is_default: number;
  permission_ids: string[];
}

export interface StaffAdminInterface {
  id: string;
  ext_corp_id: string;
  ext_staff_id: string;
  role_id: string;
  type: string;
  name: string;
  address: string;
  alias: string;
  avatar_url: string;
  email: string;
  gender: number;
  status: number;
  mobile: string;
  qr_code_url: string;
  telephone: string;
  is_enabled: boolean;
  signature: string;
  external_position: string;
  external_profile: string;
  extattr: string;
  external_user_count: number;
  corp_id: string;
  dept_ids: number[];
  order?: any;
  is_leader_in_dept?: any;
  welcome_msg_id: string;
  role?: StaffAdminRoleInterface;
}

// GetCurrentStaffAdmin 获取当前登录员工
export async function GetCurrentStaffAdmin() {
  return request(`${StaffAdminApiPrefix}/action/get-current-staff`, {
    method: 'GET',
  });
}

export interface GetStaffAdminLoginQrcodeResp {
  app_id: string;
  agent_id: number;
  redirect_uri: string;
  state: string;
  location_url: string;
}

export async function GetStaffAdminLoginQrcode(extCorpID: string, sourceURL: string) {
  return request(`${StaffAdminApiPrefix}/action/login`, {
    method: 'POST',
    data: {ext_corp_id: extCorpID, source_url: sourceURL},
  });
}

export async function StaffAdminForceLogin(extCorpID: string = "ww2d3e2957190c6e4c", extStaffID: string = "WangQiang") {
  return request(`${StaffAdminApiPrefix}/action/force-login`, {
    method: 'POST',
    data: {ext_corp_id: extCorpID, ext_staff_id: extStaffID},
  });
}
