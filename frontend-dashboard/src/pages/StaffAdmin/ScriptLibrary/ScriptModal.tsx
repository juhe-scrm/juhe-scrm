import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {DeleteTwoTone, FolderFilled, PlusOutlined, SyncOutlined,} from '@ant-design/icons';
import type {FormInstance, ModalProps} from 'antd';
import {Divider, Input, message, Modal, Row, Select, Tooltip} from 'antd';
import type {Dispatch, SetStateAction} from 'react';
import {True} from '../../../../config/constant';
import styles from "./index.less";
import {
  CreateEnterpriseScriptGroups,
  QueryEnterpriseScriptGroups,
  UpdateEnterpriseScriptGroups,
  GetSignedUrl
} from './service';
import Uploader from "./components/Uploader";
import type {RcFile} from "antd/es/upload";
import {HandleRequest} from "@/utils/utils";
import GroupModal from "@/pages/StaffAdmin/ScriptLibrary/GroupModal";
import type {DepartmentOption} from "@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal";
import {ParseURL} from "@/services/common";
import {
  ProFormDependency,
  ProFormList,
  ProFormRadio,
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-form';
import ProForm from '@ant-design/pro-form';

export type ScriptModalProps = Omit<ModalProps, 'onFinish' | 'visible' | 'initialValues'> & {
  type?: 'create' | 'edit';
  onFinish: (params: any, action: string) => void;
  initialValues?: Partial<Script.Item>;
  onCancel: () => void;
  setVisible: Dispatch<SetStateAction<boolean>>;
  visible: boolean;
  allDepartments?: DepartmentOption[];
  setPropsGroupsTimestamp?: any;
};
export type FrontEndReplyDetailParams = {
  // 前端的reply_details结构
  id?: string;
  content_type: number;
  text_content?: string;
  image_title?: string;
  image_size?: string;
  image_picurl?: string;
  link_title?: string;
  link_picurl?: string;
  link_url?: string;
  link_desc?: string;
  pdf_title?: string;
  pdf_size?: string;
  pdf_fileurl?: string;
  video_title?: string;
  video_size?: string;
  video_picurl?: string;
}

const {Option} = Select;

export const typeEnums = {
  2: 'text', 3: 'image', 4: 'link', 5: 'pdf', 6: 'video', 1: '复合消息'
}

const ScriptModal: (props: ScriptModalProps, ref: any) => JSX.Element = (props, ref) => {
  const formRef = useRef<FormInstance>();
  const [fileInfoAry, setFileInfoAry] = useState<{ fileName: string, fileSize: string, key: number }[]>([]) // PDF的文件信息数组
  const groupModalRef = useRef<any>({});
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupItems, setGroupItems] = useState<Partial<ScriptGroup.Item>[]>([]);
  const [groupItemsTimestamp, setGroupItemsTimestamp] = useState(Date.now);
  const [deletedIds,setDeletedIds] = useState<number[]>([])

  React.useImperativeHandle(ref, () => {
    return {
      open: (item: Partial<Script.Item>) => {
        setGroupItemsTimestamp(Date.now)
        setTimeout(() => {
          formRef?.current?.setFieldsValue(item)
        }, 100)
        props.setVisible(true)
      },
      close: () => {
        formRef?.current?.resetFields()
        props.setVisible(false)
      }
    }
  })

  useEffect(() => {
    QueryEnterpriseScriptGroups({page_size: 5000}).then(res => {
      if (res?.code === 0 && res?.data) {
        setGroupItems(res?.data?.items || [])
      }
    }).catch((err) => {
      message.error(err);
    });
  }, [groupItemsTimestamp])

  // 转为传给后端的数据
  const transferParams = (params: any) => {
    const newReplyDetails = []
    for (let i = 0; i < params.reply_details.length; i += 1) {
      const typeObjectKey = typeEnums[params.reply_details[i].content_type]
      const replyDetailItem = {content_type: params.reply_details[i].content_type, id: params.reply_details[i].id || '',quick_reply_content: {}}
      const item = params.reply_details[i]
      if (typeObjectKey === 'text') {
        const quickReplyContent = {
          text: {
            'content': item.text_content
          }
        }
        replyDetailItem.quick_reply_content = quickReplyContent
        newReplyDetails.push(replyDetailItem)
      }
      if (typeObjectKey === 'image') {
        const quickReplyContent = {
          image: {
            'title': item.image_title,
            'size': item.image_size,
            'picurl': item.image_picurl
          }
        }
        replyDetailItem.quick_reply_content = quickReplyContent
        newReplyDetails.push(replyDetailItem)
      }
      if (typeObjectKey === 'link') {
        const quickReplyContent = {
          link: {
            'title': item.link_title,
            'picurl': item.link_picurl,
            'desc': item.link_desc,
            'url': item.link_url
          }
        }
        replyDetailItem.quick_reply_content = quickReplyContent
        newReplyDetails.push(replyDetailItem)
      }
      if (typeObjectKey === 'pdf') {
        const quickReplyContent = {
          pdf: {
            'title': item.pdf_title,
            'size': item.pdf_size,
            'fileurl': item.pdf_fileurl
          }
        }
        replyDetailItem.quick_reply_content = quickReplyContent
        newReplyDetails.push(replyDetailItem)
      }
      if (typeObjectKey === 'video') {
        const quickReplyContent = {
          video: {
            'title': item.video_title,
            'size': item.video_size,
            'picurl': item.video_picurl
          }
        }
        replyDetailItem.quick_reply_content = quickReplyContent
        newReplyDetails.push(replyDetailItem)
      }
    }
    return {...params, reply_details: newReplyDetails, id: props.initialValues?.id,deleted_ids:deletedIds||[]}
  }

  return (
    <div className={styles.scriptModalContainer}>
      <Modal
        {...props}
        width={640}
        className={'dialog from-item-label-100w'}
        visible={props.visible}
        onOk={() => {
          setFileInfoAry([])
          formRef?.current?.submit();
        }}
        onCancel={() => {
          props.setVisible(false)
          formRef?.current?.resetFields()
          props.onCancel()
          setFileInfoAry([])
        }}
      >
        <ProForm
          formRef={formRef}
          layout={'horizontal'}
          submitter={{
            resetButtonProps: {
              style: {
                display: 'none',
              },
            },
            submitButtonProps: {
              style: {
                display: 'none',
              },
            },
          }}
          onFinish={async (values) => {
            const params: any = transferParams(values)
            if (values.is_global === True) {
              params.departments = [0];
            }
            await props.onFinish(params, props.initialValues?.id ? 'update' : 'create');
          }}

        >
          <h3 className="dialog-title" style={{fontSize: 18}}>
            {props.initialValues?.id ? '修改话术' : '新建话术'}
          </h3>

          <ProForm.Item
            name={'group_id'}
            label="分组"
            rules={[{required: true, message: '请选择分组!'}]}
          >
            <Select
              style={{width: 400}}
              placeholder="请选择分组"
              dropdownRender={menu => (
                <div>
                  {menu}
                  <Divider style={{margin: '4px 0'}}/>
                  <div style={{display: 'flex', flexWrap: 'nowrap', padding: 8}}>
                    <a
                      style={{flex: 'none', display: 'block', cursor: 'pointer'}}
                      onClick={() => {
                        groupModalRef.current.open({sub_group: [{name: ''}]})
                      }}
                    >
                      <PlusOutlined/> 新建分组
                    </a>
                  </div>
                </div>
              )}
            >
              {
                groupItems?.map(item => (
                  <Option key={item.id} value={String(item.id)}>
                    <FolderFilled style={{fontSize: '16px', color: '#138af8', marginRight: 8}}/>
                    {item.name}
                  </Option>
                ))
              }
            </Select>
          </ProForm.Item>

          <ProForm.Item name="name" label="标题" rules={[{required: true, message: '请输入标题!'}]} >
            <Input placeholder="仅内部可见，方便整理和查看" style={{width: 400}} maxLength={10}/>
          </ProForm.Item>

          <ProFormList
            name="reply_details"
            creatorButtonProps={{
              type: 'default',
              style: {width: '128px', color: '#58adfc', borderColor: '#58adfc', marginLeft: '20px', marginTop: '-30px'},
              position: 'bottom',
              creatorButtonText: '添加内容',
            }}
            creatorRecord={{
              content_type: 2,
            }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            itemRender={({listDom}, {field, record, operation}) => {
              const currentKey = field.name;
              // const boundKey = field.fieldKey;
              return (
                <div className={styles.dynamicFormContainer}>
                  <div>
                    <div className={styles.radioBox}>
                      <ProFormRadio.Group
                        name="content_type"
                        initialValue={'word'}
                        label=""
                        options={[
                          {
                            label: '文字',
                            value: 2,
                          },
                          {
                            label: '图片',
                            value: 3,
                          },
                          {
                            label: '网页',
                            value: 4,
                          },
                          {
                            label: 'PDF',
                            value: 5,
                          },
                          {
                            label: '视频',
                            value: 6,
                          },
                        ]}
                      />
                    </div>
                    <ProForm.Item name="id" label="" style={{display: 'none'}}>
                      <Input />
                    </ProForm.Item>
                    <div className={styles.tabContent}>
                      <ProFormDependency name={['content_type']}>
                        {({content_type}) => {
                          if (content_type === 2) {
                            return (
                              <ProFormTextArea
                                name="text_content"
                                label={'话术内容'}
                                placeholder="请输入话术内容"
                                rules={[{required: true, message: '请输入话术内容!'}]}
                                fieldProps={{showCount: true, maxLength: 1300, allowClear: true}}
                              />
                            );
                          }
                          if (content_type === 3) {
                            return <div>
                              <ProForm.Item name="image_title" label="图片名称"
                                            rules={[{required: true, message: '请输入图片名称!'}]}>
                                <Input placeholder="图片名称可用于搜索" style={{width: 328}}/>
                              </ProForm.Item>

                              <ProForm.Item name="image_size" label="" style={{display: 'none'}}>
                                <Input placeholder="仅内部可见，方便整理和查看"/>
                              </ProForm.Item>

                              <ProForm.Item
                                name='image_picurl'
                                label={'上传图片'}
                              >
                                {/* 上传图片 */}
                                <Uploader
                                  fileType={'formImage'}
                                  customRequest={async (req) => {
                                    try {
                                      const file = req.file as RcFile;
                                      const getUploadUrlRes = await GetSignedUrl({file_name: file.name})
                                      if (getUploadUrlRes.code !== 0) {
                                        message.error('获取上传地址失败');
                                        return;
                                      }
                                      const uploadRes = await fetch(getUploadUrlRes?.data?.upload_url, {
                                        method: 'PUT',
                                        body: file
                                      });
                                      if (uploadRes.clone().ok) {
                                        const reply_details = formRef?.current?.getFieldValue('reply_details');
                                        reply_details[currentKey].image_picurl = getUploadUrlRes?.data?.download_url;
                                        reply_details[currentKey].image_title = file.name;
                                        reply_details[currentKey].image_size = String(file.size);
                                        formRef?.current?.setFieldsValue({...reply_details})
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
                            </div>
                          }
                          if (content_type === 4) {// 解析链接
                            return (
                              <div>
                                <ProFormText
                                  name='link_url'
                                  label='链接地址'
                                  placeholder="请输入链接，链接地址以http或https开头"
                                  fieldProps={{
                                    addonAfter: (
                                      <Tooltip title="点击抓取远程链接，自动填充标题，描述，图片">
                                        <div
                                          onClick={async () => {
                                            const res = await ParseURL(formRef?.current?.getFieldValue('reply_details')[currentKey].link_url)
                                            if (res.code !== 0) {
                                              message.error(res.message);
                                            } else {
                                              message.success('解析链接成功');
                                              const reply_details = formRef?.current?.getFieldValue('reply_details');
                                              reply_details[currentKey].link_title = res.data.title;// 链接标题
                                              reply_details[currentKey].link_desc = res.data.desc; // 链接描述
                                              reply_details[currentKey].link_picurl = res.data.img_url; // 图片
                                              formRef?.current?.setFieldsValue({reply_details})
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
                                  name='link_title'
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
                                  name='link_desc'
                                  label='链接描述'
                                  width='md'
                                />
                                <ProForm.Item
                                  label='链接封面'
                                  name='link_picurl'
                                  rules={[
                                    {
                                      required: true,
                                      message: '请上传链接图片！',
                                    },
                                  ]}
                                >
                                  <Uploader
                                    fileType={'formImage'}
                                    customRequest={async (req) => {
                                      try {
                                        const file = req.file as RcFile;
                                        const getUploadUrlRes = await GetSignedUrl({file_name: file.name})
                                        if (getUploadUrlRes.code !== 0) {
                                          message.error('获取上传地址失败');
                                          return;
                                        }
                                        const uploadRes = await fetch(getUploadUrlRes?.data?.upload_url, {
                                          method: 'PUT',
                                          body: file
                                        });
                                        if (uploadRes.clone().ok) {
                                          const reply_details = formRef?.current?.getFieldValue('reply_details');
                                          reply_details[currentKey].link_picurl = getUploadUrlRes?.data?.download_url;
                                          formRef?.current?.setFieldsValue({...reply_details})
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
                              </div>
                            )
                          }
                          if (content_type === 5) {
                            return (
                              <div>
                                <ProForm.Item name="pdf_title" label="" style={{display: 'none'}}>
                                  <Input/>
                                </ProForm.Item>
                                <ProForm.Item name="pdf_size" label="" style={{display: 'none'}}>
                                  <Input/>
                                </ProForm.Item>
                                <div className={styles.pdfUploadBox}>
                                  <ProForm.Item name={'pdf_fileurl'}>
                                    <Uploader
                                      fileType='PDF'
                                      fileInfoAry={fileInfoAry}
                                      setFileInfoAry={setFileInfoAry}
                                      currentKey={currentKey}
                                      initialFileInfo={{
                                        // 修改PDF时要回显的文件信息
                                        fileName: formRef?.current?.getFieldValue('reply_details')[currentKey].pdf_title,
                                        fileSize: formRef?.current?.getFieldValue('reply_details')[currentKey].pdf_size,
                                        key: currentKey
                                      }}
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
                                          // 下载
                                          if (uploadRes.clone().ok) {
                                            const reply_details = formRef?.current?.getFieldValue('reply_details');
                                            reply_details[currentKey].pdf_fileurl = getUploadUrlRes?.data?.download_url;
                                            reply_details[currentKey].pdf_title = file.name;
                                            reply_details[currentKey].pdf_size = String(file.size);
                                            formRef?.current?.setFieldsValue({reply_details})
                                            return;
                                          }
                                          message.error('上传PDF失败');
                                          return;
                                        } catch (e) {
                                          message.error('上传PDF失败');
                                        }
                                      }}
                                    />
                                  </ProForm.Item>
                                </div>
                              </div>
                            );
                          }
                          if (content_type === 6) {
                            return (
                              <>
                                <Row>
                                  <div style={{display: 'none'}}>
                                    <ProFormText name="video_title"/>
                                    <ProFormText name="video_size"/>
                                  </div>
                                  <div className={styles.videoUplaodBox}></div>
                                  <ProForm.Item name={'video_picurl'}>
                                    <Uploader
                                      fileType='视频'
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
                                          // 下载
                                          if (uploadRes.clone().ok) {
                                            const reply_details = formRef?.current?.getFieldValue('reply_details');
                                            reply_details[currentKey].video_picurl = getUploadUrlRes?.data?.download_url;
                                            reply_details[currentKey].video_title = file.name;
                                            reply_details[currentKey].video_size = String(file.size);
                                            formRef?.current?.setFieldsValue({reply_details})
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
                                </Row>
                              </>
                            );
                          }
                          return <></>;
                        }}
                      </ProFormDependency>
                    </div>
                  </div>
                  <div>
                    {
                      formRef?.current?.getFieldValue('reply_details').length>1 &&  <Tooltip key={'remove'} title="删除">
                        <DeleteTwoTone
                          style={{paddingTop: 8}}
                          className={'ant-pro-form-list-action-icon'}
                          onClick={() => {
                            const temp = [...fileInfoAry]
                            for (let i = 0; i < temp.length; i += 1) {
                              if (temp[i].key === currentKey) {
                                temp.splice(i, 1)
                              }
                            }
                            setFileInfoAry(temp)
                            if(formRef?.current?.getFieldValue('reply_details')?.[currentKey].id){
                              setDeletedIds([...deletedIds,formRef?.current?.getFieldValue('reply_details')[currentKey].id])
                            }
                            operation.remove(currentKey);
                          }}

                        />
                      </Tooltip>
                    }
                  </div>
                </div>
              )
            }}
          >
          </ProFormList>
        </ProForm>
      </Modal>
      <GroupModal
        allDepartments={props.allDepartments as DepartmentOption[]}
        ref={groupModalRef}
        visible={groupModalVisible}
        setVisible={setGroupModalVisible}
        onFinish={async (values, action) => {
          if (action === 'create') {
            await HandleRequest({...values, sub_groups: values.sub_group || []}, CreateEnterpriseScriptGroups, () => {
              setGroupItemsTimestamp(Date.now)
              groupModalRef.current.close()
            })
          } else {
            await HandleRequest({...values, sub_groups: values.sub_group || []}, UpdateEnterpriseScriptGroups, () => {
              setGroupItemsTimestamp(Date.now)
              groupModalRef.current.close()
            })
          }
        }}
      />
    </div>

  )
}

export default forwardRef(ScriptModal)
