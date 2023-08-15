import type { CommonQueryParams, Pager } from '@/services/common';

export type DeleteCustomerRecordItem = Partial<{
  id: string;
  ext_customer_id: string;
  ext_customer_avatar: string;
  ext_customer_name: string;
  customer_corp_name: string;
  customer_type: number;
  relation_create_at: Date;
  relation_delete_at: Date;
  ext_staff_avatar: string;
  ext_staff_id: string;
  staff_id: number;
  staff_name: string;
}>;

export type DeleteCustomerRecordListData = {
  items: DeleteCustomerRecordItem[];
  pager: Partial<Pager>;
};

export type QueryDeleteCustomerRecordParams = {
  ext_department_id?: number;
  ext_staff_id?: string;
  connection_create_start?: Date;
  connection_create_end?: Date;
  delete_customer_start?: Date;
  delete_customer_end?: Date;
} & CommonQueryParams;
