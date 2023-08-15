import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../../../config/constant';
import type { QueryCustomerLossParams } from '@/pages/StaffAdmin/CustomerLoss/data';

// 查询流失提醒记录
export async function QueryCustomerLoss(params?: QueryCustomerLossParams) {
  return request(`${StaffAdminApiPrefix}/customer/losses`, {
    params,
  });
}

// 导出流失提醒记录
export async function ExportCustomerLoss(params?: QueryCustomerLossParams) {
  return request(`${StaffAdminApiPrefix}/customer/action/customers-losses-data-export`, {
    responseType: 'blob',
    params,
  });
}

export interface CustomerLossNotifyRuleInterface {
  is_notify_staff: number;
}

export async function GetCustomerLossNotifyRule() {
  return request(`${StaffAdminApiPrefix}/customer/action/get-loss-notify-rule`);
}

export async function UpdateCustomerLossNotifyRule(params: CustomerLossNotifyRuleInterface) {
  return request(`${StaffAdminApiPrefix}/customer/action/update-loss-notify-rule`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
