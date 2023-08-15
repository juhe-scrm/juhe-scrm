import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../../../config/constant';
import type { QueryDeleteCustomerRecordParams } from '@/pages/StaffAdmin/DeleteCustomerRecord/data';

// 删人提醒
export async function QueryDeleteCustomerRecord(params?: QueryDeleteCustomerRecordParams) {
  return request(`${StaffAdminApiPrefix}/notify/delete-customers`, {
    params,
  });
}

// 导出删人提醒
export async function ExportDeleteCustomerRecord(params?: QueryDeleteCustomerRecordParams) {
  return request(`${StaffAdminApiPrefix}/staff/action/delete-customers-data-export`, {
    responseType: 'blob',
    params,
  });
}

export interface DeleteCustomerRecordNotifyRuleInterface {
  is_notify_staff: number;
  notify_type: number;
  ext_staff_ids: string[];
}

export async function UpdateDeleteCustomerRecordRule(
  params: DeleteCustomerRecordNotifyRuleInterface,
) {
  return request(`${StaffAdminApiPrefix}/notify/delete-customer/status`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function GetDeleteCustomerRecordNotifyRule() {
  return request(`${StaffAdminApiPrefix}/notify/delete-customer/status`, {
    method: 'GET',
  });
}
