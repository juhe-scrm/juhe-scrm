import request from '@/utils/request';
import { StaffAdminApiPrefix } from '../../../../config/constant';
import type { CreateCustomerMassMsgParam, QueryCustomerMassMsgParam } from '@/pages/StaffAdmin/CustomerMassMsg/data';
import type { RcFile } from 'rc-upload/lib/interface';

export async function Query(params?: QueryCustomerMassMsgParam) {
  return request(`${StaffAdminApiPrefix}/customer/mass-msgs`, {
    params: {
      ...params,
    },
  });
}

export async function Create(params: CreateCustomerMassMsgParam) {
  return request(`${StaffAdminApiPrefix}/customer/mass-msg`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function Update(params: CreateCustomerMassMsgParam) {
  return request(`${StaffAdminApiPrefix}/customer/mass-msg/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function Get(id: string) {
  return request(`${StaffAdminApiPrefix}/customer/mass-msg/${id}`, {
    method: 'GET',
  });
}

export async function Delete(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/customer/mass-msg/action/delete`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function Notify(params: { ids: string[] }) {
  return request(`${StaffAdminApiPrefix}/customer/mass-msg/action/notify`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function UploadImage(filename: string, file: RcFile) {
  return fetch(`${StaffAdminApiPrefix}/customer/mass-msg/action/upload-image?filename=${filename}`, {
    method: 'POST',
    // headers: {
    //   "Content-Type": "You will perhaps need to define a content-type here"
    // },
    body: file
  });
}
