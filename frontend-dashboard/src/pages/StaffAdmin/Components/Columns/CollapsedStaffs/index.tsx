import React from 'react';
import { Tag } from 'antd';
import styles from './index.less';
import { False } from '../../../../../../config/constant';

export interface StaffItem {
  online?: number;
  id: string;
  avatar_url: string;
  name: string;
}

export type CollapsedStaffsProps = {
  staffs: StaffItem[] | undefined
  limit: number
};

const CollapsedStaffs: React.FC<CollapsedStaffsProps> = (props) => {
  const { staffs, limit } = props;
  return (
    <div className={styles.collapsedStaffs}>
      {staffs?.map((staff, index) => {
        const len = staffs?.length || 0;
        if (index <= limit - 1) {
          return (
            <Tag
              key={staff.id}
              className={styles.staffTagLikeItem}
              style={{ opacity: staff?.online && staff?.online === False ? '0.5' : '1' }}
            >
              <img className={styles.icon} src={staff.avatar_url} alt={staff.name} />
              <span className={styles.text}>{staff.name}</span>
            </Tag>
          );
        }

        if (index === limit) {
          return (
            <Tag
              key={'extend'}
              className={styles.staffTagLikeItem}
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

export default CollapsedStaffs;
