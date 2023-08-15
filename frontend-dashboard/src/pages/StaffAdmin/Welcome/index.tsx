import React, {useEffect, useRef, useState} from 'react';
import ProCard, {StatisticCard} from '@ant-design/pro-card';
import RcResizeObserver from 'rc-resize-observer';
import styles from './index.less';
import type {FormInstance} from 'antd';
import {Button, Col, DatePicker, Divider, Form, message, Radio, Row, Select, Typography,} from 'antd';
import {connect, history} from 'umi';
import type {StaffAdminInterface} from '@/services/staffAdmin';
import type {ConnectProps} from '@@/plugin-dva/connect';
import type {ConnectState} from '@/models/connect';
import {Area} from '@ant-design/charts';
import type {AreaConfig} from '@ant-design/charts/es/plots/area';
import type {GetTrendParams, SummaryResult, TrendItem} from '@/pages/StaffAdmin/Welcome/service';
import {GetSummary, GetTrend} from '@/pages/StaffAdmin/Welcome/service';
import type {CommonResp} from '@/services/common';
import StaffTreeSelect from '@/pages/StaffAdmin/Components/Fields/StaffTreeSelect';
import type {StaffOption} from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import type {SimpleStaffInterface} from '@/services/staff';
import {QuerySimpleStaffs} from '@/services/staff';
import moment from 'moment';
import QrcodeImage from '../../../assets/qrcode.png';
import ChatImage from '../../../assets/chat.svg';
import Paragraph from 'antd/es/typography/Paragraph';
import type {ChartRefConfig} from '@ant-design/charts/es/interface';
import Icon, {createFromIconfontCN, MessageOutlined, QrcodeOutlined, TagsOutlined} from '@ant-design/icons';
import defaultSettings from '../../../../config/defaultSettings';
import {isImg, isUrl} from '@/utils/utils';

export type WelcomeProps = {
  currentStaffAdmin?: StaffAdminInterface;
  collapsed: boolean;
} & Partial<ConnectProps>;

const IconFont = createFromIconfontCN({
  scriptUrl: defaultSettings.iconfontUrl,
});

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'icon-geren' #For Iconfont ,
//   icon: 'http://demo.com/icon.png',
//   icon: '/favicon.png',
//   icon: <Icon type="setting" />,
const getIcon = (
  icon?: string | React.ReactNode,
  iconPrefixes: string = 'icon-',
): React.ReactNode => {
  if (typeof icon === 'string' && icon !== '') {
    if (isUrl(icon) || isImg(icon)) {
      return (
        <Icon component={() => <img src={icon} alt='icon' className='ant-pro-sider-menu-icon'/>}/>
      );
    }
    if (icon.startsWith(iconPrefixes)) {
      return <IconFont style={{color: 'rgba(0,0,0,0.65)'}} type={icon}/>;
    }
  }
  return icon;
};

const Welcome: React.FC<WelcomeProps> = (props) => {
  const {currentStaffAdmin, collapsed} = props;
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mainWidth, setMainWidth] = useState(window.innerWidth);
  const [summary, setSummary] = useState<SummaryResult>();
  const [trendItems, setTrendItems] = useState<TrendItem[]>([]);
  const formRef = useRef<FormInstance>();
  const chartRef = useRef<ChartRefConfig>();
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);
  const initialValues = {
    statistic_type: 'total',
    date_range_type: 'week',
    date_range: [moment().add(-7, 'd'), moment()],
    ext_staff_ids: [],
  };

  useEffect(() => {
    const chartWidth = mainWidth - 36 - 4 - (showSidebar ? 300 : 0);
    // @ts-ignore
    chartRef?.current?.chart?.changeSize(chartWidth, 335);
  }, [mainWidth, showSidebar, collapsed]);

  const chartConfig: AreaConfig = {
    data: trendItems,
    // @ts-ignore
    chartRef,
    height: 360,
    xField: 'date',
    yField: 'number',
    meta: {
      date: {
        alias: '日期',
      },
      number: {
        alias: '客户数',
      },
    },
    yAxis: {
      grid: {
        line: {
          style: {
            stroke: 'rgba(0,0,0,0.15)',
            lineWidth: 1,
            lineDash: [4, 5],
          },
        },
      },
    },
    line: {
      style: {
        stroke: 'rgb(91,143,249)',
        lineWidth: 2,
      },
    },
    smooth: true,
    point: {
      size: 2,
    },
    tooltip: {
      domStyles: {
        'g2-tooltip': {
          backgroundColor: 'rgba(0,0,0,0.8)',
        },
        'g2-tooltip-title': {
          color: 'rgb(255,255,255)',
        },
        'g2-tooltip-list': {
          color: 'rgb(255,255,255)',
        },
      },
    },
    areaStyle: function areaStyle() {
      return {fill: 'l(270) 0:#ffffff 0.5:#c0d4fc 1:#5e91f9'};
    },
  };

  const formDataTransform = (params: any): GetTrendParams => {
    const values = {
      ...params,
      start_time: params.date_range[0].format('YYYY-MM-DD').toString(),
      end_time: params.date_range[1].format('YYYY-MM-DD').toString(),
    };
    delete values.date_range_type;
    delete values.date_range;
    return values;
  };

  useEffect(() => {
    QuerySimpleStaffs({page_size: 5000}).then((res) => {
      if (res.code === 0) {
        setAllStaffs(
          res?.data?.items?.map((item: SimpleStaffInterface) => {
            return {
              label: item.name,
              value: item.ext_id,
              ...item,
            };
          }) || [],
        );
      } else {
        message.error(res.message);
      }
    });

    GetTrend(formDataTransform(initialValues)).then((res) => {
      if (res.code === 0) {
        setTrendItems(res?.data || [],
        );
      } else {
        message.error(res.message);
      }
    });

    GetSummary().then((res: CommonResp) => {
      if (res.code !== 0) {
        message.error('获取统计数据失败');
        return;
      }
      setSummary(res.data);
    }).catch((err) => {
      console.log('err', err);
      message.error('获取统计数据失败');
    });

  }, []);

  return (
    <>
      <RcResizeObserver
        key='resize-observer'
        onResize={(offset) => {
          setMainWidth(offset.width);
          setIsSmallScreen(offset.width <= 576);
          setShowSidebar(offset.width >= 992);
        }}
      >
        <ProCard direction={'column'} ghost={true} gutter={8} className={styles.welcomeContainer}>
          <ProCard.Group ghost={true} wrap={!showSidebar} gutter={8} direction={isSmallScreen ? 'column' : 'row'}>
            <ProCard ghost={true} wrap={!showSidebar} gutter={8} direction={isSmallScreen ? 'column' : 'row'}>
              <ProCard ghost={true}>
                <StatisticCard.Group
                  title={
                    <>
                      客户统计
                      <Divider type={'vertical'}/>
                      <a className={styles.detailButton} onClick={() => {
                        history.push('/staff-admin/customer-management/customer');
                      }}>查看客户</a>
                    </>
                  }
                  direction={isSmallScreen ? 'column' : 'row'}
                >
                  <StatisticCard
                    statistic={{
                      title: '客户总数',
                      value: summary?.total_customers_num,
                    }}
                  />
                  <ProCard.Divider type={isSmallScreen ? 'horizontal' : 'vertical'}/>
                  <StatisticCard
                    statistic={{
                      title: '今日新增',
                      value: summary?.today_customers_increase,
                    }}
                  />
                  <ProCard.Divider type={isSmallScreen ? 'horizontal' : 'vertical'}/>
                  <StatisticCard
                    statistic={{
                      title: '今日流失',
                      value: summary?.today_customers_decrease,
                    }}
                  />
                </StatisticCard.Group>
              </ProCard>
              <ProCard ghost={true}>
                <StatisticCard.Group
                  title={
                    <>
                      群统计
                      <Divider type={'vertical'}/>
                      <a className={styles.detailButton} onClick={() => {
                        history.push('/staff-admin/group-chat/list');
                      }}>查看客户群</a>
                    </>
                  }
                  direction={isSmallScreen ? 'column' : 'row'}
                >
                  <StatisticCard
                    statistic={{
                      title: '群总数',
                      value: summary?.total_groups_num,
                    }}
                  />
                  <ProCard.Divider type={isSmallScreen ? 'horizontal' : 'vertical'}/>
                  <StatisticCard
                    colSpan={'8'}
                    statistic={{
                      title: '今日入群',
                      value: summary?.today_groups_increase,
                    }}
                  />
                  <ProCard.Divider type={isSmallScreen ? 'horizontal' : 'vertical'}/>
                  <StatisticCard
                    statistic={{
                      title: '今日退群',
                      value: summary?.today_groups_decrease,
                    }}
                  />
                </StatisticCard.Group>
              </ProCard>
            </ProCard>

            <ProCard hidden={!showSidebar} colSpan={{
              lg: '300px',
            }}>
              <div className={styles.staffInfoBox}>
                <img
                  src={currentStaffAdmin?.avatar_url}
                  className={styles.avatar}
                  alt={currentStaffAdmin?.name}
                />
                <div className={styles.textGroup}>
                  <p className={styles.nickname}>
                    {currentStaffAdmin?.name}
                  </p>
                  <p className={styles.role}>{currentStaffAdmin?.role?.name}</p>
                </div>
              </div>
              <div>
                <Typography.Paragraph style={{marginBottom: 6}}>
                  <Typography.Text style={{color: '#6b7a88'}}>企业名称：</Typography.Text>
                  <Typography.Text>成都小橘科技有限公司</Typography.Text>
                </Typography.Paragraph>
                <Typography.Paragraph style={{marginBottom: 0}}>
                  <Typography.Text style={{color: '#6b7a88'}}>员工总数：</Typography.Text>
                  <Typography.Text>12</Typography.Text>
                </Typography.Paragraph>
              </div>
            </ProCard>
          </ProCard.Group>

          <ProCard.Group ghost={true} gutter={8} style={{marginTop: 12}}>
            <ProCard className={styles.trendChartContainer}>
              <div>
                <Form
                  // @ts-ignore
                  ref={formRef}
                  initialValues={initialValues}
                  onValuesChange={(changedValues, values) => {
                    const transformedValues = {...values};
                    if (changedValues?.date_range_type) {
                      let date_range = [
                        moment(),
                        moment(),
                      ];
                      if (transformedValues.date_range_type === 'week') {
                        date_range = [
                          moment().add(-7, 'd'),
                          moment(),
                        ];
                      }
                      if (transformedValues.date_range_type === 'month') {
                        date_range = [
                          moment().add(-30, 'd'),
                          moment(),
                        ];
                      }

                      formRef.current?.setFieldsValue({
                        date_range,
                      });

                      transformedValues.date_range = date_range;
                    }

                    const hide = message.loading('加载走势数据');
                    GetTrend(formDataTransform(transformedValues)).then((res) => {
                      hide();
                      if (res.code === 0) {
                        setTrendItems(res?.data || [],
                        );
                      } else {
                        message.error(res.message);
                      }
                    }).catch((err) => {
                      console.log('err', err);
                      message.error('走势数据数据加载失败');
                    });
                  }}
                >
                  <div>
                    <Form.Item
                      name='statistic_type'
                    >
                      <Radio.Group>
                        <Radio.Button value='total'>客户总数</Radio.Button>
                        <Radio.Button value='increase'>新增客户数</Radio.Button>
                        <Radio.Button value='decrease'>流失客户数</Radio.Button>
                        <Radio.Button value='net_increase'>净增客户数</Radio.Button>
                      </Radio.Group>
                    </Form.Item>
                  </div>

                  <div style={{display: 'flex'}}>
                    <div className={styles.formItemGroup}>
                      <Form.Item
                        name='date_range_type'
                        className={styles.formItem}
                      >
                        <Select
                          style={{width: 100}}
                        >
                          <Select.Option value='day'>今日</Select.Option>
                          <Select.Option value='week'>近一周</Select.Option>
                          <Select.Option value='month'>近一个月</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name='date_range'
                        label={'时段'}
                        className={styles.formItem}
                      >
                        <DatePicker.RangePicker/>
                      </Form.Item>

                      <Form.Item
                        name='ext_staff_ids'
                        label={'员工'}
                        style={{width: 300}}
                        className={styles.formItem}
                      >
                        <StaffTreeSelect options={allStaffs} maxTagCount={1}/>
                      </Form.Item>

                    </div>
                    <div>
                      <Button type='default' onClick={() => {
                        formRef.current?.resetFields();
                      }}>
                        重置
                      </Button>
                    </div>
                  </div>

                </Form>

                <Area {...chartConfig} className={styles.chartBox}/>
              </div>
            </ProCard>

            <ProCard.Group hidden={!showSidebar} colSpan={'300px'} style={{padding: '0 4px'}} ghost={true}
                           direction={'column'}>
              <ProCard title={<h4 style={{fontSize: 15}}>OpenSCRM开源私域流量管理系统</h4>} bordered={true}
                       bodyStyle={{paddingTop: 10}}>
                <Row gutter={2}>
                  <Col span={12}>
                    <img src={QrcodeImage} width={100} style={{marginBottom: 12}}/>
                  </Col>
                  <Col span={12}>
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
                      <Paragraph type={'secondary'}>
                        遇到任何问题，欢迎联系我们
                      </Paragraph>
                      <Paragraph type={'secondary'} style={{marginBottom: 0}}>
                        微信扫码立即进入交流社群
                      </Paragraph>
                    </div>
                  </Col>
                </Row>
              </ProCard>

              <ProCard title={'消息存档'} bordered={true} style={{marginTop: 8}} bodyStyle={{paddingTop: 12}}>
                <Row gutter={2}>
                  <Col span={12}>
                    <img width={100} src={ChatImage} onClick={() => {
                      history.push('/staff-admin/corp-risk-control/chat-session');
                    }}/>
                  </Col>
                  <Col span={12}>
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'end'}}>
                      <Paragraph type={'secondary'}>轻松了解员工和客户的沟通过程</Paragraph>
                      <Button type={'primary'} onClick={() => {
                        history.push('/staff-admin/corp-risk-control/chat-session');
                      }}>立即使用</Button>
                    </div>
                  </Col>
                </Row>
              </ProCard>

              <ProCard title={'入门指引'} bordered={true} style={{marginTop: 8}} bodyStyle={{paddingTop: 10}}>
                <div className={styles.guideContainer}>
                  <div className={styles.item}>
                    文档中心 <Button size={'small'} target={'_blank'} href={'https://github.com/openscrm/api-server/wiki'}
                                 type={'dashed'}>查看</Button>
                  </div>
                </div>
              </ProCard>

            </ProCard.Group>
          </ProCard.Group>

          <ProCard.Group ghost={true} gutter={8} style={{marginTop: 12}}>
            <ProCard title={'常用功能'} bordered={true} bodyStyle={{paddingTop: 6}}>
              <div className={styles.quickLinkContainer}>

                <a className={styles.item} onClick={() => {
                  history.push('/staff-admin/customer-growth/contact-way')
                }}>
                  <div className={styles.icon}>
                    {getIcon(<QrcodeOutlined style={{color: 'rgba(0,0,0,0.65)'}}/>)}
                  </div>
                  <div className={styles.textGroup}>
                    <p className={styles.title}>渠道活码</p>
                    <p className={styles.desc}>精准运营不同渠道来源的客户</p>
                  </div>
                </a>

                <a className={styles.item} onClick={() => {
                  history.push('/staff-admin/customer-conversion/customer-mass-msg')
                }}>
                  <div className={styles.icon}>
                    {getIcon('icon-fasong')}
                  </div>
                  <div className={styles.textGroup}>
                    <p className={styles.title}>客户群发</p>
                    <p className={styles.desc}>强大的定向群发，最小打扰，最优效果</p>
                  </div>
                </a>

                <a className={styles.item} onClick={() => {
                  history.push('/staff-admin/corp-risk-control/chat-session')
                }}>
                  <div className={styles.icon}>
                    {getIcon(<MessageOutlined style={{color: 'rgba(0,0,0,0.65)'}} />)}
                  </div>
                  <div className={styles.textGroup}>
                    <p className={styles.title}>消息存档</p>
                    <p className={styles.desc}>轻松了解员工和客户的沟通过程</p>
                  </div>
                </a>

                <a className={styles.item} onClick={() => {
                  history.push('/staff-admin/customer-management/customer-tag')
                }}>
                  <div className={styles.icon}>
                    {getIcon(<TagsOutlined style={{color: 'rgba(0,0,0,0.65)'}} />)}
                  </div>
                  <div className={styles.textGroup}>
                    <p className={styles.title}>客户标签</p>
                    <p className={styles.desc}>集中高效管理客户标签，支撑私域精准运营</p>
                  </div>
                </a>

              </div>
            </ProCard>

          </ProCard.Group>


        </ProCard>

      </RcResizeObserver>

    </>
  );
};

export default connect(({staffAdmin, global}: ConnectState) => ({
  currentStaffAdmin: staffAdmin.currentStaffAdmin,
  collapsed: global.collapsed,
}))(Welcome);
