declare module StaffList {
  export interface Item {
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
    enable: number;
    signature: string;
    external_position: string;
    external_profile: string;
    extattr: string;
    external_user_count: number;
    dept_ids: number[];
    departments: any[];
    welcome_msg_id?: any;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
    enable_msg_arch: number;
  }

  export interface Pager {
    page: number;
    page_size: number;
    total_rows: number;
  }

  export interface Data {
    items: Item[];
    pager: Pager;
  }

  export interface RootObject {
    code: number;
    message: string;
    data: Data;
  }
}

declare module DepartmentList {
  export interface Item {
    label: any;
    label: any;
    id: string;
    ext_corp_id: string;
    ext_id: number;
    name: string;
    ext_parent_id: number;
    order: number;
    welcome_msg_id: string;
    sub_departments?: any;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
    staff_num: any;
  }

  export interface Pager {
    page: number;
    page_size: number;
    total_rows: number;
  }

  export interface Data {
    items: Item[];
    pager: Pager;
  }

  export interface RootObject {
    code: number;
    message: string;
    data: Data;
  }
}
