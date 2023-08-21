import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';

const AddCustomerTutorial: React.FC = () => {
  // todo 图片资源本地化
  return (
    <PageContainer
      fixedHeader
      header={{
        title: '聚合聊天',
      }}
    >
      <ProCard>
        <div className={'add-customer-tutorial-page'}>
          <div className={'content'}>
            <div className="title">
              😼 <span> 客服账号七零八落，咨询高峰应接不暇，试试聚合聊天？</span>
            </div>
            <div className="hint">
              <span className="desc">
                聚合聊天，高效管理客户咨询。详情请添加微信号 <span className="bold">【hansonskr】</span>垂询。
              </span>
            </div>
            <img width={1200} src="/images/chatMsgAggreDemo.png" />
            <br/>
            <br/>
          </div>
        </div>
      </ProCard>
    </PageContainer>
  );
};

export default AddCustomerTutorial;
