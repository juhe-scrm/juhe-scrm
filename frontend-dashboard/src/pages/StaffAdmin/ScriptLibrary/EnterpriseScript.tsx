import type {DepartmentOption} from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';
import DepartmentTreeSelect from '@/pages/StaffAdmin/Components/Fields/DepartmentTreeSelect';
import type {DepartmentInterface} from '@/services/department';
import {HandleRequest, ProTableRequestAdapter} from '@/utils/utils';
import {
  DeleteOutlined,
  FolderFilled,
  QuestionCircleOutlined,
  MoreOutlined,
  PlusSquareFilled,
} from '@ant-design/icons';
import type {ActionType} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type {ProColumns} from '@ant-design/pro-table/es';
import {Button, Divider, Dropdown, Menu, Modal, Space, Tooltip} from 'antd';
import {message} from 'antd/es';
import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import GroupModal from './GroupModal';
import styles from './index.less';
import {
  CreateEnterpriseScriptGroups,
  CreateEnterpriseScriptList,
  DeleteEnterpriseScriptGroups,
  DeleteEnterpriseScriptList,
  QueryDepartmentList,
  QueryEnterpriseScriptGroups,
  QueryEnterpriseScriptList,
  UpdateEnterpriseScriptGroups,
  UpdateEnterpriseScriptList
} from './service';
import ScriptModal, {typeEnums} from "@/pages/StaffAdmin/ScriptLibrary/ScriptModal";
import type {Dictionary} from 'lodash';
import _ from 'lodash';
import ScriptContentPreView from "@/pages/StaffAdmin/ScriptLibrary/components/ScriptContentPreView";
import type {FrontEndReplyDetailParams} from './ScriptModal'
import {FooterToolbar} from "@ant-design/pro-layout";
import moment from "moment";

const EnterpriseScript: (props: any, ref: any) => JSX.Element = (props, ref) => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef({} as any);
  const [keyWord, setKeyWord] = useState('')
  const [groupId, setGroupId] = useState('')
  const [department_id, setDepartmentId] = useState<number[]>([])
  const [allDepartments, setAllDepartments] = useState<DepartmentOption[]>([]);
  const [allDepartmentMap, setAllDepartmentMap] = useState<Dictionary<DepartmentOption>>({});
  const [targetScriptGroup, setTargetScriptGroup] = useState<Partial<ScriptGroup.Item>>({})
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const groupModalRef = useRef<any>({});
  const scriptModalRef = useRef<any>({});
  const [groupItemsTimestamp, setGroupItemsTimestamp] = useState(Date.now);
  const [scriptModalVisible, setScriptModalVisible] = useState(false);
  const [targetScript, setTargetScript] = useState<Partial<ScriptGroup.Item>>({})
  const [groupItems, setGroupItems] = useState<Partial<ScriptGroup.Item>[]>([]);
  const [allGroupMap, setAllGroupMap] = useState<Dictionary<ScriptGroup.Item>>({});
  const [selectedItems, setSelectedItems] = useState<Script.Item[]>([]);

  useImperativeHandle(ref, () => {
    return {
      createEnterpriseScript: () => {
        setTargetScript({})
        scriptModalRef.current.open({reply_details: [{content_type: 2}]})
      },
    }
  })
  useEffect(() => {
    QueryEnterpriseScriptGroups({page_size: 5000}).then(res => {
      if (res?.code === 0) {
        setGroupItems(res?.data?.items || [])
        setAllGroupMap(_.keyBy<ScriptGroup.Item>(res?.data?.items || [], 'id'));
      }
    }).catch((err) => {
      message.error(err);
    });
  }, [groupItemsTimestamp])

  useEffect(() => {
    QueryDepartmentList({page_size: 5000}).then((res) => {
      if (res?.code === 0) {
        const departments =
          res?.data?.items?.map((item: DepartmentInterface) => {
            return {
              label: item?.name,
              value: item?.ext_id,
              ...item,
            };
          }) || [];
        setAllDepartments(departments);
        setAllDepartmentMap(_.keyBy<DepartmentOption>(departments, 'ext_id'));
      } else {
        message.error(res.message);
      }
    });
  }, []);

  // 后端数据转为前端组件FormItem -- name
  const transferParams = (paramsFromBackEnd: any) => {
    const newReplyDetails = []
    for (let i = 0; i < paramsFromBackEnd.reply_details.length; i += 1) {
      const typeObjectKey = typeEnums[paramsFromBackEnd.reply_details[i].content_type]
      const replyDetailItem: FrontEndReplyDetailParams = {
        content_type: paramsFromBackEnd.reply_details[i].content_type, id: paramsFromBackEnd.reply_details[i].id
      }
      const quickReplyContent = paramsFromBackEnd.reply_details[i].quick_reply_content
      if (typeObjectKey === 'text') {
        replyDetailItem.text_content = quickReplyContent.text.content
      }
      if (typeObjectKey === 'image') {
        replyDetailItem.image_title = quickReplyContent.image.title
        replyDetailItem.image_size = quickReplyContent.image.size
        replyDetailItem.image_picurl = quickReplyContent.image.picurl
      }
      if (typeObjectKey === 'link') {
        replyDetailItem.link_title = quickReplyContent.link.title
        replyDetailItem.link_desc = quickReplyContent.link.desc
        replyDetailItem.link_picurl = quickReplyContent.link.picurl
        replyDetailItem.link_url = quickReplyContent.link.url
      }
      if (typeObjectKey === 'pdf') {
        replyDetailItem.pdf_title = quickReplyContent.pdf.title
        replyDetailItem.pdf_size = quickReplyContent.pdf.size
        replyDetailItem.pdf_fileurl = quickReplyContent.pdf.fileurl
      }
      if (typeObjectKey === 'video') {
        replyDetailItem.video_title = quickReplyContent.video.title
        replyDetailItem.video_size = quickReplyContent.video.size
        replyDetailItem.video_picurl = quickReplyContent.video.picurl
      }
      newReplyDetails.push(replyDetailItem)
    }
    return {...paramsFromBackEnd, reply_details: newReplyDetails}
  }


  const columns: ProColumns<Script.Item>[] = [
    {
      title: '话术内容',
      dataIndex: 'keyword',
      width: '18%',
      hideInSearch: false,
      render: (dom: any, item: any) => {
        return (
          <ScriptContentPreView script={item}/>
        )
      },
    },
    {
      title: '标题',
      dataIndex: 'name',
      key:'name',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '发送次数',
      dataIndex: 'send_count',
      key: 'name',
      valueType: 'digit',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '所属分组',
      width: '14%',
      dataIndex: 'group_id',
      key: 'group_id',
      valueType: 'text',
      hideInSearch: true,
      render: (dom: any) => {
        return (
          <span>{allGroupMap[dom]?.name || '-'}</span>
        )
      },
    },
    {
      title: '创建人',
      dataIndex: 'staff_name',
      key: 'staff_name',
      hideInSearch: true,
      render: (dom, item) => (
        <div className={'tag-like-staff-item'}>
          <img className={'icon'} src={item.avatar}/>
          <span className={'text'}>{dom}</span>
        </div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
      render: (dom, item) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: moment(item.created_at)
                .format('YYYY-MM-DD HH:mm')
                .split(' ')
                .join('<br />'),
            }}
          />
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'quick_reply_type',
      key: 'quick_reply_type',
      valueType: 'text',
      hideInSearch: true,
      render: (dom: any) => {
        return <span>{typeEnums[dom]}</span>
      }
    },
    {
      title: '可用部门',
      dataIndex: 'department_id',
      key: 'department_id',
      valueType: 'text',
      hideInSearch: false,
      hideInTable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      renderFormItem: (schema, config, form) => {
        return (
          <DepartmentTreeSelect
            options={allDepartments}
          />
        )
      },
    },
    {
      title: '操作',
      valueType: 'text',
      width: '10%',
      hideInSearch: true,
      render: (dom) => {
        return (
          <Space>
            <Button
              type={'link'}
              onClick={() => {
                // @ts-ignore
                const target = transferParams(dom)
                setTargetScript(target)
                // @ts-ignore
                scriptModalRef.current.open(target)
              }}
            >修改</Button>
            <Button
              type={'link'}
              onClick={() => {
                Modal.confirm({
                  title: `删除话术`,
                  // @ts-ignore
                  content: `是否确认删除「${dom?.name}」话术？`,
                  okText: '删除',
                  okType: 'danger',
                  cancelText: '取消',
                  onOk() {
                    // @ts-ignore
                    return HandleRequest({ids: [dom?.id]}, DeleteEnterpriseScriptList, () => {
                      actionRef?.current?.reload()
                    })
                  },
                });
              }}
            >
              删除
            </Button>
          </Space>
        )
      }
    },
  ]
  const getUseableDepartment = (departments: number[]) => {
    return departments.map((id) => {
      return <span key={id}>
           {id === 0 ? '全部员工可见' : allDepartmentMap[id]?.label} &nbsp;
        </span>
    })
  }

  return (
    <>
      <ProTable
        onSubmit={() => {
          setKeyWord(formRef.current.getFieldValue('keyword'))
          setDepartmentId(formRef.current.getFieldValue('department_id'))
        }}
        onReset={() => {
          setKeyWord(formRef?.current?.getFieldValue('keyword'))
          setDepartmentId(formRef?.current?.getFieldValue('department_id'))
        }}
        actionRef={actionRef}
        formRef={formRef}
        className={'table'}
        scroll={{x: 'max-content'}}
        columns={columns}
        rowKey={(scriptItem) => scriptItem.id}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          pageSize: 5,
        }}
        toolBarRender={false}
        bordered={false}
        tableAlertRender={false}
        rowSelection={{
          onChange: (__, items) => {
            setSelectedItems(items);
          },
        }}
        tableRender={(block, dom) => (
          <div className={styles.mixedTable}>
            <div className={styles.leftPart}>
              <div className={styles.header}>
                <Button
                  key="1"
                  className={styles.button}
                  type="text"
                  onClick={() => {
                    setTargetScriptGroup({})
                    groupModalRef.current.open({})
                  }}
                  icon={<PlusSquareFilled style={{color: 'rgb(154,173,193)', fontSize: 15}}/>}
                >
                  新建分组
                </Button>
              </div>
              <Menu
                onSelect={(e) => {
                  setGroupId(e.key as string)
                }}
                defaultSelectedKeys={['']}
                mode="inline"
                className={styles.menuList}
              >
                <Menu.Item
                  icon={<FolderFilled style={{fontSize: '16px', color: '#138af8'}}/>}
                  onClick={() => setTargetScriptGroup({})}
                  key=""
                >
                  全部
                </Menu.Item>
                {groupItems.map((item) => (
                  <Menu.Item
                    icon={<FolderFilled style={{fontSize: '16px', color: '#138af8'}}/>}
                    key={item.id}
                    onClick={() => {
                      setTargetScriptGroup(item)
                    }}
                  >
                    {item.name}
                    <Dropdown
                      className={'more-actions'}
                      overlay={
                        <Menu
                          onClick={(e) => {
                            e.domEvent.preventDefault();
                            e.domEvent.stopPropagation();
                          }}
                        >
                          <Menu.Item
                            onClick={() => {
                              setTargetScriptGroup(item)
                              groupModalRef.current.open(item)
                            }}
                            key="edit"
                          >
                            <a type={'link'}>修改分组</a>

                          </Menu.Item>
                          <Menu.Item
                            key="delete"
                          >
                            <a
                              type={'link'}
                              onClick={() => {
                                Modal.confirm({
                                  title: `删除分组`,
                                  // @ts-ignore
                                  content: `是否确认删除「${item?.name}」分组？`,
                                  okText: '删除',
                                  okType: 'danger',
                                  cancelText: '取消',
                                  onOk() {
                                    // @ts-ignore
                                    return HandleRequest({ids: [item.id]}, DeleteEnterpriseScriptGroups, () => {
                                      setGroupItemsTimestamp(Date.now)
                                    })
                                  },
                                });
                              }}
                            >
                              删除分组
                            </a>
                          </Menu.Item>
                        </Menu>
                      }
                      trigger={['hover']}
                    >
                      <MoreOutlined style={{color: '#9b9b9b', fontSize: 18}}/>
                    </Dropdown>

                  </Menu.Item>
                ))}

              </Menu>
            </div>
            <div className={styles.rightPart}>
              {
                targetScriptGroup?.id
                &&
                <div className={styles.aboveTableWrap}>
                  可见范围&nbsp;<Tooltip title={'范围内的员工可在企业微信【侧边栏】使用话术'}><QuestionCircleOutlined /></Tooltip>：
                  {allGroupMap[targetScriptGroup.id]?.departments ? getUseableDepartment(allGroupMap[targetScriptGroup.id]?.departments) : '全部员工可见'}
                  &nbsp;&nbsp;&nbsp;
                  <a onClick={() => groupModalRef.current.open(allGroupMap[targetScriptGroup!.id!])}>修改</a>
                </div>
              }
              <div className={styles.tableWrap}>{dom}</div>
            </div>
          </div>
        )}
        params={{
          group_id: groupId || '',
          department_ids: department_id || [],
          keyword: keyWord || ''
        }}
        request={async (params, sort, filter) => {
          return ProTableRequestAdapter(params, sort, filter, QueryEnterpriseScriptList);
        }}
        dateFormatter="string"
      />

      {selectedItems?.length > 0 && (
        // 底部选中条目菜单栏
        <FooterToolbar>
          <span>
            已选择 <a style={{fontWeight: 600}}>{selectedItems.length}</a> 项 &nbsp;&nbsp;
          </span>
          <Divider type='vertical'/>
          <Button
            type='link'
            onClick={() => {
              actionRef.current?.clearSelected?.();
            }}
          >
            取消选择
          </Button>
          <Button
            icon={<DeleteOutlined/>}
            onClick={async () => {
              Modal.confirm({
                title: `删除渠道码`,
                content: `是否批量删除所选「${selectedItems.length}」个渠道码？`,
                okText: '删除',
                okType: 'danger',
                cancelText: '取消',
                onOk() {
                  return HandleRequest(
                    {ids: selectedItems.map((item) => item.id)},
                    DeleteEnterpriseScriptList,
                    () => {
                      actionRef.current?.clearSelected?.();
                      actionRef.current?.reload?.();
                    },
                  );
                },
              });
            }}
            danger={true}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      {/* 新增&修改分组 */}
      <GroupModal
        initialValues={targetScriptGroup}
        allDepartments={allDepartments}
        ref={groupModalRef}
        visible={groupModalVisible}
        setVisible={setGroupModalVisible}
        onFinish={async (values, action) => {
          if (action === 'create') {
            await HandleRequest({...values, sub_groups: []}, CreateEnterpriseScriptGroups, () => {
              setGroupItemsTimestamp(Date.now)
              groupModalRef.current.close()
            })
          } else {
            await HandleRequest({...values, sub_groups: []}, UpdateEnterpriseScriptGroups, () => {
              setGroupItemsTimestamp(Date.now)
              groupModalRef.current.close()
            })
          }
        }}
      />
      {/* 新增&修改话术 */}
      <ScriptModal
        allDepartments={allDepartments}
        initialValues={targetScript}
        ref={scriptModalRef}
        visible={scriptModalVisible}
        setVisible={setScriptModalVisible}
        setPropsGroupsTimestamp={setGroupItemsTimestamp}
        onCancel={() => {
          setGroupItemsTimestamp(Date.now)
        }}
        onFinish={async (values, action) => {
          if (action === 'create') {
            await HandleRequest({...values}, CreateEnterpriseScriptList, () => {
              setGroupItemsTimestamp(Date.now)
              actionRef?.current?.reload()
              scriptModalRef.current.close()
            })
          } else {
            const {reply_details, id, group_id, name, deleted_ids} = values
            await HandleRequest({reply_details, id, group_id, name, deleted_ids}, UpdateEnterpriseScriptList, () => {
              setGroupItemsTimestamp(Date.now)
              actionRef?.current?.reload()
              scriptModalRef.current.close()
            })
          }
        }}
      />
    </>
  )
}
export default React.forwardRef(EnterpriseScript)

