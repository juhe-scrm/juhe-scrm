import React, {useEffect, useRef, useState} from 'react';
import {PageContainer} from '@ant-design/pro-layout';
import {history} from 'umi';
import {
  BookFilled,
  ClockCircleOutlined, ContactsFilled, EditFilled,
  EditOutlined,
  LeftOutlined,
  RightOutlined, SoundFilled,
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import {Button, Descriptions, Empty, Form, message, Space, Tag,} from 'antd';
import styles from "@/pages/StaffAdmin/Customer/index.less";
import type {ActionType, ProColumns} from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import moment from "moment";
import type {GroupChatItem} from "@/pages/StaffAdmin/GroupChat/data";
import type {FormInstance} from "antd/es/form";
import {ProTableRequestAdapter} from "@/utils/utils";
import {QueryCustomerGroupsList} from "@/pages/StaffAdmin/GroupChat/service";
import GroupChatIcon from "@/assets/group-chat.svg";
import type {CustomerItem} from "@/pages/StaffAdmin/Customer/data";
import {
  QueryInternalTags, GetCustomerDetail, QueryCustomerRemark,
  UpdateCustomerTags, UpdateBasicInfoAndRemark,
  QueryCustomerEvents, CustomerInternalTags, GetCustomerBasicInfoDisplay, GetBasicInfoAndRemarkValues
} from "@/pages/StaffAdmin/Customer/service";
import type {StaffItem} from "@/pages/StaffAdmin/Components/Columns/CollapsedStaffs";
import CollapsedStaffs from "@/pages/StaffAdmin/Components/Columns/CollapsedStaffs";
import {addWayEnums} from "@/pages/StaffAdmin/Customer/index";
import type {Dictionary} from "lodash";
import _ from "lodash";
import type {StaffOption} from "@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal";
import type {SimpleStaffInterface} from "@/services/staff";
import {QuerySimpleStaffs} from "@/services/staff";
import TableInput from "@/pages/StaffAdmin/Customer/Components/TableInput";
import type {CustomerTag, CustomerTagGroupItem} from '@/pages/StaffAdmin/CustomerTag/data';
import CustomerTagSelectionModal from "@/pages/StaffAdmin/Components/Modals/CustomerTagSelectionModal";
import {QueryCustomerTagGroups} from "@/services/customer_tag_group";
import InternalTagModal from "@/pages/StaffAdmin/Customer/Components/InternalTagModal";
import Events from './Components/Events'
import {CustomerEvents, InternalTags} from "@/pages/StaffAdmin/Customer/data";

export const basicInfo = {
  'age': '年龄',
  'description': '描述',
  'email': '邮箱',
  'phone_number': '电话',
  'qq': 'QQ',
  'address': '地址',
  'birthday': '生日',
  'weibo': '微博'
}
export type Remark = {
  'remark_id': string;
  'remark_type': string;
  'remark_value': string;
}

const columns: ProColumns<GroupChatItem>[] = [
  {
    title: '客户群名称',
    dataIndex: 'name',
    valueType: 'text',
    width: 280,
    render: (dom, item) => {
      return (
        <Space>
          <img className={'icon'} src={GroupChatIcon}/>
          <span className={styles.text}>{item.name}</span>
        </Space>
      );
    },
  },
  {
    title: '群主',
    dataIndex: 'owner',
    valueType: 'select',
    // hideInForm: true,
    render: (dom, item) => {
      return (
        <Space>
          <div className={styles.staffTag}>
            <img
              src={item.owner_avatar_url}
              className={styles.icon}
              alt={item.owner}
            />
            <span className={styles.text}>{item.owner}</span>
          </div>
        </Space>
      );
    },
  },


  {
    title: '群聊状态',
    dataIndex: 'status',
    valueType: 'select',
    valueEnum: {
      0: '未解散',
      1: '已解散',
    },
  },

  {
    title: '群人数',
    dataIndex: 'total',
    valueType: 'digit',
    render: (dom, item) => {
      return <span>{item.total}</span>;
    },
  },


  {
    title: '创群时间',
    dataIndex: 'create_time',
    valueType: 'dateRange',
    render: (dom, item) => {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: moment(item.create_time).format('YYYY-MM-DD HH:mm').split(' ').join('<br/>'),
          }}
        />
      );
    },
  },

];

const CustomerDetail: React.FC = () => {
  const queryFormRef = useRef<FormInstance>();
  const actionRef = useRef<ActionType>();
  const [customerDetail, setCustomerDetail] = useState<CustomerItem>()
  const [staffMap, setStaffMap] = useState<Dictionary<StaffOption>>({});
  const [allCustomerTagGroups, setAllCustomerTagGroups] = useState<CustomerTagGroupItem[]>([]);
  const [defaultCustomerTags, setDefaultCustomerTags] = useState<CustomerTag[]>([]);
  const [defaultInternalTagsIds, setDefaultInternalTagsIds] = useState<string []>([])
  const [personalTagModalVisible, setPersonalTagModalVisible] = useState(false)
  const [customerTagModalVisible, setCustomerTagModalVisible] = useState(false)
  const [internalTagList, setInternalTagList] = useState<InternalTags.Item[]>([])
  const [internalTagListMap, setInternalTagListMap] = useState<Dictionary<InternalTags.Item>>({});
  const [initialEvents, setInitialEvents] = useState<CustomerEvents.Item[]>([])
  const [currentTab, setCurrentTab] = useState('survey')
  const [basicInfoDisplay, setBasicInfoDisplay] = useState({} as any)// 展示哪些基本信息
  const [basicInfoValues, setBasicInfoValues] = useState({} as any) // 基本信息取值
  const [remarkValues, setRemarkValues] = useState<Remark[]>([])
  const [reloadCusDataTimesTamp, setReloadCusDataTimesTamp] = useState(Date.now)
  const [formRef] = Form.useForm()

  const params = new URLSearchParams(window.location.search);
  const currentStaff = localStorage.getItem('extStaffAdminID') as string
  const extCustomerID = params.get('ext_customer_id') || "";
  if (!extCustomerID) {
    message.error('传入参数请带上ID');
  }

  const extStaff = () => {
    const staffs: StaffItem[] = [];
    customerDetail?.staff_relations?.forEach((staff_relation) => {
      // @ts-ignore
      const staff = staffMap[staff_relation.ext_staff_id];
      if (staff) {
        staffs.push(staff);
      }
    });
    return staffs;
  }

  const getCustomerDetail = () => {
    const hide = message.loading("加载数据中");
    GetCustomerDetail(extCustomerID).then(res => {
      hide();
      if (res?.code !== 0) {
        message.error("获取客户详情失败");
        return;
      }
      setCustomerDetail(res?.data);
      const cusTags: any[] = [];
      const interTagsIds: any[] = []
      res?.data?.staff_relations?.forEach((relation: any) => {
        if (relation.ext_staff_id === currentStaff) {
          relation.customer_staff_tags?.forEach((tag: any) => {
            cusTags.push({...tag, name: tag.tag_name, ext_id: tag.ext_tag_id});
          });
          relation.internal_tags?.forEach((tagId: string) => {
            interTagsIds.push(tagId);
          })
        }

      });
      setDefaultCustomerTags(cusTags)
      setDefaultInternalTagsIds(interTagsIds)
    }).catch(() => {
      hide();
    })
  }

  const getInternalTags = () => {
    QueryInternalTags({page_size: 5000, ext_staff_id: currentStaff}).then(res => {
      if (res?.code === 0) {
        setInternalTagList(res?.data?.items)
        setInternalTagListMap(_.keyBy(res?.data?.items, 'id'))
      } else {
        message.error(res?.message)
      }
    })
  }

  const getCustomerRemark = () => { // 自定义信息id-key
    QueryCustomerRemark().then(res => {
      if (res?.code === 0) {
        console.log('QueryCustomerRemark', res.data)
      } else {
        message.error(res?.message)
      }
    })
  }

  const getBasicInfoDisplay = () => {
    GetCustomerBasicInfoDisplay().then(res => {
      if (res?.code === 0) {
        const displayData = res?.data
        delete displayData.id
        delete displayData.ext_corp_id
        delete displayData.created_at
        delete displayData.updated_at
        delete displayData.deleted_at
        setBasicInfoDisplay(displayData || {})
      } else {
        message.error(res?.message)
      }
    })
  }

  const getBasicInfoAndRemarkValues = () => {
    GetBasicInfoAndRemarkValues({
      ext_customer_id: extCustomerID,
      ext_staff_id: currentStaff,
    }).then(res => {
      if (res?.code === 0) {
        const resData = res?.data
        delete resData.id
        delete resData.ext_corp_id
        delete resData.ext_creator_id
        delete resData.ext_customer_id
        delete resData.ext_staff_id
        delete resData.created_at
        delete resData.updated_at
        delete resData.deleted_at
        delete resData.remark_values
        setBasicInfoValues(resData)
        setRemarkValues(res?.data?.remark_values || [])
      }
    })
  }

  const updateBasicInfoAndRemark = (basicInfoParams: any) => {
    UpdateBasicInfoAndRemark({
      ext_staff_id: currentStaff,
      ext_customer_id: extCustomerID,
      ...basicInfoParams
    }).then(res => {
      if (res?.code === 0) {
        message.success('客户信息更新成功')
        setReloadCusDataTimesTamp(Date.now)
      } else {
        message.error('客户信息更新失败')
      }
    })
  }

  useEffect(() => {
    getInternalTags()
    getCustomerDetail()
    getCustomerRemark()
    getBasicInfoDisplay()
    getBasicInfoAndRemarkValues()
  }, [reloadCusDataTimesTamp])

  useEffect(() => {
    QueryCustomerTagGroups({page_size: 5000}).then((res) => {
      if (res.code === 0) {
        setAllCustomerTagGroups(res?.data?.items);
      } else {
        message.error(res.message);
      }
    });
  }, []);

  useEffect(() => {
    QuerySimpleStaffs({page_size: 5000}).then((res) => {
      if (res.code === 0) {
        const staffs = res?.data?.items?.map((item: SimpleStaffInterface) => {
          return {
            label: item.name,
            value: item.ext_id,
            ...item,
          };
        }) || [];
        setStaffMap(_.keyBy<StaffOption>(staffs, 'ext_id'));
      } else {
        message.error(res.message);
      }
    });
  }, []);

  useEffect(() => {
    QueryCustomerEvents({
      ext_customer_id: extCustomerID,
      ext_staff_id: currentStaff,
      page_size: 5
    }).then(res => {
      console.log('QueryCustomerEventsQueryCustomerEvents', res)
      setInitialEvents(res?.data?.items || [])
    })
  }, [])

  useEffect(() => {
    formRef.setFieldsValue(basicInfoValues)
  }, [basicInfoValues])

  return (
    <PageContainer
      fixedHeader
      onBack={() => history.go(-1)}
      backIcon={<LeftOutlined/>}
      header={{
        title: '客户详情',
      }}
    >
      <ProCard>
        <Descriptions title="客户信息" column={1}>
          <Descriptions.Item>
            <div className={'customer-info-field'}>
              <div><img src={customerDetail?.avatar} alt={customerDetail?.name} style={{borderRadius: 5}}/></div>
              <div style={{fontSize: 16, marginLeft: 10}}>
                <p>{customerDetail?.name}</p>
                {customerDetail?.corp_name && (
                  <p style={{color: '#eda150', marginTop: 10}}>@{customerDetail?.corp_name}</p>
                )}
                {customerDetail?.type === 1 && (
                  <p style={{
                    color: '#5ec75d',
                    fontSize: '13px'
                  }}>@微信</p>
                )}
              </div>
            </div>
          </Descriptions.Item>
          <div>
            <div style={{width: 70, display: 'inline-block'}}>企业标签：</div>
            <div className={styles.tagContainer}>
              <Space direction={'horizontal'} wrap={true}>
                {
                  defaultCustomerTags?.length > 0 && defaultCustomerTags?.map((tag) =>
                    <Tag
                      key={tag?.id}
                      className={'tag-item selected-tag-item'}
                    >
                      {tag?.name}
                    </Tag>
                  )}
              </Space>
            </div>
            <Button
              key='addCusTags'
              icon={<EditOutlined/>}
              type={'link'}
              onClick={() => {
                setCustomerTagModalVisible(true);
              }}
            >
              编辑
            </Button>
          </div>

          <div>
            <div style={{width: 70, display: 'inline-block'}}>个人标签：</div>
            <div className={styles.tagContainer}>
              <Space direction={'horizontal'} wrap={true}>
                {
                  defaultInternalTagsIds?.length > 0 && defaultInternalTagsIds.map(id => internalTagListMap[id])?.map((tag) =>
                    <Tag
                      key={tag?.id}
                      className={'tag-item selected-tag-item'}
                    >
                      {tag?.name}
                      <span>
                     </span>
                    </Tag>
                  )}
              </Space>
            </div>
            <Button
              key='addInternalTags'
              icon={<EditOutlined/>}
              type={'link'}
              onClick={() => {
                setPersonalTagModalVisible(true);
              }}
            >
              编辑
            </Button>
          </div>
        </Descriptions>
      </ProCard>

      <ProCard
        tabs={{
          onChange: (activeKey: string) => setCurrentTab(activeKey),
          activeKey: currentTab
        }}
        style={{marginTop: 25}}
      >
        <ProCard.TabPane key="survey" tab="客户概况">
          <div className={styles.survey}>
            <div className={styles.cusSurveyLeft}>
              <div>
                <Descriptions title={<div><ContactsFilled/>&nbsp;&nbsp;添加客服信息</div>} layout="vertical" bordered
                              column={4}>
                  <Descriptions.Item label="所属员工">
                    <CollapsedStaffs limit={2} staffs={extStaff()}/>
                  </Descriptions.Item>

                  <Descriptions.Item label="客户来源">
                       <span>
                         {customerDetail?.staff_relations?.map((para) => {
                           return (`${addWayEnums[para.add_way || 0]}\n`);
                         })}
                       </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="添加时间">
                    <Space>
                      {customerDetail?.staff_relations?.map((para) => {
                        return (
                          <div className={styles.staffTag}
                               dangerouslySetInnerHTML={{
                                 __html: moment(para.createtime)
                                   .format('YYYY-MM-DD HH:mm')
                                   .split(' ')
                                   .join('<br />'),
                               }}
                          />
                        );
                      })}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="更新时间">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: moment(customerDetail?.updated_at)
                          .format('YYYY-MM-DD HH:mm')
                          .split(' ')
                          .join('<br />'),
                      }}
                    />
                  </Descriptions.Item>
                </Descriptions>
              </div>
              <Form form={formRef} onFinish={(values) => {
                console.log('ooooooooooooooovaluesvalues', values)
                const basicInfoParams = {...values}
                updateBasicInfoAndRemark(basicInfoParams)
              }}>
                <div style={{paddingTop: 20}} className={styles.baseInfoContainer}>
                  <Descriptions
                    title={<div><BookFilled/>&nbsp;&nbsp;基本信息</div>}
                    bordered
                    column={2}
                    size={'small'}
                  >
                    {
                      Object.keys(basicInfoDisplay).map(key => {
                        return <Descriptions.Item label={basicInfo[key]}>
                          <TableInput name={key} />
                        </Descriptions.Item>
                      })
                    }
                  </Descriptions>
                </div>
                {
                  remarkValues.length > 0 && <div style={{paddingTop: 20}} className={styles.customInfoContainer}>
                    <Descriptions
                      title={<div><EditFilled/>&nbsp;&nbsp;自定义信息</div>}
                      bordered
                      column={2}
                      size={'small'}
                    >
                      <Descriptions.Item label="sfdsf">
                        <TableInput name={'aa'}/>
                      </Descriptions.Item>
                      <Descriptions.Item label="违法的">
                        <TableInput name={'bb'}/>
                      </Descriptions.Item>
                      <Descriptions.Item label="sdf434">
                        <TableInput name={'cc'}/>
                      </Descriptions.Item>
                      <Descriptions.Item label="yjkyujy">
                        <TableInput name={'dd'}/>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                }
                <div style={{display: 'flex', justifyContent: 'center', marginTop: 40}}>
                  <Space>
                    <Button onClick={() => formRef.setFieldsValue(basicInfoValues)}>重置</Button>
                    <Button type={"primary"} onClick={() => {
                      formRef.submit()
                    }}>提交</Button>
                  </Space>
                </div>
              </Form>
            </div>

            <div className={styles.cusSurveyRight}>
              <div className={styles.eventsTitle}>
                <span className={styles.titleText}><SoundFilled/>&nbsp;&nbsp;客户动态</span>
                <a onClick={() => setCurrentTab('events')} style={{fontSize: 12}}>查看更多<RightOutlined/></a>
              </div>
              <Events data={initialEvents.filter(elem => elem !== null)} simpleRender={true} staffMap={staffMap}
                      extCustomerID={extCustomerID}/>
            </div>
          </div>

        </ProCard.TabPane>

        <ProCard.TabPane key="events" tab="客户动态">
          <Events staffMap={staffMap} extCustomerID={extCustomerID}/>
        </ProCard.TabPane>

        <ProCard.TabPane key="room" tab="所在群聊">
          <ProTable<GroupChatItem>
            search={false}
            formRef={queryFormRef}
            actionRef={actionRef}
            className={'table'}
            scroll={{x: 'max-content'}}
            columns={columns}
            rowKey="id"
            toolBarRender={false}
            bordered={false}
            tableAlertRender={false}
            dateFormatter="string"
            request={async (originParams: any, sort, filter) => {
              return ProTableRequestAdapter(
                originParams,
                sort,
                filter,
                QueryCustomerGroupsList,
              );
            }}
          />
        </ProCard.TabPane>

        <ProCard.TabPane key="chat" tab="聊天记录">
          {
            setStaffMap[currentStaff]?.enable_msg_arch === 1 ? <Button
                key={'chatSession'}
                type={"link"}
                icon={<ClockCircleOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
                onClick={() => {
                  window.open(`/staff-admin/corp-risk-control/chat-session?staff=${currentStaff}`)
                }}
              >
                聊天记录查询
              </Button>
              :
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>员工暂未开启消息存档</span>}/>
          }
        </ProCard.TabPane>

      </ProCard>

      <CustomerTagSelectionModal
        type={'customerDetailEnterpriseTag'}
        isEditable={true}
        withLogicalCondition={false}
        width={'630px'}
        visible={customerTagModalVisible}
        setVisible={setCustomerTagModalVisible}
        defaultCheckedTags={defaultCustomerTags}
        onFinish={(selectedTags) => {
          const removeAry = _.difference(defaultCustomerTags.map(dt => dt.ext_id), selectedTags.map(st => st.ext_id))
          UpdateCustomerTags({
            // @ts-ignore
            add_ext_tag_ids: selectedTags.map((tag) => tag.ext_id),
            ext_customer_ids: [extCustomerID],
            ext_staff_id: currentStaff,
            // @ts-ignore
            remove_ext_tag_ids: removeAry
          }).then(() => {
            getCustomerDetail()
          })
        }}
        allTagGroups={allCustomerTagGroups}
      />

      <InternalTagModal
        width={560}
        allTags={internalTagList}
        allTagsMap={internalTagListMap}
        setAllTags={setInternalTagList}
        visible={personalTagModalVisible}
        setVisible={setPersonalTagModalVisible}
        defaultCheckedTagsIds={defaultInternalTagsIds}
        reloadTags={getInternalTags}
        onFinish={(selectedTags) => {
          console.log('selectedTags', selectedTags)
          const removeAry = _.difference(defaultInternalTagsIds, selectedTags.map(st => st.id))
          CustomerInternalTags({
            // @ts-ignore
            add_ext_tag_ids: selectedTags.map((tag) => tag.id),
            ext_customer_id: extCustomerID,
            ext_staff_id: currentStaff,
            // @ts-ignore
            remove_ext_tag_ids: removeAry
          }).then(() => {
            getCustomerDetail()
          })
        }
        }
      />
    </PageContainer>
  );
};

export default CustomerDetail;
