declare module ScriptGroup {
  // 话术库组
  export interface Item {
    id: string;
    ext_corp_id: string;
    ext_creator_id: string;
    name: string;
    parent_id: string;
    departments: number[];
    is_top_group: number;
    sub_group?: any;
    quick_reply?: any;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
  }

  export interface RootObject {
    code: number;
    message: string;
    data: Datum[];
  }

}
declare module Script {
  // 话术
  export interface Item {
    id: string;
    ext_creator_id: string;
    ext_corp_id: string;
    department_list?: any;
    name: string;
    quick_reply_type: number;
    searchable_text?: any;
    send_count: number;
    staff_ext_id: string;
    staff_name: string;
    scope: string;
    reply_details: ReplyDetail[];
    group_id: string;
    quick_reply_group: QuickReplyGroup;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
    avatar?: strring;
  }

  export interface ReplyDetail {
    id: string;
    ext_corp_id: string;
    ext_creator_id: string;
    quick_reply_id: string;
    quick_reply_content: QuickReplyContent;
    scope: string;
    content_type: number;
    send_count: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: any;
  }

  export interface QuickReplyContent {
    image: Image;
    link: Link;
    video: Video;
    pdf: Pdf;
    text: Text;
  }

  export interface Image {
    title: string;
    size: string;
    picurl: string;
  }

  export interface Link {
    title: string;
    url: string;
    picurl: string;
    desc: string;
  }

  export interface Video {
    title: string;
    size: string;
    picurl: string;
  }

  export interface Pdf {
    title: string;
    size: string;
    fileurl: string;
  }

  export interface Text {
    content: string;
  }


  export interface QuickReplyGroup {
    id: string;
    ext_corp_id: string;
    ext_creator_id: string;
    group_name: string;
    parent_id: string;
    departments: number[];
    is_top_group: number;
    sub_group?: any;
    quick_reply?: any;
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



