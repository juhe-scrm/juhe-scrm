import React from 'react';
import styles from './index.less';
import phoneImage from '@/assets/phone.png';
import avatarDefault from '@/assets/avatar-default.svg';
import { createFromIconfontCN } from '@ant-design/icons';
import type { WelcomeMsg } from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import defaultSettings from '../../../../../../config/defaultSettings';

const IconFont = createFromIconfontCN({
  scriptUrl: defaultSettings.iconfontUrl,
});

export type AutoReplyPreviewModalProps = {
  autoReply?: WelcomeMsg;
};

const AutoReplyPreview: React.FC<AutoReplyPreviewModalProps> = (props) => {
  const { autoReply } = props;
  return (
    <>
        <div className={styles.replyEditorPreview}>
          <img src={phoneImage} className='bg' />
          <div className='content'>
            <ul className='reply-list'>
              {autoReply?.text && (
                <li><img
                  src={avatarDefault} />
                  <div className='msg text'
                       dangerouslySetInnerHTML={{ __html: autoReply?.text }} />
                </li>
              )}
              {autoReply?.attachments && autoReply?.attachments.length > 0 && (
                autoReply?.attachments.map((attachment, index) => {
                  if (attachment.msgtype === 'image') {
                    return (
                      <li key={index}>
                        <img src={avatarDefault} />
                        <div className={`msg image`}>
                          <img src={attachment.image?.pic_url} />
                        </div>
                      </li>
                    );
                  }

                  if (attachment.msgtype === 'link') {
                    return (
                      <li key={index}>
                        <img src={avatarDefault} />
                        <div className='msg link'><p className='title'>{attachment.link?.title}</p>
                          <div className='link-inner'><p
                            className='desc'>{attachment.link?.desc}</p>
                            <img src={attachment.link?.picurl} />
                          </div>
                        </div>
                      </li>
                    );
                  }

                  if (attachment.msgtype === 'miniprogram') {
                    return (
                      <li key={index}>
                        <img src={avatarDefault} />
                        <div className='msg miniprogram'>
                          <p className='m-title'>
                            <IconFont
                              type={'icon-weixin-mini-app'}
                              style={{ marginRight: 4, fontSize: 14 }}
                            />
                            {attachment.miniprogram?.title}
                          </p>
                          <img src={attachment.miniprogram?.pic_media_id} />
                          <p className='l-title'>
                            <IconFont type={'icon-weixin-mini-app'} style={{ marginRight: 4 }} />
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
    </>
  );
};

export default AutoReplyPreview;
