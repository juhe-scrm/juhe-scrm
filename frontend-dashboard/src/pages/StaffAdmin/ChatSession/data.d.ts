
declare module Staffs {

  export interface Department {
    id: string;
    ext_corp_id: string;
    ext_id: number;
    name: string;
    ext_parent_id: number;
    order: number;
    welcome_msg_id: string;
    sub_departments?: any;
    staff_num: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
  }

  export interface Item {
    id: string;
    ext_corp_id: string;
    ext_staff_id: string;
    role_id: string;
    role_type: string;
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
    departments: Department[];
    welcome_msg_id: string;
    is_authorized: number;
    enable_msg_arch: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
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

declare module ChatSessions {

  export interface Item {
    action: string;
    content_text: string;
    ext_corp_id: string;
    ext_creator_id: string;
    from: string;
    group_chat_name: string;
    id: string;
    msgid: string;
    msgtime: any;
    msgtype: string;
    peer_avatar: string;
    peer_name: string;
    roomid: string;
    seq: number;
    session_id: string;
    session_type: string;
    tolist: string[];
    peer_ext_id: string;
    peer_type: string;
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


declare module ChatMessage{

  export interface Attachments {
    filesize: number;
    md5sum: string;
    sdkfileid: string;
  }

  export interface ChatMsgContent {
    chat_msg_id: string;
    content: string;
    content_type: string;
    created_at: Date;
    deleted_at?: any;
    ext_corp_id: string;
    ext_creator_id: string;
    file_name: string;
    file_url: string;
    id: string;
    updated_at: Date;
  }

  export interface Item {
    action: string;
    attachments: Attachments;
    chat_msg_content: ChatMsgContent;
    content_text: string;
    ext_corp_id: string;
    ext_creator_id: string;
    from: string;
    id: string;
    msgid: string;
    msgtime: any;
    msgtype: string;
    roomid: string;
    sender_avatar: string;
    sender_name: string;
    seq: number;
    session_id: string;
    session_type: string;
    tolist: string[];
    customer_type: string;
  }

  export interface Data {
    items: Item[];
    total: number;
  }

  export interface RootObject {
    code: number;
    message: string;
    data: Data;
  }

}


declare module SearchMessage {

  export interface ChatMsgContent {
    chat_msg_id: string;
    content: string;
    content_type: string;
    created_at: Date;
    deleted_at?: any;
    ext_corp_id: string;
    ext_creator_id: string;
    file_name: string;
    file_url: string;
    id: string;
    updated_at: Date;
  }

  export interface Item {
    action: string;
    attachments?: any;
    chat_msg_content: ChatMsgContent;
    content_text: string;
    ext_corp_id: string;
    ext_creator_id: string;
    from: string;
    id: string;
    msgid: string;
    msgtime: number;
    msgtype: string;
    roomid: string;
    sender_avatar: string;
    sender_name: string;
    seq: number;
    session_id: string;
    session_type: string;
    tolist: string[];
  }

  export interface Data {
    items: Item[];
    total: number;
  }

  export interface RootObject {
    code: number;
    message: string;
    data: Data;
  }

}

