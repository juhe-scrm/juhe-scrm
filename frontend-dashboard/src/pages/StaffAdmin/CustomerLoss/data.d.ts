import type { CommonQueryParams, Pager } from '@/services/common';

export type CustomerLossItem = Partial<{
  id: string;
  ext_customer_id: string;
  customer_avatar: string;
  customer_corp_name: string;
  customer_type: number;
  ext_customer_name: string;
  relation_create_at: Date;
  customer_delete_staff_at: Date;
  staff_avatar: string;
  staff_name: string;
  staff_id: number;
  in_connection_time_range: number;
  tags: any[];
}>;

export type CustomerLossListData = {
  items: CustomerLossItem[];
  pager: Partial<Pager>;
};

export type QueryCustomerLossParams = {
  ext_department_id?: number;
  ext_staff_id?: string;
  loss_start?: Date;
  loss_end?: Date;
  connection_create_start?: Date;
  connection_create_end?: Date;
  time_span_lower_limit?: number;
} & CommonQueryParams;
