import React from 'react';
import { Tag } from 'antd';
import styles from './index.less';

export interface TagItem {
  id: string;
  name: string;
  tag_name?: string;
}

export type CollapsedTagsProps = {
  tags: TagItem[] | undefined
  limit: number
};

const CollapsedTags: React.FC<CollapsedTagsProps> = (props) => {
  const { tags, limit } = props;
  return (
    <div className={styles.collapsedTags}>
      {tags?.map((tag, index) => {
        const len = tags?.length || 0;
        if (index <= limit - 1) {
          return (
            <Tag
              key={tag.id || tag.name || tag.tag_name}
              className={styles.tagItem}
            >
              <span className={styles.text}>{tag.name || tag.tag_name}</span>
            </Tag>
          );
        }

        if (index === limit) {
          return (
            <Tag
              key={'extend'}
              className={styles.tagItem}
            >
              <span className={styles.text}>+{(len - index)} ...</span>
            </Tag>
          );
        }

        return '';

      })}
    </div>
  );
};

export default CollapsedTags;
