import React, {useEffect, useState} from 'react';
import {useLoadMore} from '@umijs/hooks';
import type {FnParams} from '@umijs/hooks/es/useLoadMore';
import styles from './index.less'
import {DatePicker, Empty, Form, Image, Input, message, Row, Spin, Tabs, Typography} from 'antd'
import {
  QueryChatMessages,
  QueryChatSessions,
  QueryDepartmentList,
  QueryStaffsList,
  SearchMessages,
} from "@/pages/StaffAdmin/ChatSession/service";
import DepartmentTreeSelect from "@/pages/StaffAdmin/Components/Fields/DepartmentTreeSelect";
import type {DepartmentInterface} from "@/services/department";
import type {DepartmentOption} from "@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal";
import {useForm} from "antd/es/form/Form";
import type {NewMsg} from "@/pages/StaffAdmin/ChatSession/components/MessageView";
import MessageView, {msgTypeMap} from "@/pages/StaffAdmin/ChatSession/components/MessageView";
import SearchMsgView from "@/pages/StaffAdmin/ChatSession/components/SearchMsgView";
import moment from "moment";
import {PageContainer} from '@ant-design/pro-layout';
import externalSvg from '@/assets/external.svg'
import defaultImage from '@/assets/default-image.png'

const {TabPane} = Tabs;

const StaffSession: React.FC = (props: any) => {
    const [staffList, setStaffList] = useState<Staffs.Item[]>([])
    const [staffListLoading, setStaffListLoading] = useState(true)
    const [currentStaff, setCurrentStaff] = useState<Staffs.Item>({} as Staffs.Item) // 当前员工
    const [currentChatType, setCurrentChatType] = useState('external') // 客户 同事 群聊
    const [chatSessionsList, setChatSessionsList] = useState<ChatSessions.Item[]>([])  // 会话列表
    const [chatSessionsListLoading, setChatSessionsListLoading] = useState(true)
    const [currentChatSession, setCurrentChatSession] = useState<ChatSessions.Item>({} as ChatSessions.Item) // 当前会话
    const [allDepartments, setAllDepartments] = useState<DepartmentOption[]>([]);
    const [chatMessageList, setChatMessageList] = useState<NewMsg[]>([]) // 消息
    const [chatMessageListLoading, setChatMessageListLoading] = useState(true)
    const [showSearchMessageView, setShowSearchMessageView] = useState(false) // 显示搜索后的消息
    const [searchMessageList, setSearchMessageList] = useState<SearchMessage.Item[]>([])
    const [searchTime, setSearchTime] = useState(["", ""])
    const [queryDepartments, setQueryDepartments] = useState([])
    const [total, setTotal] = useState(0)
    const [msgSearchForm] = useForm()
    const [staffListForm] = useForm()

    const queryStaffsList = (departmentIds?: number[], staffName?: string) => {
      // enable_msg_arch  1-开启会话存档   ext_department_id   0-所有部门
      setStaffListLoading(true)
      setStaffList([])
      setCurrentStaff({} as Staffs.Item)
      setChatSessionsList([])
      setCurrentChatSession({} as ChatSessions.Item)
      setChatMessageList([])
      QueryStaffsList({
        page_size: 5000,
        enable_msg_arch: 1,
        ext_department_ids: departmentIds || 0,
        name: staffName
      }).then(res => {
        if (res?.code === 0) {
          setStaffList(res?.data?.items || [])
          setCurrentStaff(res?.data?.items?.[0] || {})
          setStaffListLoading(false)
          const queryStaff = res?.data?.items?.find((staff: Staffs.Item) => staff.ext_staff_id === props.location.query.staff)
          if (queryStaff) {
            setCurrentStaff(queryStaff)
          } else {
            setCurrentStaff(res?.data?.items?.[0])
          }
        } else {
          message.error('员工列表获取失败')
        }
      })
    }

    const queryChatSessions = (name?: string) => {
      setChatSessionsList([])
      setCurrentChatSession({} as ChatSessions.Item)
      setChatMessageList([])
      setChatSessionsListLoading(true)
      setChatMessageListLoading(true)
      QueryChatSessions({
        page_size: 5000,
        ext_staff_id: currentStaff?.ext_staff_id,
        session_type: currentChatType,
        name
      }).then(res => {
        if (res?.code === 0) {
          setChatSessionsList(res?.data?.items || [])
          setCurrentChatSession(res?.data?.items[0] || {})
          setChatSessionsListLoading(false)
        } else {
          message.error('会话列表获取失败')
        }
      })
    }

    const queryChatMessages = (pageSize?: number, page?: number) => {
      return QueryChatMessages({
        page_size: pageSize,
        page,
        ext_staff_id: currentStaff?.ext_staff_id || 'none',
        receiver_id: currentChatSession.peer_ext_id || 'none',
        sort_type: 'desc',
        sort_field: 'msg_time',
        send_at_start: searchTime?.[0],
        send_at_end: searchTime?.[1]
      }).then(res => {
        if (res?.code === 0) {
          const resDataItems = res?.data?.items;
          resDataItems?.reverse()
          const newMsgList = resDataItems?.concat([...chatMessageList]).filter((m: any) => m !== null) || []
          newMsgList?.map((msg: any) => {
            return {...msg, showTime: false}
          })
          for (let i = 0; i < newMsgList.length; i += 1) {
            if (Math.floor(Number(newMsgList[i]?.msgtime) / 10800 / 1000) !== Math.floor(Number(newMsgList[i + 1]?.msgtime) / 10800 / 1000)) {
              newMsgList[i].showTime = true
            }
          }
          setChatMessageList(newMsgList || [])
          setChatMessageListLoading(false)
          setTotal(res?.data?.total)
          return Promise.resolve({data: res?.data?.items || [], total: res?.data?.total})
        }
        message.error('聊天消息获取失败')
        return Promise.reject(res?.message)
      })
    }

    const getSearchMessages = (ext_staff_id: string, ext_peer_id: string, keyword: string) => {
      SearchMessages({ext_staff_id, ext_peer_id, keyword}).then(res => {
        if (res?.code === 0) {
          setSearchMessageList(res?.data?.items || [])
        } else {
          message.error(res.message)
        }
      })
    }

    const asyncFn = ({pageSize, page}: FnParams): Promise<{
      total: number;
      data: any[];
    }> => {
      return queryChatMessages(pageSize, page).then(res => {
        return Promise.resolve({
          total: res?.total,
          data: res?.data
        })
      })
    }

    const {loading, loadingMore, reload, loadMore, noMore} = useLoadMore<any, any>(
      asyncFn,
      {
        initPageSize: 20,
        incrementSize: 20,
      },
    );

    useEffect(() => {
      queryStaffsList()
    }, [])

    useEffect(() => {
      msgSearchForm.resetFields()
      setSearchMessageList([])
      setShowSearchMessageView(false)
      setSearchTime(["", ""])
    }, [currentStaff, currentChatType, currentChatSession])

    useEffect(() => {
      if (currentStaff?.ext_staff_id && currentChatType) {
        queryChatSessions()
      }
    }, [currentStaff, currentChatType])

    useEffect(() => {
      setChatMessageList([])
      setChatMessageListLoading(true)
      setTotal(0)
      setSearchMessageList([])
      setShowSearchMessageView(false)
    }, [currentChatSession, currentStaff])

    useEffect(() => {
      setCurrentChatType('external')
    }, [currentStaff])

    useEffect(() => {
      reload()
    }, [currentChatSession])

    useEffect(() => {
      QueryDepartmentList({page_size: 5000}).then((res) => {
        if (res.code === 0) {
          const departments =
            res?.data?.items?.map((item: DepartmentInterface) => {
              return {
                label: item.name,
                value: item.ext_id,
                ...item,
              };
            }) || [];
          setAllDepartments(departments);
        } else {
          message.error(res.message);
        }
      });
    }, []);

    const renderChatSessionList = (type: string) => {
      return <>
        <Input.Search
          placeholder={`请输入${type}名称`}
          style={{width: 214, margin: '0 0 10px 20px'}}
          onSearch={(value) => {
            queryChatSessions(value)
          }}
        />
        <div className={styles.chatSessionListBox}>
          <Spin spinning={chatSessionsListLoading} style={{marginTop: 80}}>
            {
              chatSessionsList.length > 0 &&
              chatSessionsList.map((chatSession) => {
                if (chatSession.peer_avatar !== '' && chatSession.peer_name !== '') {
                  return <div
                    className={currentChatSession?.id === chatSession?.id ? styles.currentChatSessionItem : styles.chatSessionItem}
                    key={chatSession?.id}
                    onClick={() => {
                      if (currentChatSession.id !== chatSession.id) {
                        setChatMessageListLoading(true)
                        setCurrentChatSession(chatSession)
                      }
                    }}
                  >
                    <img src={chatSession?.peer_avatar}/>
                    <div className={styles.sessionItemRight}>
                      <div className={styles.sessionItemRightTop}>
                        <div>
                          <span>{chatSession?.peer_name}</span>
                          {currentChatType === 'external' && <img src={externalSvg}/>}
                        </div>
                        <div>
                      <span style={{
                        color: 'rgba(0,0,0,.65)',
                        fontSize: '12px'
                      }}>{moment(chatSession.msgtime).format('M月D日')}</span>
                        </div>
                      </div>
                      <div className={styles.sessionItemRightBottom} style={{width: 120}}>
                        {
                          chatSession?.msgtype === 'text' ?
                            <span style={{width: 120}}>
                       {chatSession?.content_text?.length > 12 ? `${chatSession?.content_text.slice(0, 12)}...` : chatSession?.content_text}
                        </span>
                            :
                            <span>[{msgTypeMap[chatSession?.msgtype]}消息]</span>
                        }
                      </div>
                    </div>
                  </div>
                }
                return <></>
              })
            }
          </Spin>
          {
            !chatSessionsListLoading && chatSessionsList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
          }
        </div>
      </>
    }

    return (
      <>
        <PageContainer
          header={{
            title: '消息存档',
            subTitle: <Typography.Text>会话存档为独立服务，请单独部署 https://github.com/openscrm/msg-server</Typography.Text>
          }}
        />
        <div className={styles.staffSession}>
          {/* 员工列表 */}
          <div className={styles.staffListAside}>
            <div className={styles.operateHeader}>
              <p>员工&nbsp;({staffList?.length || 0})</p>
              <Form
                form={staffListForm}
              >
                <Form.Item name="departments">
                  <DepartmentTreeSelect
                    options={allDepartments}
                    onChange={(value) => {
                      setQueryDepartments(value)
                      queryStaffsList(value)
                    }}
                  />
                </Form.Item>
                <Form.Item name='staffName'>
                  <Input.Search placeholder={'请输入员工名称'} width={180} onSearch={(value) => {
                    queryStaffsList([...queryDepartments], value)
                  }}/>
                </Form.Item>
              </Form>
            </div>

            <div className={styles.staffs}>
              <Spin spinning={staffListLoading} style={{marginTop: 40}}>
                {
                  staffList.length > 0 &&
                  staffList?.map((staff: Staffs.Item) => {
                    return <div
                      className={currentStaff?.id === staff?.id ? styles.currentStaffItem : styles.staffItem}
                      key={staff?.id}
                      onClick={() => {
                        if (currentStaff !== staff) {
                          setCurrentStaff(staff)
                        }
                      }}
                    >
                      <Image src={staff?.avatar_url !== '' ? staff?.avatar_url : defaultImage} preview={false}
                             fallback={defaultImage}/>
                      <span>{staff?.name}</span>
                    </div>
                  })
                }
              </Spin>
              {
                !staffListLoading && staffList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
              }
            </div>
          </div>

          <div className={styles.article}>
            {
              staffList.length > 0 ? <>
                  {/* 会话列表 */}
                  <div className={styles.chatListBox}>
                    <div className={styles.avatar}>
                      <img src={currentStaff?.avatar_url}/>
                      <span>{currentStaff?.name}</span>
                    </div>
                    <div className={styles.tabs}>
                      <Tabs defaultActiveKey="1" onChange={(key) => {
                        setCurrentChatType(key)
                      }}>
                        <TabPane tab="客户" key="external" style={{height: 'calc(100% - 57px)'}}>
                          {renderChatSessionList('客户')}
                        </TabPane>
                        <TabPane tab="同事" key="internal">
                          {renderChatSessionList('同事')}
                        </TabPane>
                        <TabPane tab="群聊" key="room">
                          {renderChatSessionList('群聊')}
                        </TabPane>
                      </Tabs>
                    </div>
                  </div>
                  {/* 会话详情 */}
                  <div className={styles.messageBox}>
                    <div className={styles.messageHeader}>
                      <div className={styles.messageHeaderLeft}>
                          <span>
                            {currentChatSession?.peer_name || ''}
                          </span>
                        <span className={styles.wechatFlag}>
                            {currentChatSession?.peer_type === '1' ? '@微信' : ''}
                          </span>
                      </div>
                      <Form form={msgSearchForm} style={{display: "flex", alignItems: 'center'}}>
                        <Row>
                          <Form.Item name={'msgKeyWord'}
                                     style={{margin: '0 10px', display: chatMessageList.length === 0 ? 'none' : 'block'}}>
                            <Input.Search placeholder={'搜索消息'}
                                          disabled={searchTime[0].length > 0}
                                          onChange={(e) => {
                                            if (e.target.value.length !== 0) {
                                              getSearchMessages(currentStaff.ext_staff_id, currentChatSession.peer_ext_id, e.target.value)
                                              setShowSearchMessageView(true)
                                            } else {
                                              setSearchMessageList([])
                                              setShowSearchMessageView(false)
                                            }
                                          }}/>
                          </Form.Item>
                          <Form.Item name={'msgDate'}
                                     style={{margin: '0 10px', display: chatMessageList.length === 0 ? 'none' : 'block'}}>
                            <DatePicker.RangePicker style={{height: 31.333}}
                                                    disabled={msgSearchForm?.getFieldValue('msgKeyWord')?.length && showSearchMessageView}
                                                    disabledDate={(current) => current && current > moment().endOf('day')}
                                                    onChange={(value, time) => {
                                                      if (time?.length === 2) {
                                                        setSearchTime(time)
                                                        setChatMessageList([])
                                                        reload()
                                                      } else if (!time) {
                                                        setSearchTime(["", ""])
                                                        reload()
                                                      }
                                                    }}
                            />
                          </Form.Item>
                        </Row>
                      </Form>
                    </div>
                    <div className={styles.messageMainPart} id={'messageMainPart'}>
                      <Spin spinning={chatMessageListLoading}>
                        {
                          showSearchMessageView ?
                            <SearchMsgView searchMsgList={searchMessageList}
                                           setShowSearchMessageView={setShowSearchMessageView}
                                           currentChatSession={currentChatSession} currentStaff={currentStaff}
                                           total={total}/>
                            :
                            <MessageView chatMessageList={chatMessageList || []} currentStaff={currentStaff}
                                         loading={loading}
                                         loadingMore={loadingMore} loadMore={loadMore} noMore={noMore}
                                         chatMessageListLoading={chatMessageListLoading}
                                         chatSessionsListLoading={chatSessionsListLoading}
                                         currentChatSession={currentChatSession} total={total} isContextView={false}
                                         timeRange={searchTime}/>
                        }
                      </Spin>
                    </div>

                  </div>
                </>
                :
                <div className={styles.articleEmptyBox}>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                </div>
            }

          </div>

        </div>
      </>
    );
  }
;
export default StaffSession;
