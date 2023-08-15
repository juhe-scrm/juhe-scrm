import request from '@/utils/request';
import {StaffAdminApiPrefix} from '../../../../config/constant';
import type {
  CreateCustomerWelcomeMsgParam,
  QueryCustomerWelcomeMsgParam,
  UpdateCustomerWelcomeMsgParam,
} from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';

export async function Query(params?: QueryCustomerWelcomeMsgParam) {
  return request(`${StaffAdminApiPrefix}/customer/welcome-msgs`, {
    params: {
      ...params,
    },
  });
}

export async function Create(params: CreateCustomerWelcomeMsgParam) {
  return request(`${StaffAdminApiPrefix}/customer/welcome-msg`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function Update(params: UpdateCustomerWelcomeMsgParam) {
  return request(`${StaffAdminApiPrefix}/customer/welcome-msg/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function Delete(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/customer/welcome-msg/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}


export async function Get(id: string) {
  return request(`${StaffAdminApiPrefix}/customer/welcome-msg/${id}`, {
    method: 'GET',
  });
}
