import request from '@/utils/request';
import {StaffAdminApiPrefix} from '../../../../config/constant';

export interface GetTrendParams {
  statistic_type: 'total' | 'increase' | 'decrease' | 'net_increase';
  start_time: string;
  end_time: string;
  ext_staff_ids: string[];
}

export interface TrendItem {
  number: number;
  date: string;
}

// 获取客户数据趋势
export async function GetTrend(params: GetTrendParams) {
  return request(`${StaffAdminApiPrefix}/action/get-trend`, {
    params,
  });
}


export interface SummaryResult {
  corp_name: string;
  total_staffs_num: number;
  total_customers_num: number;
  today_customers_increase: number;
  today_customers_decrease: number;
  total_groups_num: number;
  today_groups_increase: number;
  today_groups_decrease: number;
}

// 获取统计概况
export async function GetSummary() {
  return request(`${StaffAdminApiPrefix}/action/get-summary`);
}
