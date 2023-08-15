import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
import styles from './index.less';
import { CloseOutlined } from '@ant-design/icons';
import type { WelcomeMsg } from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import AutoReplyPreview from '@/pages/StaffAdmin/Components/Sections/AutoReplyPreview';

export type AutoReplyPreviewModalProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  autoReply?: WelcomeMsg;
};

const AutoReplyPreviewModal: React.FC<AutoReplyPreviewModalProps> = (props) => {
  const { visible, setVisible, autoReply } = props;
  return (
    <div className={styles.maskContainer} style={{ display: visible ? 'block' : 'none' }}
         onClick={() => setVisible(false)}>
      <div className={styles.previewContainer}
           onClick={(e) => {
             e.stopPropagation();
           }}>
        <AutoReplyPreview autoReply={autoReply} />
        <div className={styles.closeContainer} onClick={() => setVisible(false)}>
          <CloseOutlined />
        </div>
      </div>
    </div>
  );
};

export default AutoReplyPreviewModal;
