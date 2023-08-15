import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';

const AddCustomerTutorial: React.FC = () => {
  // todo 图片资源本地化
  return (
    <PageContainer
      fixedHeader
      header={{
        title: '用户搜索添加',
      }}
    >
      <ProCard>
        <div className={'add-customer-tutorial-page'}>
          <div className={'content'}>
            <div className="title">
              ✋<span> 如何同时添加个人微信和企业微信的好友客户？</span>
            </div>
            <div className="hint">
              <span className="desc">
                客户搜索个人微信号添加员工时，员工可在 <span className="bold">[企业微信]</span>{' '}
                上通过客户好友申请
              </span>
              <span className="desc highlight">（个人微信需绑定企业微信账号）</span>
            </div>
            <div className="title"> 使用场景</div>
            <ul>
              <li className="desc-li">
                <p className="desc">
                  <span className="bold">【场景一】</span>
                  ：客户若不方便以识别二维码的方式来添加员工时，企业可在投放渠道放置员工
                  <span className="line-2">
                    的个人微信号；客户添加时，员工可同时在【个人微信】和【企业微信】通过客户的好友申请
                  </span>
                </p>
              </li>
              <li className="desc-li">
                <span className="desc">
                  <span className="bold">【场景二】</span> ：将客户同时引流至个人微信与企业微信{' '}
                </span>
              </li>
            </ul>
            <div className="title"> 使用步骤</div>
            <div className="line" />
            <div className="content-text">
              <div className="desc-wrap top">
                <span className="highlight desc">
                  {' '}
                  (1) 客户添加员工的个人微信时，员工个人微信收到好友验证消息
                </span>
              </div>
              <div className="desc-wrap bottom">
                <span className="highlight desc">
                  {' '}
                  (2) 员工前往验证 — 点击 <span className="bold">【接受】</span>
                </span>
              </div>
              <div className="img-list">
                <img src="/images/addCus_step1.jpg" alt="" />{' '}
                <img src="/images/addCus_step2.jpg" alt="" />
              </div>
              <div className="desc-wrap top">
                <span className="highlight desc">
                  {' '}
                  (3) 然后点击 <span className="bold"> 【去企业微信添加对方】 </span>
                </span>
              </div>
              <div className="desc-wrap bottom">
                <span className="highlight desc">
                  {' '}
                  (4) 自动跳转到企业微信， <span className="bold"> 先不要点击【通过验证】 </span>
                </span>
              </div>
              <div className="img-list">
                <img src="/images/addCus_step3.jpg" alt="" />{' '}
                <img src="/images/addCus_step4.jpg" alt="" />
              </div>
              <div className="desc-wrap">
                <span className="highlight desc">
                  {' '}
                  (5) 切换至员工个人微信进行 <span className="bold">【前往验证】</span>- 点击{' '}
                  <span className="bold"> 【完成】 </span>- 添加微信好友成功{' '}
                </span>
              </div>
              <div className="img-list">
                <img src="/images/addCus_step5.jpg" alt="" />{' '}
                <img src="/images/addCus_step6.jpg" alt="" />{' '}
                <img src="/images/addCus_step7.jpg" alt="" />
              </div>
              <div className="desc-wrap">
                <span className="highlight desc">
                  {' '}
                  (6) <span className="bold">再次切换至企业微信【通过验证】</span>- 点击{' '}
                  <span className="bold">【完成】</span>- 完成添加企业微信好友{' '}
                </span>
              </div>
              <div className="img-list">
                <img src="/images/addCus_step8.jpg" alt="" />{' '}
                <img src="/images/addCus_step9.jpg" alt="" />{' '}
                <img src="/images/addCus_step10.jpg" alt="" />
              </div>
              <div className="desc-wrap">
                <span className="highlight desc"> (7) 个人微信和企业微信同时添加好友完成 </span>
              </div>
              <div className="img-list">
                <img src="/images/addCus_step11.jpg" alt="" />{' '}
                <img src="/images/addCus_step12.jpg" alt="" />
              </div>
            </div>
          </div>
        </div>
      </ProCard>
    </PageContainer>
  );
};

export default AddCustomerTutorial;
