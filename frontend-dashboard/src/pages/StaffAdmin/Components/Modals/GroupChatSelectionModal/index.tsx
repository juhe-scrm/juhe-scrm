import type { Dispatch, SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';
import { Checkbox, Empty, Modal } from 'antd';
import styles from './index.less';
import Search from 'antd/es/input/Search';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import _ from 'lodash';
import type { GroupChatMainInfoItem } from '@/services/group_chat';
import groupChatIcon from '@/assets/group-chat.svg';

export interface GroupChatOption extends GroupChatMainInfoItem {
  label: string;
  value: string;
}

export type GroupChatSelectionProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onFinish?: (selectedGroupChats: GroupChatOption[]) => void;
  defaultCheckedGroupChats?: GroupChatOption[];
  allGroupChats: GroupChatOption[];
};

const GroupChatSelectionModal: React.FC<GroupChatSelectionProps> = (props) => {
  const { visible, setVisible, defaultCheckedGroupChats, onFinish, allGroupChats, ...rest } = props;
  const [groupChats, setGroupChats] = useState<GroupChatOption[]>([]);
  const [selectedGroupChats, setSelectedGroupChats] = useState<GroupChatOption[]>(defaultCheckedGroupChats || []);
  const [keyword, setKeyword] = useState<string>('');
  const [checkAll, setCheckAll] = useState<boolean>(false);

  const onGroupChatCheckChange = (currentGroupChat: GroupChatOption) => {
    let items = [...selectedGroupChats];
    // 群聊已被选择，则删除
    if (selectedGroupChats.find((item) => item.ext_chat_id === currentGroupChat.ext_chat_id)) {
      // 取消该群聊
      items = items.filter((item) => {
        return item.ext_chat_id !== currentGroupChat.ext_chat_id;
      });
    } else {
      // 没有被选择，则添加
      items.push(currentGroupChat);
    }
    setSelectedGroupChats(items);
  };

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    let items: GroupChatOption[];
    if (e.target.checked) {
      items = _.uniqWith<GroupChatOption>([...groupChats, ...selectedGroupChats], (a, b) => a.ext_chat_id === b.ext_chat_id);
    } else {
      // @ts-ignore
      items = _.differenceWith<GroupChatParam>(selectedGroupChats, groupChats, (a, b) => a.ext_chat_id === b.ext_chat_id);
    }
    setSelectedGroupChats(items);
    setCheckAll(e.target.checked);
  };

  useEffect(() => {
    setSelectedGroupChats(defaultCheckedGroupChats || []);
    setKeyword('');
  }, [defaultCheckedGroupChats, visible]);

  useEffect(() => {
    setGroupChats(
      allGroupChats?.filter((item) => {
        return keyword === '' || item?.label?.includes(keyword) || item?.owner_name?.includes(keyword);
      }),
    );
  }, [allGroupChats, keyword]);

  // 监听待选和选中群聊，计算全选状态
  useEffect(() => {
    let isCheckAll = true;
    const selectedGroupChatIDs = selectedGroupChats.map((selectedGroupChat) => selectedGroupChat.ext_chat_id);
    groupChats.forEach((groupChat) => {
      if (!selectedGroupChatIDs.includes(groupChat.ext_chat_id)) {
        isCheckAll = false;
      }
    });
    setCheckAll(isCheckAll);
  }, [groupChats, selectedGroupChats]);

  return (
    <Modal
      {...rest}
      width={665}
      zIndex={1001}
      className={'dialog from-item-label-100w'}
      visible={visible}
      onCancel={() => setVisible(false)}
      onOk={() => {
        if (onFinish) {
          onFinish(selectedGroupChats);
        }
        setVisible(false);
      }}
    >
      <h2 className='dialog-title'> 选择群聊 </h2>

      <div className={styles.addGroupChatDialogContent}>
        <div className={styles.container}>
          <div className={styles.left}>
            <div className={styles.toolTop}>
              <Search
                className={styles.searchInput}
                enterButton={'搜索'}
                prefix={<SearchOutlined />}
                placeholder='请输入群聊名称或群主名称'
                allowClear
                onChange={(e) => {
                  setKeyword(e.target.value);
                }}
              />
              <Checkbox checked={checkAll} onChange={onCheckAllChange}>
                全部群聊({groupChats.length})：
              </Checkbox>
            </div>
            <div className={styles.allGroupChat}>
              {groupChats.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
              <ul className={styles.allGroupChatList}>
                {groupChats.map((groupChat) => {
                  return (
                    <li key={groupChat.ext_chat_id}
                        onClick={() => {
                          onGroupChatCheckChange(groupChat);
                        }}
                    >
                      <div className={styles.avatarAndName}>
                        <img className={styles.avatar} src={groupChatIcon} />
                        <div className='flex-col align-left'>
                          <div className={styles.groupName}>{groupChat.name}</div>
                          <div className={styles.owner}>群主：{groupChat.owner_name}</div>
                        </div>
                      </div>

                      <Checkbox
                        checked={selectedGroupChats.find((item) => {
                          return item?.ext_chat_id === groupChat?.ext_chat_id;
                        }) !== undefined}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.toolBar}>
              已选群聊({selectedGroupChats.length})：
              <a
                onClick={() => {
                  setSelectedGroupChats([]);
                }}
              >
                清空
              </a>
            </div>
            <ul className={styles.allGroupChatList}>
              {selectedGroupChats.map((groupChat) => {
                return (
                  <li key={groupChat.ext_chat_id}
                      onClick={() => {
                        setSelectedGroupChats(selectedGroupChats.filter((item) => item.ext_chat_id !== groupChat.ext_chat_id));
                      }}
                  >
                    <div className={styles.avatarAndName}>
                      <img className={styles.avatar} src={groupChatIcon} />
                      <div className='flex-col align-left'>
                        <div className={styles.groupName}>{groupChat.name}</div>
                        <div className={styles.owner}>群主：{groupChat.owner_name}</div>
                      </div>
                    </div>
                    <div>
                      <CloseOutlined />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GroupChatSelectionModal;
