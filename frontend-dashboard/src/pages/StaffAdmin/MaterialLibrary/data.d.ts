declare module MaterialTag {
    export interface Item {
        id: string;
        ext_corp_id: string;
        ext_creator_id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        deleted_at?: any;
    }
}

declare module Material {
    export interface Item {
        id: string;
        ext_corp_id: string;
        ext_creator_id: string;
        material_type: string;
        title: string;
        content: string;
        digest: string;
        file_size: string;
        media_id: string;
        publish_status: string;
        show_cover: number;
        thumb_media_id: string;
        thumb_url: string;
        url: string;
        link: string;
        material_tag_list?: any;
        created_at: Date;
        updated_at: Date;
        deleted_at?: any;
    }
}





