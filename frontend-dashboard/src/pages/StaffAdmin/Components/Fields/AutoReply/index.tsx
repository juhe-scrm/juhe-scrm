import type {Dispatch, SetStateAction,MutableRefObject} from 'react';
import React, { useEffect, useRef, useState} from 'react';
import type {ProFormProps} from '@ant-design/pro-form/lib/layouts/ProForm';
import type {Attachment, MsgType, WelcomeMsg} from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import {
  createFromIconfontCN,
  DragOutlined,
  EditOutlined,
  FileImageOutlined,
  LinkOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import defaultSettings from '../../../../../../config/defaultSettings';
import type {FormInstance} from 'antd';
import {Alert, Dropdown, Form, Menu, message, Spin, Tooltip} from 'antd';
import phoneImage from '@/assets/phone.png';
import avatarDefault from '@/assets/avatar-default.svg';
import ContentEditable from 'react-contenteditable';
import {ReactSortable} from 'react-sortablejs';
import ProForm, {
  ModalForm,
  ProFormDependency,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import ImageUploader from '@/pages/StaffAdmin/Components/Fields/ImageUploader';
import styles from './index.less';
import type { GetSignedURLResult} from "@/services/common";
import {GetSignedURL, ParseURL} from "@/services/common";
import type {UploadRequestOption} from "rc-upload/lib/interface";


export type AutoReplyProps = Omit<ProFormProps, 'onFinish' | 'visible' | 'initialValues'> & {
  welcomeMsg: WelcomeMsg;
  setWelcomeMsg: Dispatch<SetStateAction<WelcomeMsg>>;
  isFetchDone: boolean; // 用于标记异步数据是否拉取完毕
  enableQuickInsert?: boolean; // 是否开启快速插入
};

const msgTypes = {
  image: '图片',
  link: '链接',
  miniprogram: '小程序',
  video: '视频',
};

const IconFont = createFromIconfontCN({
  scriptUrl: defaultSettings.iconfontUrl,
});

const itemDataToFormData = (value: WelcomeMsg) => {
  const item = {...value};
  if (item?.attachments) {
    // @ts-ignore
    item.attachments = item?.attachments?.map((attachment: Attachment, index: number) => {
      return {
        ...attachment,
        id: new Date().getTime().toString() + index.toString(),
        name: attachment?.image?.title || attachment?.link?.title || attachment?.miniprogram?.title,
      };
    });
  }

  return item;
};

const AutoReply: React.FC<AutoReplyProps> = (props) => {
  const {welcomeMsg, setWelcomeMsg, isFetchDone} = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentMode, setCurrentMode] = useState<MsgType>('image');
  const [linkFetching, setLinkFetching] = useState(false);
  const [content, setContent] = useState('');
  const contentRef = useRef<React.RefObject<HTMLElement>>();
  const imageModalFormRef = useRef<FormInstance>();
  const linkModalFormRef = useRef<FormInstance>();
  const miniAppModalFormRef = useRef<FormInstance>();

  const UploadFileFn = async (req: UploadRequestOption, ref: MutableRefObject<any | undefined>, inputName: string) => {
    const file = req.file as File;
    if (!file.name) {
      message.error('非法参数');
      return;
    }

    const hide = message.loading('上传中');
    try {
      const res = await GetSignedURL(file.name)
      const data = res.data as GetSignedURLResult
      if (res.code === 0) {
        const uploadRes = (await fetch(data.upload_url, {
          method: 'PUT',
          body: file
        }));
        hide();
        if (uploadRes.ok && ref) {
          ref.current?.setFieldsValue({[inputName]: data.download_url});
          return;
        }

        message.error('上传图片失败');

        return;
      }

      hide();
      message.error('获取上传地址失败');
      return;

    } catch (e) {
      message.error('上传图片失败');
      console.log(e);
    }
  };

  useEffect(() => {
    const formData = itemDataToFormData(welcomeMsg);
    setAttachments(formData.attachments || []);
    setContent(formData.text || '');
  }, [isFetchDone]);

  useEffect(() => {
    setWelcomeMsg({
      text: content || '',
      attachments: attachments || [],
    });
  }, [content, attachments]);

  return (
    <>
      <div className={styles.replyEditor}>
        <div className={'preview-container'}>
          <div className={styles.replyEditorPreview}>
            <img src={phoneImage} className='bg'/>
            <div className='content'>
              <ul className='reply-list'>
                {content && (
                  <li><img
                    src={avatarDefault}/>
                    <div className='msg text' dangerouslySetInnerHTML={{__html: content}}/>
                  </li>
                )}
                {attachments && attachments.length > 0 && (
                  attachments.map((attachment) => {
                    if (attachment.msgtype === 'image') {
                      return (
                        <li key={attachment.id}>
                          <img src={avatarDefault}/>
                          <div className={`msg image`}>
                            <img src={attachment.image?.pic_url}/>
                          </div>
                        </li>
                      );
                    }

                    if (attachment.msgtype === 'link') {
                      return (
                        <li key={attachment.id}>
                          <img src={avatarDefault}/>
                          <div className='msg link'><p className='title'>{attachment.link?.title}</p>
                            <div className='link-inner'><p
                              className='desc'>{attachment.link?.desc}</p>
                              <img src={attachment.link?.picurl}/>
                            </div>
                          </div>
                        </li>
                      );
                    }

                    if (attachment.msgtype === 'miniprogram') {
                      return (
                        <li key={attachment.id}>
                          <img src={avatarDefault}/>
                          <div className='msg miniprogram'>
                            <p className='m-title'>
                              <IconFont
                                type={'icon-weixin-mini-app'}
                                style={{marginRight: 4, fontSize: 14}}
                              />
                              {attachment.miniprogram?.title}
                            </p>
                            <img src={attachment.miniprogram?.pic_media_id}/>
                            <p className='l-title'>
                              <IconFont type={'icon-weixin-mini-app'} style={{marginRight: 4}}/>
                              小程序
                            </p>
                          </div>
                        </li>
                      );
                    }

                    return '';
                  })
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className='text-area-container'>
          <div className={styles.msgTextareaContainer} style={{border: 'none'}}>
            {props.enableQuickInsert && (
              <div className='insert-btn '>
                    <span
                      className='clickable no-select'
                      onClick={() => {
                        setContent(`${content}[客户昵称]`);
                      }}
                    >[插入客户昵称]</span>
              </div>
            )}
            <div className='textarea-container '>
              <ContentEditable
                // @ts-ignore
                innerRef={contentRef}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    document.execCommand('insertLineBreak');
                    event.preventDefault();
                  }
                }}
                className={'textarea'}
                html={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}/>
              <div className='flex-row align-side'>
                <p className='text-cnt'>{content.length}/600</p>
              </div>
            </div>
          </div>
        </div>
        <div className='option-area-container'>
          {attachments && attachments.length > 0 && (
            <ReactSortable handle={'.draggable-button'} tag='ul' className={'select-msg-options'} list={attachments} setList={setAttachments}>
              {attachments.map((attachment, index) => (
                <li key={attachment.id} className='flex-row'>
                      <span>
                        <MinusCircleOutlined
                          onClick={() => {
                            const items = [...attachments];
                            items.splice(index, 1);
                            setAttachments(items);
                          }}
                        />
                        【{msgTypes[attachment.msgtype]}】:
                        <span
                          className='col-1'>{attachment?.name}</span>
                      </span>
                  <span className='d-action-container'>
                      <EditOutlined
                        onClick={() => {
                          setCurrentMode(attachment.msgtype);
                          imageModalFormRef.current?.setFieldsValue(attachment.image);
                          linkModalFormRef.current?.setFieldsValue(attachment.link);
                          miniAppModalFormRef.current?.setFieldsValue(attachment.miniprogram);
                          setCurrentIndex(index);
                          setModalVisible(true);
                        }}
                      />
                      <DragOutlined
                        className={'draggable-button'}
                        style={{cursor: 'grabbing'}}
                      />
                    </span>
                </li>
              ))}
            </ReactSortable>
          )}
          <div className='option-container'>
            <Dropdown
              placement='topLeft'
              trigger={['click']}
              overlay={(
                <Menu style={{minWidth: 120}}>
                  <Menu.Item
                    key={'image'}
                    icon={<FileImageOutlined/>}
                    onClick={() => {
                      setCurrentMode('image');
                      setCurrentIndex(attachments.length);
                      imageModalFormRef.current?.resetFields();
                      setModalVisible(true);
                    }}
                  >
                    图片
                  </Menu.Item>
                  <Menu.Item
                    key={'link'}
                    icon={<LinkOutlined/>}
                    onClick={() => {
                      setCurrentMode('link');
                      setCurrentIndex(attachments.length);
                      setModalVisible(true);
                    }}
                  >
                    链接
                  </Menu.Item>
                  <Menu.Item
                    key={'miniApp'}
                    icon={<IconFont type={'icon-weixin-mini-app'}/>}
                    onClick={() => {
                      setCurrentMode('miniprogram');
                      setCurrentIndex(attachments.length);
                      setModalVisible(true);
                    }}
                  >
                    小程序
                  </Menu.Item>
                </Menu>
              )}
            >
              <a className='ant-dropdown-link' onClick={e => e.preventDefault()}>
                <PlusCircleOutlined/> 添加附件
              </a>
            </Dropdown>
          </div>
        </div>
      </div>

      <ModalForm
        formRef={imageModalFormRef}
        className={'dialog from-item-label-100w'}
        layout={'horizontal'}
        width={'560px'}
        visible={currentMode === 'image' && modalVisible}
        onVisibleChange={setModalVisible}
        onFinish={async (params: { title: string, pic_url: string, msgtype: MsgType }) => {
          attachments[currentIndex] = {
            id: new Date().getTime().toString(),
            msgtype: params.msgtype,
            name: params.title,
            image: {...params},
          };
          setAttachments(attachments);
          return true;
        }}
      >
        <h2 className='dialog-title'> 添加图片附件 </h2>
        <ProForm.Item initialValue={'image'} name={'msgtype'} noStyle={true}>
          <input type={'hidden'}/>
        </ProForm.Item>
        <ProFormText
          name='title'
          label='图片名称'
          placeholder={'请输入图片名称'}
          width='md'
          rules={[
            {
              required: true,
              message: '请输入图片名称！',
            },
          ]}
        />
        <Form.Item
          label='上传图片'
          name='pic_url'
          rules={[
            {
              required: true,
              message: '请上传图片！',
            },
          ]}
        >
          <ImageUploader
            customRequest={async (req) => {
              await UploadFileFn(req, imageModalFormRef, 'pic_url')
            }}
          />
        </Form.Item>
      </ModalForm>


      <ModalForm
        formRef={linkModalFormRef}
        className={'dialog from-item-label-100w'}
        layout={'horizontal'}
        width={'560px'}
        visible={currentMode === 'link' && modalVisible}
        onVisibleChange={setModalVisible}
        onFinish={async (params) => {
          attachments[currentIndex] = {
            id: new Date().getTime().toString(),
            msgtype: params.msgtype,
            name: params.title,
            // @ts-ignore
            link: {...params},
          };
          setAttachments(attachments);
          return true;
        }}
      >
        <Spin spinning={linkFetching}>
          <h2 className='dialog-title'> 添加链接附件 </h2>
          <ProForm.Item initialValue={'link'} name={'msgtype'} noStyle={true}>
            <input type={'hidden'}/>
          </ProForm.Item>
          <ProFormText
            name='url'
            label='链接地址'
            width='md'
            fieldProps={{
              disabled: linkFetching,
              addonAfter: (
                <Tooltip title="点击抓取远程链接，自动填充标题，描述，图片">
                  <div
                    onClick={async () => {
                      setLinkFetching(true);
                      const res = await ParseURL(linkModalFormRef.current?.getFieldValue('url'))
                      setLinkFetching(false);
                      if (res.code !== 0) {
                        message.error(res.message);
                      } else {
                        message.success('解析链接成功');
                        linkModalFormRef?.current?.setFieldsValue({
                          customer_link_enable: 1,
                          title: res.data.title,
                          desc: res.data.desc,
                          picurl: res.data.img_url,
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
          <ProFormSwitch
            label={'高级设置'}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            name='customer_link_enable'
            tooltip={'开启后可以自定义链接所有信息'}
          />
          <ProFormDependency name={['customer_link_enable']}>
            {({customer_link_enable}) => {
              if (customer_link_enable) {
                return (
                  <>
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
                      name='desc'
                      label='链接描述'
                      width='md'
                    />
                    <Form.Item
                      label='链接封面'
                      name='picurl'
                      rules={[
                        {
                          required: true,
                          message: '请上传链接图片！',
                        },
                      ]}
                    >
                      <ImageUploader
                        customRequest={async (req) => {
                          await UploadFileFn(req, linkModalFormRef, 'picurl')
                        }}
                      />
                    </Form.Item>
                  </>
                );
              }
              return <></>;
            }}
          </ProFormDependency>
        </Spin>
      </ModalForm>


      <ModalForm
        formRef={miniAppModalFormRef}
        className={'dialog from-item-label-100w'}
        layout={'horizontal'}
        width={'560px'}
        labelCol={{
          md: 6,
        }}
        visible={currentMode === 'miniprogram' && modalVisible}
        onVisibleChange={setModalVisible}
        onFinish={async (params) => {
          attachments[currentIndex] = {
            id: new Date().getTime().toString(),
            msgtype: params.msgtype,
            name: params.title,
            // @ts-ignore
            miniprogram: {...params},
          };
          setAttachments(attachments);
          return true;
        }}
      >
        <h2 className='dialog-title'> 添加小程序附件 </h2>

        <Alert
          showIcon={true}
          type='info'
          message={
            '请填写企业微信后台绑定的小程序id和路径，否则会造成发送失败'
          }
          style={{marginBottom: 20}}
        />

        <ProForm.Item initialValue={'miniprogram'} name={'msgtype'} noStyle={true}>
          <input type={'hidden'}/>
        </ProForm.Item>

        <ProFormText
          name='title'
          label='小程序标题'
          width='md'
          rules={[
            {
              required: true,
              message: '请输入链接标题',
            },
          ]}
        />

        <ProFormText
          // 帮助指引
          name='app_id'
          label='小程序AppID'
          width='md'
          rules={[
            {
              required: true,
              message: '请输入小程序AppID',
            },
          ]}
        />

        <ProFormText
          name='page'
          label='小程序路径'
          width='md'
          rules={[
            {
              required: true,
              message: '请输入小程序路径',
            },
          ]}
        />

        <Form.Item
          label='小程序封面'
          name='pic_media_id'
          rules={[
            {
              required: true,
              message: '请小程序封面！',
            },
          ]}
        >
          <ImageUploader
            customRequest={async (req) => {
              await UploadFileFn(req, miniAppModalFormRef, 'pic_media_id')
            }}
          />
        </Form.Item>

      </ModalForm>

    </>
  );
};

export default AutoReply;
