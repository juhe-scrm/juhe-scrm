import type {Dispatch, SetStateAction} from 'react';
import React, {useEffect, useState} from 'react';
import type {ModalProps} from 'antd';
import {message} from 'antd';
import {Button, Empty, Input, Row, Space, Tag, Modal} from 'antd';
import styles from "./index.less";
import {PlusOutlined, CloseOutlined} from "@ant-design/icons";
import {ModalForm} from "@ant-design/pro-form";
import {InternalTags} from "@/pages/StaffAdmin/Customer/data";
import {Dictionary} from "lodash";
import {DeleteInternalTags, CreateInternalTag} from "@/pages/StaffAdmin/Customer/service";

export type FormParams = {
  selected_tag_ids: string[];
};

export type PersonalTagModalProps = ModalProps & {
  isFilterComp?: boolean;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onFinish?: (selectedTags: InternalTags.Item[]) => void;
  defaultCheckedTagsIds: string [];
  allTags: InternalTags.Item[];
  setAllTags: Dispatch<SetStateAction<InternalTags.Item[]>>
  reloadTags?: Dispatch<SetStateAction<number>>;
  allTagsMap: Dictionary<InternalTags.Item>;
};

const InternalTagModal: React.FC<PersonalTagModalProps> = (props) => {
  const {
    visible,
    setVisible,
    onFinish,
    allTags,
    setAllTags,
    defaultCheckedTagsIds,
    reloadTags,
    isFilterComp,
    allTagsMap,
    ...rest
  } = props;
  const [creatButtonClick, setCreateButtonClick] = useState(false)
  const [inputLoading, setInputLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<InternalTags.Item[]>([]);
  const [deleteTag, setDeleteTag] = useState<InternalTags.Item>({} as InternalTags.Item)
  const [tags, setTags] = useState<InternalTags.Item[]>([])

  useEffect(() => {
    setSelectedTags(defaultCheckedTagsIds.map(id => allTagsMap[id]) || []);
    setKeyword('');
  }, [defaultCheckedTagsIds, visible,allTagsMap]);

  useEffect(()=> {
    console.log('    selectedTags\n    selectedTags\n',    selectedTags
    )
  },[selectedTags])

  useEffect(() => {
    const filteredTags = allTags?.filter((tag) => {
      if (keyword.trim() === '') {
        return true;
      }

      if (tag.name?.includes(keyword)) {
        return true;
      }
      return false;

    });
    setTags(filteredTags || []);
  }, [allTags, keyword])

  return (
    <ModalForm
      {...rest}
      key={'manageModal'}
      width={props?.width || 500}
      className={'dialog from-item-label-100w'}
      visible={visible}
      layout={'horizontal'}
      onVisibleChange={setVisible}
      submitter={{
        submitButtonProps: {
          disabled: selectedTags.length === 0,
        }
      }}
      onFinish={async (values: FormParams) => {
        const params = {...values};
        // @ts-ignore
        params.selected_tag_ids = selectedTags.map((tag) => tag.id) || [];
        if (onFinish) {
          onFinish(selectedTags);
          setVisible(false);
        }
      }}
    >
      <h2 className="dialog-title"> 个人标签 </h2>
      <Row>
        <Input
          allowClear={true}
          placeholder={'输入关键词搜索标签和标签组'}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.currentTarget.value)
          }}
        />
      </Row>
      <div className={styles.tagList}>
        <Row>
          <Space direction={'horizontal'} wrap={true}>
            <Button
              size="middle"
              icon={<PlusOutlined/>}
              onClick={() => {
                setCreateButtonClick(true)
              }}
            >
              添加
            </Button>
            {
              creatButtonClick && (
                <Input
                  size="middle"
                  width={'100px'}
                  autoFocus={true}
                  disabled={inputLoading}
                  placeholder='逗号分隔，回车保存'
                  onBlur={() => setCreateButtonClick(false)}
                  onPressEnter={async (e) => {
                    setCreateButtonClick(false)
                    setInputLoading(true);
                    const res = await CreateInternalTag({
                      names: e.currentTarget.value
                        .replace('，', ',')
                        .split(',')
                        .filter((val) => val),
                      // name:e.currentTarget.value
                    });
                    if (res.code === 0) {
                      reloadTags?.(Date.now)
                    } else {
                      message.error(res.message);
                    }
                    setInputLoading(false);
                  }}
                />
              )
            }
            {tags?.map((tag) => {
              const isSelected = selectedTags?.map((selectedTag) => selectedTag?.id)?.includes(tag?.id);
              return (
                <Space direction={'horizontal'} wrap={true}>
                  <Tag
                    className={`tag-item ${isSelected ? ' selected-tag-item' : ''}`}
                    style={{cursor: 'pointer', margin: '6px'}}
                    key={tag.id}
                    onClick={() => {
                        if (isSelected) {
                          // 取消选中
                          setSelectedTags(selectedTags.filter((selectedTag) => {
                            return selectedTag.id !== tag?.id
                          }))
                        } else {
                          // 选中
                          setSelectedTags([...selectedTags, tag])
                        }
                    }}
                  >
                    {tag.name}
                     <span>
                      &nbsp;&nbsp;
                      <CloseOutlined
                        style={{fontSize: '12px', cursor: 'pointer'}}
                        onClick={() => {
                          if (!tag?.id) {
                            return;
                          }
                            // 删除标签
                            setDeleteTag(tag)
                        }}
                      />

                    </span>
                  </Tag>
                </Space>
              )
            })}
          </Space>
        </Row>
        {tags?.length === 0 && <Empty style={{marginTop: 36, marginBottom: 36}} image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
      </div>
      <Modal
        key={'confirmModal'}
        visible={!!(deleteTag as any).id}
        onOk={() => {
          DeleteInternalTags({ids: [deleteTag.id]}).then((res: any) => {
            if (res?.code === 0) {
              message.success('删除标签成功')
              setSelectedTags(selectedTags.filter((selectedTag) => {
                return selectedTag.id !== deleteTag.id
              }))
              reloadTags?.(Date.now)
            } else {
              message.error('删除失败')
            }
            setDeleteTag({} as InternalTags.Item)
          })
        }}
        onCancel={() => {
          setDeleteTag({} as InternalTags.Item)
        }}
      >
        <h3>提示</h3>
        <h4>确定删除「{(deleteTag as any).name}」这个个人标签吗？删除后不可恢复</h4>
      </Modal>
    </ModalForm>

  );
};

export default InternalTagModal;
