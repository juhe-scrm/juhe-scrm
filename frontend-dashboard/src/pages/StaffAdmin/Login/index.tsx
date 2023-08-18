import {Alert, Button, message, Result, Spin} from 'antd';
import React, {useState} from 'react';

import styles from './index.less';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
// @ts-ignore
import ScriptTag from 'react-script-tag';
import type {GetStaffAdminLoginQrcodeResp} from '@/services/staffAdmin';
import {GetStaffAdminLoginQrcode, StaffAdminForceLogin} from '@/services/staffAdmin';
import {CodeOK} from '../../../../config/constant';
import type {CommonResp} from '@/services/common';

export type StatusType = 'loading' | 'failed' | 'success' | '';

const QrcodeLogin: React.FC = () => {
  const [alertMessage, setAlertMessage] = useState<string>();
  const [code, setCode] = useState<number>();
  const [status, setStatus] = useState<StatusType>('loading');
  const handleScriptLoad = () => {
    const sourceURL = new URLSearchParams(window.location.search).get('redirect') || window.location.href.replace(window.location.pathname, '/staff-admin/welcome')
    setStatus('loading');
    GetStaffAdminLoginQrcode("", sourceURL)
      .then((res: CommonResp) => {
        if (res.code !== 0) {
          setAlertMessage(res.message);
          setCode(res.code);
          setStatus('failed');
          return;
        }
        const params = res.data as GetStaffAdminLoginQrcodeResp;
        console.log("params", params);
        // @ts-ignore
        window.WwLogin({
          id: 'qrcodeContainer',
          appid: params.app_id,
          agentid: params.agent_id,
          redirect_uri: params.redirect_uri,
          state: params.state,
          href: 'https://openscrm.oss-cn-hangzhou.aliyuncs.com/public/qrcode.css',
        });
        setStatus('success');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDemoLogin = () => {
    StaffAdminForceLogin().then((res: CommonResp) => {
      if (res.code !== 0) {
        message.error(res.message);
        return;
      }
      window.location.href = "/staff-admin/welcome";
    }).catch((err) => {
      message.error("自动登录失败")
      console.log("err", err)
    })
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Title
          level={1}
          className={styles.title}
          style={{fontWeight: 500, fontSize: '28px', marginBottom: '8px'}}
        >
          企业微信扫码登录
        </Title>
        <Paragraph className={styles.desc}>安全，强大，易开发的开源企业微信SCRM</Paragraph>
      </div>
      {code !== CodeOK && alertMessage && (
        <Alert
          style={{
            marginTop: 12,
          }}
          message={alertMessage}
          type="error"
          showIcon
        />
      )}
      {status === 'loading' && (
        <div className={styles.placeholder}>
          <Spin size={'large'}/>
        </div>
      )}
      {status === 'failed' && (
        <div className={styles.placeholder}>
          <Result status={'warning'} title="系统错误" subTitle="请联系管理员"/>
        </div>
      )}

      <div id="qrcodeContainer" className={styles.qrcodeContainer}>
        <ScriptTag
          type="text/javascript"
          src="https://rescdn.qqmail.com/node/ww/wwopenmng/js/sso/wwLogin-1.0.0.js"
          onLoad={handleScriptLoad}
        />
      </div>

      <Button
        className={styles.demoEntry}
        size="large"
        onClick={() => {
          handleDemoLogin();
        }}
      >
        演示入口
      </Button>
    </div>
  );
};

export default QrcodeLogin;
