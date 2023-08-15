import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd/es';
import { history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { CustomerMassMsgItem } from '@/pages/StaffAdmin/CustomerMassMsg/data';
import { Get } from '@/pages/StaffAdmin/CustomerMassMsg/service';
import { Col, Descriptions, Row, Typography } from 'antd';
import styles from './detail.less';
import AutoReplyPreview from '@/pages/StaffAdmin/Components/Sections/AutoReplyPreview';
import { CustomerMassMsgTypeLabels } from '@/pages/StaffAdmin/CustomerMassMsg/index';
import moment from 'moment';

const CustomerMassMsgDetail: React.FC = () => {
  const [currentItem, setCurrentItem] = useState<CustomerMassMsgItem>();
  const id = new URLSearchParams(window.location.search).get('id') || '';
  useEffect(() => {
    Get(id).then((res) => {
      if (res.code === 0) {
        setCurrentItem(res?.data);
      } else {
        message.error(res.message);
      }
    });

  }, []);

  return (
    <PageContainer
      onBack={() => history.goBack()}
      backIcon={<LeftOutlined />}
      header={{
        title: '群发详情',
      }}
    >
      <ProCard className={styles.detailContainer}>
        <Row gutter={2}>
          <Col lg={18} md={14} sm={12}>
            <Descriptions title='群发详情' column={1}>
              <Descriptions.Item label='创建者'>{currentItem?.created_at}</Descriptions.Item>
              <Descriptions.Item label='群发内容'>
                <div>
                  <p>{currentItem?.msg?.text}</p>
                  {currentItem?.msg?.attachments && currentItem?.msg?.attachments?.length > 0 && (
                    <>
                      <p style={{
                        color: 'rgb(255,133,0)',
                        fontSize: 13,
                      }}> [{currentItem?.msg?.attachments?.length || 0}个附件] </p>
                    </>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item
                label='群发类型'>{CustomerMassMsgTypeLabels[currentItem?.send_type || 1]}</Descriptions.Item>
              <Descriptions.Item
                label='发送状态'>{CustomerMassMsgTypeLabels[currentItem?.mission_status || 1]}</Descriptions.Item>
              <Descriptions.Item
                label='发送时间'>{moment(currentItem?.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col lg={4} md={8} sm={10} className={styles.previewContainer}>
            <Typography.Text className={styles.title}>客户收到的消息</Typography.Text>
            <div style={{ position: 'absolute', top: 30 }}>
              <AutoReplyPreview autoReply={currentItem?.msg} />
            </div>
          </Col>
        </Row>
      </ProCard>


      <ProCard style={{ marginTop: 12 }} gutter={2}>

      </ProCard>
    </PageContainer>
  );
};

export default CustomerMassMsgDetail;
