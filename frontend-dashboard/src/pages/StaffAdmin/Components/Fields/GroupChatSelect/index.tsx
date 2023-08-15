import React, { useState } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { CloseOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import styles from './index.less';
import type { SelectProps } from 'antd/lib/select';
import type { GroupChatOption } from '@/pages/StaffAdmin/Components/Modals/GroupChatSelectionModal';
import GroupChatSelectionModal from '@/pages/StaffAdmin/Components/Modals/GroupChatSelectionModal';

export type GroupChatTreeSelectProps = {
  allGroupChats: GroupChatOption[];
  onChange?: (value: any[]) => void; // 设置受控属性
  value?: any[]; // 受控属性，组件选中值
} & SelectProps<any>;

const GroupChatSelect: React.FC<GroupChatTreeSelectProps> = (props) => {
  const { value, onChange, allGroupChats, ...rest } = props;
  const [groupChatSelectionVisible, setGroupChatSelectionVisible] = useState(false);
  const allGroupChatMap = _.keyBy<GroupChatOption>(allGroupChats, 'ext_chat_id');

  return (
    <>
      <Select
        {...rest}
        mode='multiple'
        placeholder='请选择群聊'
        allowClear={true}
        value={value}
        open={false}
        maxTagCount={5}
        tagRender={(tagProps) => {
          // @ts-ignore
          const groupChat: GroupChatOption = allGroupChatMap[tagProps.value];
          return (
            <span className={'ant-select-selection-item'}>
              <span className={styles.selectedItem}>
                <div className={styles.avatar}>
                  <UsergroupAddOutlined style={{ color: 'rgba(0,0,0,0.65)' }} />
                </div>
                <div className='flex-col align-left'>
                  <span>{groupChat?.name}</span>
                </div>
              </span>
              <span
                className='ant-select-selection-item-remove'
                style={{ marginLeft: 3 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // @ts-ignore
                  onChange(value.filter((extGroupChatID: string) => extGroupChatID !== groupChat?.ext_chat_id));
                }}
              >
                <CloseOutlined />
              </span>
            </span>
          );
        }}
        onClear={() => {
          // @ts-ignore
          onChange([]);
        }}
        onClick={() => {
          setGroupChatSelectionVisible(!groupChatSelectionVisible);
        }}
      />

      <GroupChatSelectionModal
        visible={groupChatSelectionVisible}
        setVisible={setGroupChatSelectionVisible}
        defaultCheckedGroupChats={value?.map((extGroupChatID: string) => allGroupChatMap[extGroupChatID])}
        onFinish={(values) => {
          // @ts-ignore
          onChange(values.map((groupChat) => groupChat.ext_chat_id));
        }}
        allGroupChats={allGroupChats}
      />
    </>
  );
};

export default GroupChatSelect;
