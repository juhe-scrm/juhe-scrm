import type {Dispatch, SetStateAction} from 'react';
import React, {useEffect, useState} from 'react';
import type {ModalProps} from 'antd';
import {message} from 'antd';
import {Button, Empty, Input, Row, Space, Tag, Modal} from 'antd';
import styles from "./index.less";
import {PlusOutlined, CloseOutlined} from "@ant-design/icons";
import {CreateMaterialLibraryTag, DeleteMaterialLibraryTag} from "../../service";
import {ModalForm} from "@ant-design/pro-form";

export type FormParams = {
  selected_tag_ids: string[];
};

export type TagModalProps = ModalProps & {
  isFilterComp?: boolean;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onFinish?: (selectedTags: MaterialTag.Item[]) => void;
  defaultCheckedTags?: () => MaterialTag.Item[];
  allTags: MaterialTag.Item[];
  setAllTags: Dispatch<SetStateAction<MaterialTag.Item[]>>
  isEditable?: boolean;
  reloadTags?: Dispatch<SetStateAction<number>>;
};

const TagModal: React.FC<TagModalProps> = (props) => {
  const {
    visible,
    setVisible,
    onFinish,
    allTags,
    setAllTags,
    defaultCheckedTags,
    isEditable,
    reloadTags,
    isFilterComp,
    ...rest
  } = props;
  const [creatButtonClick, setCreateButtonClick] = useState(false)
  const [inputLoading, setInputLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<MaterialTag.Item[]>(defaultCheckedTags || []);
  const [deleteTag, setDeleteTag] = useState<MaterialTag.Item>({} as MaterialTag.Item)
  const [tags, setTags] = useState<MaterialTag.Item[]>([])

  useEffect(() => {
    setSelectedTags(defaultCheckedTags || []);
    setKeyword('');
  }, [defaultCheckedTags, visible]);

  useEffect(() => {
    const filteredTags = allTags.filter((tag) => {
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
          style: {display: isEditable ? 'none' : 'block'}
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
      <h2 className="dialog-title"> {isEditable ? '素材标签管理' : '选择素材标签'} </h2>
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
                    const res = await CreateMaterialLibraryTag({
                      names: e.currentTarget.value
                        .replace('，', ',')
                        .split(',')
                        .filter((val) => val),
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
                    style={{
                      cursor: isEditable ? 'default' : 'pointer'
                    }}
                    key={tag.id}
                    onClick={() => {
                      if (!isEditable) {
                        if (isSelected) {
                          // 取消选中
                          setSelectedTags(selectedTags.filter((selectedTag) => {
                            return selectedTag.id !== tag?.id
                          }))
                        } else {
                          // 选中
                          setSelectedTags([...selectedTags, tag])
                        }
                      }
                    }}
                  >
                    {tag.name}
                    {isEditable ? <span>
                      &nbsp;&nbsp;
                      <CloseOutlined
                        style={{fontSize: '12px', cursor: 'pointer'}}
                        onClick={() => {
                          if (!tag?.id) {
                            return;
                          }
                          if (isEditable) {
                            // 删除标签
                            setDeleteTag(tag)
                          }
                        }}
                      />

                    </span> : null}
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
        visible={!!(deleteTag as MaterialTag.Item).id}
        onOk={() => {
          DeleteMaterialLibraryTag({ids: [deleteTag.id]}).then(res => {
            if (res?.code === 0) {
              message.success('删除素材标签成功')
              reloadTags?.(Date.now)
            } else {
              message.error('删除失败')
            }
            setDeleteTag({} as MaterialTag.Item)
          })
        }}
        onCancel={() => {
          setDeleteTag({} as MaterialTag.Item)
        }}
      >
        <h3>提示</h3>
        <h4>确定删除「{(deleteTag as MaterialTag.Item).name}」这个素材标签吗？删除后不可恢复</h4>
      </Modal>
    </ModalForm>

  );
};

export default TagModal;
