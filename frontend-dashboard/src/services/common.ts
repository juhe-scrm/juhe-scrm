import request from "@/utils/request";
import {StaffAdminApiPrefix} from "../../config/constant";

export interface CommonResp {
  code: number;
  message: string;
  data?: any;
}

export type Pager = {
  total_rows?: number;
  page_size?: number;
  page?: number;
};

export type Sorter = {
  sort_field?: string;
  sort_type?: string;
};

export type CommonQueryParams = {
  sort_field?: 'id' | 'created_at' | 'updated_at' | 'sort_weight'|'order';
  sort_type?: 'asc' | 'desc';

  page_size?: number;
  page?: number;
};

export interface ParseURLResult {
  title: string;
  desc: string;
  img_url: string;
  link_url: string;
}

// ParseURL 解析URL
export async function ParseURL(url: string) {
  return request(`${StaffAdminApiPrefix}/common/action/parse-link`, {
    method: 'POST',
    data: {url}
  });
}

export interface GetSignedURLResult {
  upload_url: string;
  download_url: string;
}

// GetSignedURL 获取云存储上传地址
export async function GetSignedURL(filename: string) {
  return request(`${StaffAdminApiPrefix}/common/action/get-signed-url`, {
    method: 'POST',
    data: {file_name: filename},
  });
}
