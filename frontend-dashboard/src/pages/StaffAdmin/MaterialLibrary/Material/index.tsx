import React, {useEffect, useRef, useState} from 'react';
import {Button, Modal, Input, Dropdown, message, Empty, Tag, Space, Form, Spin, Tooltip} from 'antd'
import type {FormInstance} from 'antd';
import styles from './index.less'
import Uploader from '../components/Uploader';
import {GetSignedUrl} from '../service';
import type {RcFile} from 'antd/es/upload';
import MaterialCard from '../components/MaterialCard/index';
import {CreateMaterial, QueryMaterialList, UpdateMaterial, DeleteMaterial} from '../service';
import {
  SyncOutlined,
  PlusOutlined, CloseOutlined, ClearOutlined,
} from '@ant-design/icons';
import TagModal from '../components/TagModal/index'
import {TagContext} from '../TagProvider';
import {unstable_batchedUpdates} from "react-dom";
import {useContext} from 'react';
import {ParseURL} from "@/services/common";
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';

interface MaterialProps {
  fileType: string;
}

const fileTypeMap = {
  '链接': {
    material_type: 'link',
  },
  '海报': {
    material_type: 'poster'
  },
  '视频': {
    material_type: 'video'
  },
  'PDF': {
    material_type: 'pdf'
  },
  'PPT': {
    material_type: 'ppt'
  },
  '文档': {
    material_type: 'word'
  },
  '表格': {
    material_type: 'excel'
  }
}
const Material: React.FC<MaterialProps> = (props) => {
  const [materalList, setMateralList] = useState<Material.Item[]>([])
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [modalFormVisible, setModalFormVisible] = useState<boolean>(false)
  const [targetUpdateMaterial, setTargetUpdateMaterial] = useState<Material.Item>({} as Material.Item)
  const [targetDeleteMaterial, setTargetDeleteMaterial] = useState<Material.Item>({} as Material.Item)
  const [tagModalVisible, setTagModalVisible] = useState(false)
  const [choosedTags, setChoosedTags] = useState<MaterialTag.Item[]>([])// 新增&修改素材时选择的标签
  const [searchTags, setSearchTags] = useState<MaterialTag.Item[]>([])
  const realSearchTags = useRef<MaterialTag.Item[]>([])
  const [tagsForFilter, setTagsForFilter] = useState<MaterialTag.Item[]>([]) // 筛选标签的dropdown里的所有标签
  const [keyword, setKeyword] = useState<string>('');
  const [showSearchTags, setShowSearchTags] = useState(false)
  const [linkFetching, setLinkFetching] = useState(false);
  const [fileInfo, setFileInfo] = useState({fileName: '', fileSize: ''})
  const [materialLoading, setMaterialLoading] = useState(true)
  const modalFormRef = useRef<FormInstance>()

  const {allTags, allTagsMap} = useContext(TagContext)

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
    setTagsForFilter(filteredTags);
  }, [allTags, keyword])

  // 查询素材列表
  const queryMaterialList = (material_tag_list?: string[], title?: string) => {
    QueryMaterialList({
      page_size: 5000,
      material_type: fileTypeMap[props.fileType].material_type,
      material_tag_list,
      title
    }).then(res => {
      setMaterialLoading(false)
      if (res?.code === 0 && res?.data) {
        setMateralList(res?.data?.items || [])
      } else {
        message.error(res?.message)
      }
    })
  }
  useEffect(() => {
    setMaterialLoading(true)
    queryMaterialList()
    realSearchTags.current = []
    setSearchTags([])
  }, [props.fileType, allTags])

  // 处理修改 删除的目标素材
  const operateMaterial = (targetMaterial: Material.Item, operation: string) => {
    setFileInfo({fileName: targetMaterial.title, fileSize: targetMaterial.file_size})
    if (operation === 'update') {
      setModalFormVisible(true)
      setTargetUpdateMaterial(targetMaterial)
      setChoosedTags(targetMaterial?.material_tag_list?.map((tagId: string) =>
        allTagsMap[tagId]
      ))
      setTimeout(() => {
        modalFormRef.current?.setFieldsValue({
          ...targetMaterial,
          file_url: targetMaterial.url,
          file_size: targetMaterial.file_size
        })
      }, 100)
    }
    if (operation === 'delete') {
      setTargetDeleteMaterial(targetMaterial)
    }
  }

  return (
    <TagContext.Consumer>
      {
        (contextValue) => (
          <div>
            <div>
              <div className={styles.topNav}>
                <div className={styles.topNavTitle}>
                  {props.fileType}素材(共{materalList?.length}篇)
                </div>
                <div className={styles.topNavOperator}>
                  <Input.Search placeholder={`搜索${props.fileType}标题`} style={{width: 300}} onSearch={(value) => {
                    queryMaterialList(realSearchTags.current.map(tag => tag?.id), value)
                  }}/>
                  <Dropdown
                    visible={filterVisible}
                    overlay={
                      <div className={styles.overlay}>
                        <div className={styles.overlayTitle}>素材标签 ( {contextValue.allTags.length} )</div>
                        {/* 筛选标签 */}
                        <Form
                          layout={'horizontal'}
                        >
                          <Input
                            allowClear={true}
                            placeholder={'输入关键词搜索标签'}
                            value={keyword}
                            onChange={(e) => {
                              setKeyword(e.currentTarget.value)
                            }}
                            style={{width: 320, marginLeft: 10}}
                          />
                          <div style={{padding: "14px 4px"}}>
                            {tagsForFilter?.map((tag) => {
                              const isSelected = searchTags.map((searchTag) => searchTag.id)?.includes(tag?.id);
                              return (
                                <Space direction={'horizontal'} wrap={true}>
                                  <Tag
                                    className={`tag-item ${isSelected ? ' selected-tag-item' : ''}`}
                                    style={{cursor: 'pointer', margin: '6px'}}
                                    key={tag.id}
                                    onClick={() => {
                                      if (tag?.id && isSelected) {
                                        setSearchTags(searchTags.filter((searchTag) => {
                                          return searchTag.id !== tag?.id
                                        }))
                                      } else {
                                        setSearchTags([...searchTags, tag])
                                      }
                                    }}
                                  >
                                    {tag.name}
                                  </Tag>
                                </Space>
                              )
                            })}
                          </div>
                          {contextValue.allTags?.length === 0 &&
                          <Empty style={{marginTop: 36, marginBottom: 36}} image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
                          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button onClick={() => setFilterVisible(false)}>取消</Button>
                            <Button
                              style={{marginLeft: 6}}
                              type='primary'
                              htmlType="submit"
                              onClick={() => {
                                setFilterVisible(false)
                                setShowSearchTags(true)
                                realSearchTags.current = searchTags
                                queryMaterialList(realSearchTags.current.map(tag => tag?.id) || [])
                              }}>完成</Button>
                          </div>
                        </Form>
                      </div>
                    } trigger={['click']}>
                    <div>
                      <Button
                        style={{margin: '0px 6px'}}
                        onClick={() => {
                          setFilterVisible(!filterVisible)
                        }}>筛选</Button>
                    </div>
                  </Dropdown>
                  <Button type={'primary'} onClick={() => {
                    setModalFormVisible(true)
                  }}>添加{props.fileType}</Button>
                </div>
              </div>
            </div>
            <div>
              {
                realSearchTags.current.length > 0 && showSearchTags ? <div className={styles.filterTagBox}>
                    {
                      realSearchTags.current.map(tag =>
                          <Tag
                            key={tag.id}
                            className={'tag-item selected-tag-item'}
                          >
                            {tag.name}
                            <span>
                        &nbsp;&nbsp;
                              <CloseOutlined
                                style={{fontSize: '12px', cursor: 'pointer'}}
                                onClick={() => {
                                  realSearchTags.current = realSearchTags.current.filter((t) => {
                                    return t.id !== tag?.id
                                  })
                                  setSearchTags(realSearchTags.current)
                                  queryMaterialList(realSearchTags.current.map(t => t?.id) || [])
                                }}
                              />
                      </span>
                          </Tag>
                      )
                    }
                    <Button
                      type={'link'}
                      icon={<ClearOutlined/>}
                      style={{display: (showSearchTags && realSearchTags.current.length > 0) ? 'inline-block' : 'none'}}
                      onClick={() => {
                        setShowSearchTags(false)
                        setSearchTags([])
                        queryMaterialList()
                      }}>清空筛选</Button>
                  </div>
                  :
                  <div style={{margin: 0}}/>
              }
              {/* 素材列表 */}
              <Spin spinning={materialLoading} style={{marginTop:50}}>
                <div className={styles.articles}>
                  {
                    materalList?.map((item) => <MaterialCard {...item} callback={operateMaterial}/>)
                  }
                </div>
              </Spin>
              {
                materalList?.length === 0 && !materialLoading && <Empty style={{marginTop: 100}} image={Empty.PRESENTED_IMAGE_SIMPLE}/>
              }
            </div>
            {/* 修改素材弹窗 */}
            <ModalForm
              formRef={modalFormRef}
              className={'dialog from-item-label-100w'}
              layout={'horizontal'}
              width={'560px'}
              visible={modalFormVisible}
              onVisibleChange={(visible) => {
                if (!visible) {
                  setTargetUpdateMaterial({} as Material.Item)
                  setChoosedTags([])
                }
                setModalFormVisible(visible)
                modalFormRef.current?.resetFields()
              }}
              // @ts-ignore
              onFinish={(params) => {
                if (targetUpdateMaterial.id) {
                  const tagIdList = choosedTags.map(tag => {
                    return tag?.id
                  })
                  UpdateMaterial({
                    material_type: fileTypeMap[props.fileType].material_type, ...params,
                    id: targetUpdateMaterial.id,
                    material_tag_list: choosedTags.length > 0 ? tagIdList : [],
                  })
                    .then(res => {
                      if (res?.code === 0) {
                        message.success(`修改${props.fileType}成功`)
                        unstable_batchedUpdates(() => {
                          queryMaterialList(searchTags.map(tag => tag?.id) || [])
                          setModalFormVisible(false)
                          setChoosedTags([])
                          setTargetUpdateMaterial({} as Material.Item)
                        })
                      } else {
                        message.error(res.message)
                      }
                    })
                } else {
                  const tagIdList = choosedTags.map(tag => {
                    return tag?.id
                  })
                  CreateMaterial({
                    material_type: fileTypeMap[props.fileType].material_type, ...params,
                    material_tag_list: choosedTags.length > 0 ? tagIdList : [],
                  })
                    .then(res => {
                      if (res?.code === 0) {
                        message.success(`新增${props.fileType}成功`)
                        unstable_batchedUpdates(() => {
                          queryMaterialList(searchTags.map(tag => tag?.id) || [])
                          setModalFormVisible(false)
                          setChoosedTags([])
                        })
                      } else {
                        message.error(res.message)
                      }
                    })
                }
              }}
            >
              {
                // 修改链接素材 弹窗内容
                props.fileType === '链接' && <div key={props.fileType}>
                  <Spin spinning={linkFetching}>
                    <h2 className='dialog-title'> {targetUpdateMaterial.id ? '修改链接' : '添加链接'} </h2>
                    <ProForm.Item initialValue={'link'} name={'msgtype'} noStyle={true}>
                      <input type={'hidden'}/>
                    </ProForm.Item>
                    <ProFormText
                      name='link'
                      label='链接地址'
                      placeholder="链接地址以http(s)开头"
                      width='md'
                      fieldProps={{
                        disabled: linkFetching,
                        addonAfter: (
                          <Tooltip title="点击抓取远程链接，自动填充标题，描述，图片">
                            <div
                              onClick={async () => {
                                setLinkFetching(true);
                                const res = await ParseURL(modalFormRef.current?.getFieldValue('link'))
                                setLinkFetching(false);
                                if (res.code !== 0) {
                                  message.error(res.message);
                                } else {
                                  message.success('解析链接成功');
                                  modalFormRef?.current?.setFieldsValue({
                                    customer_link_enable: 1,
                                    title: res.data.title,
                                    digest: res.data.desc,
                                    file_url: res.data.img_url,
                                  })
                                }
                              }}
                              style={{
                                cursor: "pointer",
                                width: 32,
                                height: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                              <SyncOutlined/>
                            </div>
                          </Tooltip>
                        )
                      }}
                      rules={[
                        {
                          required: true,
                          message: '请输入链接地址',
                        },
                        {
                          type: 'url',
                          message: '请填写正确的的URL，必须是http或https开头',
                        },
                      ]}
                    />
                    <ProFormText
                      name='title'
                      label='链接标题'
                      width='md'
                      rules={[
                        {
                          required: true,
                          message: '请输入链接标题',
                        },
                      ]}
                    />
                    <ProFormTextArea
                      name='digest'
                      label='链接描述'
                      width='md'
                    />
                    <Form.Item
                      label='链接封面'
                      name='file_url'
                      rules={[
                        {
                          required: true,
                          message: '请上传链接图片！',
                        },
                      ]}
                    >
                      <Uploader
                        fileType='formImage'
                        fileInfo={fileInfo}
                        setFileInfo={setFileInfo}
                        customRequest={async (req) => {
                          try {
                            const file = req.file as RcFile;
                            const getUploadUrlRes = await GetSignedUrl({file_name: file.name})
                            if (getUploadUrlRes.code !== 0) {
                              message.error('获取上传地址失败');
                              return;
                            }
                            // 上传
                            const uploadRes = await fetch(getUploadUrlRes?.data?.upload_url, {
                              method: 'PUT',
                              body: file
                            });
                            if (uploadRes.clone().ok) {
                              modalFormRef?.current?.setFieldsValue({
                                file_url: getUploadUrlRes?.data?.download_url,
                                file_size: String(file.size)
                              })
                              return;
                            }
                            message.error('上传图片失败');
                            return;
                          } catch (e) {
                            message.error('上传图片失败');
                          }
                        }}
                      />
                    </Form.Item>
                    <div style={{display: 'none'}}>
                      <ProFormText name='file_size'/>
                    </div>
                  </Spin>
                </div>
              }
              {
                // 修改海报素材 弹窗内容
                props.fileType === '海报' && <div key={props.fileType}>
                  <h2 className='dialog-title'> {targetUpdateMaterial.id ? '修改海报' : '添加海报'} </h2>
                  <ProForm.Item
                    name='file_url'
                  >
                    <Uploader
                      fileType='海报'
                      fileInfo={fileInfo}
                      setFileInfo={setFileInfo}
                      customRequest={async (req) => {
                        try {
                          const file = req.file as RcFile;
                          const getUploadUrlRes = await GetSignedUrl({file_name: file.name})
                          if (getUploadUrlRes.code !== 0) {
                            message.error('获取上传地址失败');
                            return;
                          }
                          // 上传
                          const uploadRes = await fetch(getUploadUrlRes?.data?.upload_url, {
                            method: 'PUT',
                            body: file
                          });
                          if (uploadRes.clone().ok) {
                            modalFormRef?.current?.setFieldsValue({
                              file_url: getUploadUrlRes?.data?.download_url,
                              file_size: String(file.size),
                              title: file.name
                            })
                            return;
                          }
                          message.error('上传图片失败');
                          return;
                        } catch (e) {
                          message.error('上传图片失败');
                        }
                      }}
                    />
                  </ProForm.Item>
                  <div style={{display: 'none'}}>
                    <ProFormText name='file_size'/>
                  </div>
                  <div style={{display: 'none'}}>
                    {/* 文件名 */}
                    <ProFormText name='title'/>
                  </div>
                </div>
              }
              {
                // 修改视频素材 弹窗内容
                props.fileType === '视频' && <div key={props.fileType}>
                  <h2 className='dialog-title'> {targetUpdateMaterial.id ? '修改视频' : '添加视频'} </h2>
                  <ProForm.Item
                    name='file_url'
                  >
                    <Uploader
                      fileType='视频'
                      fileInfo={fileInfo}
                      setFileInfo={setFileInfo}
                      customRequest={async (req) => {
                        try {
                          const file = req.file as RcFile;
                          const getUploadUrlRes = await GetSignedUrl({file_name: file.name})
                          if (getUploadUrlRes.code !== 0) {
                            message.error('获取上传地址失败');
                            return;
                          }
                          // 上传
                          const uploadRes = await fetch(getUploadUrlRes?.data?.upload_url, {
                            method: 'PUT',
                            body: file
                          });
                          if (uploadRes.clone().ok) {
                            modalFormRef?.current?.setFieldsValue({
                              file_url: getUploadUrlRes?.data?.download_url,
                              file_size: String(file.size),
                              title: file.name
                            })
                            return;
                          }
                          message.error('上传视频失败');
                          return;
                        } catch (e) {
                          message.error('上传视频失败');
                        }
                      }}
                    />
                  </ProForm.Item>
                  <div style={{display: 'none'}}>
                    <ProFormText name='file_size'/>
                  </div>
                  <div style={{display: 'none'}}>
                    {/* 文件名 */}
                    <ProFormText name='title'/>
                  </div>
                </div>
              }
              {
                // 修改文件类素材 弹窗内容
                (props.fileType === 'PDF' || props.fileType === 'PPT' || props.fileType === '文档' || props.fileType === '表格') &&
                <div key={props.fileType}>
                  <h2
                    className='dialog-title'> {targetUpdateMaterial.id ? `修改${props.fileType}` : `添加${props.fileType}`} </h2>
                  <ProForm.Item
                    name='file_url'
                  >
                    <Uploader
                      fileType={props.fileType}
                      fileInfo={fileInfo}
                      setFileInfo={setFileInfo}
                      customRequest={async (req) => {
                        try {
                          const file = req.file as RcFile;
                          const getUploadUrlRes = await GetSignedUrl({file_name: file.name})
                          if (getUploadUrlRes.code !== 0) {
                            message.error('获取上传地址失败');
                            return;
                          }
                          // 上传
                          const uploadRes = await fetch(getUploadUrlRes?.data?.upload_url, {
                            method: 'PUT',
                            body: file
                          });
                          if (uploadRes.clone().ok) {
                            modalFormRef?.current?.setFieldsValue({
                              file_url: getUploadUrlRes?.data?.download_url,
                              file_size: String(file.size),
                              title: file.name
                            })
                            return;
                          }
                          message.error(`上传${props.fileType}失败`);
                          return;
                        } catch (e) {
                          message.error(`上传${props.fileType}失败`);
                        }
                      }}
                    />
                  </ProForm.Item>
                  <div style={{display: 'none'}}>
                    <ProFormText name='file_size'/>
                  </div>
                  <div style={{display: 'none'}}>
                    {/* 文件名 */}
                    <ProFormText name='title'/>
                  </div>
                </div>
              }

              <div className={styles.modalTagBox}>
                <Space direction={'horizontal'} wrap={true}>
                  <Button icon={<PlusOutlined/>} onClick={() => setTagModalVisible(true)}>选择标签</Button>
                  {
                    choosedTags?.length > 0 && choosedTags?.map((tag) =>
                      <Tag
                        key={tag?.id}
                        className={'tag-item selected-tag-item'}
                      >
                        {tag?.name}
                        <span>
                        &nbsp;&nbsp;
                          <CloseOutlined
                            style={{fontSize: '12px', cursor: 'pointer'}}
                            onClick={() => {
                              setChoosedTags(choosedTags?.filter((choosedTag) => {
                                return choosedTag?.id !== tag?.id
                              }))
                            }}
                          />
                     </span>
                      </Tag>
                    )}
                </Space>
              </div>
            </ModalForm>
            {/* 删除素材 */}
            <Modal
              visible={!!targetDeleteMaterial.id}
              onOk={() => {
                DeleteMaterial({ids: [targetDeleteMaterial.id]}).then(res => {
                  if (res?.code === 0) {
                    message.success('删除素材标签成功')
                    // setListTimestamp(Date.now)
                    queryMaterialList(searchTags?.map(tag => tag?.id) || [])
                  } else {
                    message.success('删除失败')
                  }
                  setTargetDeleteMaterial({} as Material.Item)
                })
              }}
              onCancel={() => {
                setTargetDeleteMaterial({} as Material.Item)
              }}
            >
              <h3>提示</h3>
              <h4>确定删除「{(targetDeleteMaterial as Material.Item).title}」这个素材吗？删除后不可恢复</h4>
            </Modal>
            {/* 选择素材标签弹窗 */}
            <TagModal
              width={560}
              isEditable={false}
              defaultCheckedTags={() => {
                if (choosedTags?.length > 0) {
                  return choosedTags
                }
                const tempArr: MaterialTag.Item[] = []
                targetUpdateMaterial?.material_tag_list?.forEach((tagId: string) => {
                  tempArr.push(contextValue.allTagsMap[tagId])
                });
                return tempArr || []
              }}
              allTags={contextValue.allTags}
              setAllTags={contextValue.setAllTags}
              visible={tagModalVisible}
              setVisible={setTagModalVisible}
              onCancel={() => {
                setChoosedTags([])
              }}
              reloadTags={contextValue.setTagsItemsTimestamp}
              onFinish={async (values) => {
                setChoosedTags(values)
              }}
            />
          </div>
        )
      }
    </TagContext.Consumer>

  );
}

export default Material;

