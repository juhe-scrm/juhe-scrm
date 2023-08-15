import type {Dispatch, SetStateAction} from 'react';
import React, {useEffect, useState} from 'react';
import type {ModalProps} from 'antd';
import {Alert, Button, Empty, Input, Row, Space, Tag} from 'antd';
import type {GroupChatTag, GroupChatTagGroupItem} from '@/pages/StaffAdmin/GroupChatTag/data';
import styles from './index.less';
import {PlusOutlined} from '@ant-design/icons';
import {CreateTags} from '@/pages/StaffAdmin/GroupChatTag/service';
import {message} from 'antd/es';
import {ModalForm, ProFormDependency, ProFormRadio} from '@ant-design/pro-form';

export type FormParams = {
  logical_condition: 'or' | 'and' | 'none';
  selected_ext_tag_ids: string[];
};

export type TagSelectionProps = ModalProps & {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onFinish?: (selectedStaffs: GroupChatTag[], params: FormParams) => void;
  defaultCheckedTags?: GroupChatTag[];
  allTagGroups: GroupChatTagGroupItem[];
  isEditable: boolean;
  withLogicalCondition: boolean; // 是否开启逻辑条件选择
  setLogicalCondition?: Dispatch<SetStateAction<'and' | 'or' | 'none'>>;
  logicalCondition?: 'and' | 'or' | 'none';
};

const GroupChatTagSelectionModal: React.FC<TagSelectionProps> = (props) => {
  const {
    visible,
    setVisible,
    onFinish,
    allTagGroups,
    defaultCheckedTags,
    isEditable,
    withLogicalCondition,
    logicalCondition,
    setLogicalCondition,
    ...rest
  } = props;
  const [currentInputTagGroupExtID, setCurrentInputTagGroupExtID] = useState<string>();
  const [inputLoading, setInputLoading] = useState<boolean>(false);
  const [tagGroups, setTagGroups] = useState<GroupChatTagGroupItem[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<GroupChatTag[]>(defaultCheckedTags || []);

  useEffect(() => {
    setSelectedTags(defaultCheckedTags || []);
    setKeyword('');
  }, [defaultCheckedTags, visible]);

  useEffect(() => {
    const filteredTagGroups = allTagGroups.filter((tagGroup) => {
      if (keyword.trim() === '') {
        return true;
      }

      if (tagGroup.name?.includes(keyword)) {
        return true;
      }
      const matchedTags = tagGroup.tags?.filter((tag) => {
        if (tag.name) {
          return tag.name.includes(keyword);
        }
        return false;
      });
      if (matchedTags && matchedTags.length > 0) {
        return true;
      }
      return false;
    });
    setTagGroups(filteredTagGroups);
  }, [allTagGroups, keyword]);

  return (
    <ModalForm
      {...rest}
      width={props?.width || 620}
      className={styles.dialog}
      modalProps={{zIndex: 1001}}
      visible={visible}
      layout={'horizontal'}
      onVisibleChange={setVisible}
      onFinish={async (values: FormParams) => {
        const params = {...values};
        // @ts-ignore
        params.selected_ext_tag_ids = selectedTags.map((tag) => tag.id) || [];
        if (onFinish) {
          onFinish(selectedTags, params);
          setVisible(false);
        }
      }}
    >
      <h2 className='dialog-title'> 选择标签 </h2>
      {withLogicalCondition && (
        <ProFormRadio.Group
          name='logical_condition'
          label='筛选条件'
          fieldProps={{
            value: logicalCondition || 'or',
            onChange: (e) => {
              if (setLogicalCondition) {
                setLogicalCondition(e.target.value);
              }
            },
          }}
          options={[
            {
              label: '以下标签满足其中之一',
              value: 'or',
            },
            {
              label: '以下标签同时满足',
              value: 'and',
            },
            {
              label: '无任何标签',
              value: 'none',
            },
          ]}
        />
      )}

      <ProFormDependency name={['logical_condition']}>
        {({logical_condition}) => {
          if (logical_condition === 'or' || logical_condition === 'and' || logical_condition === undefined) {
            return (
              <>
                <Row>
                  <Input
                    allowClear={true}
                    placeholder={'输入关键词搜索标签和标签组'}
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.currentTarget.value);
                    }}
                  />
                </Row>
                <div className={styles.tagGroupList}>
                  {tagGroups.length === 0 && <Empty style={{marginTop: 36, marginBottom: 36}}/>}
                  {tagGroups.map((tagGroup) => (
                    <div key={tagGroup.id}>
                      <div className={styles.tagGroupName}>
                        {tagGroup.name}
                      </div>
                      <div className={styles.tagGroupItem}>
                        <div className={styles.tagList}>
                          <Space direction={'horizontal'} wrap={true}>
                            {isEditable && (
                              <Button
                                size={'small'}
                                icon={<PlusOutlined/>}
                                onClick={() => {
                                  setCurrentInputTagGroupExtID(tagGroup.id);
                                }}
                                style={{height: 28}}
                              >
                                添加
                              </Button>
                            )}

                            {currentInputTagGroupExtID === tagGroup.id && (
                              <Input
                                autoFocus={true}
                                disabled={inputLoading}
                                placeholder='逗号分隔，回车保存'
                                onBlur={() => setCurrentInputTagGroupExtID('')}
                                onPressEnter={async (e) => {
                                  setInputLoading(true);
                                  const res = await CreateTags({
                                    names: e.currentTarget.value
                                      .replace('，', ',')
                                      .split(',')
                                      .filter((val) => val),
                                    group_id: tagGroup.id || '',
                                  });
                                  if (res.code === 0) {
                                    setCurrentInputTagGroupExtID('');
                                    tagGroup.tags?.unshift(...res.data);
                                  } else {
                                    message.error(res.message);
                                  }
                                  setInputLoading(false);
                                }}
                                style={{height: 28}}
                              />
                            )}
                            {tagGroup.tags?.map((tag) => {
                              const isSelected = selectedTags.map((selectedTag) => selectedTag.id)?.includes(tag?.id);
                              return (
                                <Tag
                                  // @ts-ignore
                                  className={`tag-item${isSelected ? ' selected-tag-item' : ''}`}
                                  key={tag.id}
                                  onClick={() => {
                                    if (!tag?.id) {
                                      return;
                                    }
                                    if (isSelected) {
                                      setSelectedTags(selectedTags.filter((selectedTag) => {
                                        return selectedTag.id !== tag?.id;
                                      }));
                                    } else {
                                      setSelectedTags([...selectedTags, tag]);
                                    }
                                  }}
                                >
                                  {tag.name}
                                </Tag>
                              );
                            })}
                          </Space>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          }

          return (
            <Alert type={'info'} style={{marginBottom: 30}} showIcon={true} message={'选择无任何标签后，将筛选出没有被打上过任何标签的客户'}/>
          );
        }}
      </ProFormDependency>


    </ModalForm>
  );
};

export default GroupChatTagSelectionModal;
