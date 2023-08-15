import React, {useEffect, useRef, useState} from 'react';
import {FooterToolbar, PageContainer} from '@ant-design/pro-layout';
import {Button, Col, Divider, Dropdown, Menu, Modal, Row, Tag} from 'antd';
import type {ActionType} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type {ProColumns} from '@ant-design/pro-table/es';
import {ModalForm, ProFormSelect} from '@ant-design/pro-form';
import {ProFormText} from '@ant-design/pro-form/es';
import {
  CaretDownOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  FolderFilled,
  MoreOutlined,
  PlusOutlined,
  PlusSquareFilled,
} from '@ant-design/icons';
import {
  BatchUpdate,
  CreateGroup,
  Delete,
  DeleteGroup,
  Query,
  QueryGroup,
  UpdateGroup,
} from '@/pages/StaffAdmin/ContactWay/service';
import {HandleRequest, ProTableRequestAdapter} from '@/utils/utils';
import {message} from 'antd/es';
import {False, LSExtStaffAdminID, True} from '../../../../config/constant';
import styles from './index.less';
import moment from 'moment';
import type {ContactWayGroupItem, ContactWayItem} from '@/pages/StaffAdmin/ContactWay/data';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import {history} from 'umi';
import CollapsedStaffs from '@/pages/StaffAdmin/Components/Columns/CollapsedStaffs';
import CollapsedTags from '@/pages/StaffAdmin/Components/Columns/CollapsedTags';
import {uniqWith} from 'lodash';
import StaffTreeSelect from '@/pages/StaffAdmin/Components/Fields/StaffTreeSelect';
import type {StaffOption} from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import type { SimpleStaffInterface} from '@/services/staff';
import {QuerySimpleStaffs} from '@/services/staff';

const ContactWayList: React.FC = () => {
  const [currentGroup, setCurrentGroup] = useState<ContactWayGroupItem>({});
  const [itemDetailVisible, setItemDetailVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContactWayItem>({});
  const [selectedItems, setSelectedItems] = useState<ContactWayItem[]>([]);
  const [filterGroupID, setFilterGroupID] = useState('0');
  const [groupItems, setGroupItems] = useState<ContactWayGroupItem[]>([]);
  const [groupItemsTimestamp, setGroupItemsTimestamp] = useState(Date.now);
  const [createGroupVisible, setCreateGroupVisible] = useState(false);
  const [batchUpdateVisible, setBatchUpdateVisible] = useState(false);
  const [editGroupVisible, setEditGroupVisible] = useState(false);
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);
  const actionRef = useRef<ActionType>();

  function showDeleteGroupConfirm(item: ContactWayGroupItem) {
    Modal.confirm({
      title: `删除分组`,
      content: `是否确认删除「${item.name}」分组？`,
      // icon: <ExclamationCircleOutlined/>,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        return HandleRequest({ids: [item.id]}, DeleteGroup, () => {
          setGroupItemsTimestamp(Date.now);
        });
      },
    });
  }

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
  }, []);

  useEffect(() => {
    QueryGroup({page_size: 1000, sort_field: 'sort_weight', sort_type: 'asc'})
      .then((resp) => {
        if (resp && resp.data && resp.data.items) {
          setGroupItems(resp.data.items);
        }
      })
      .catch((err) => {
        message.error(err);
      });
  }, [groupItemsTimestamp]);

  const columns: ProColumns<ContactWayItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      hideInTable: true,
      hideInSearch: true,
      fixed:'left',
    },
    {
      title: '渠道码',
      dataIndex: 'qr_code',
      valueType: 'image',
      hideInSearch: true,
      width: 80,
      fixed:'left',
      render: (dom, item) => {
        return (
          <div className={'qrcodeWrapper'}>
            <img
              src={item.qr_code}
              onClick={() => {
                setItemDetailVisible(true);
                setCurrentItem(item);
              }}
              className={'qrcode clickable'}
              alt={item.name}
            />
          </div>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      valueType: 'text',
      fixed:'left',
    },
    {
      title: '使用员工',
      dataIndex: 'staffs',
      valueType: 'text',
      hideInSearch: true,
      width: 210,
      render: (_, item) => {
        let staffs: any[] = [];
        item.schedules?.forEach((schedule) => {
          if (schedule.staffs) {
            staffs = [...staffs, ...schedule.staffs];
          }
        });
        if (item.schedule_enable === True) {
          staffs = uniqWith(staffs, (a, b) => a.ext_staff_id === b.ext_staff_id);
          return <CollapsedStaffs limit={2} staffs={staffs}/>;
        }
        return <CollapsedStaffs limit={2} staffs={item.staffs}/>;
      },
    },
    {
      title: '使用员工',
      dataIndex: 'ext_staff_ids',
      valueType: 'text',
      hideInTable: true,
      renderFormItem: () => {
        return <StaffTreeSelect options={allStaffs}/>;
      },
    },
    {
      title: '备份员工',
      dataIndex: 'backup_staffs',
      valueType: 'text',
      hideInSearch: true,
      width: 210,
      render: (_, item) => {
        return <CollapsedStaffs limit={2} staffs={item.backup_staffs}/>;
      },
    },
    {
      title: '标签',
      dataIndex: 'customer_tags',
      valueType: 'text',
      ellipsis: true,
      hideInSearch: true,
      width: 210,
      render: (_, item) => {
        return <CollapsedTags limit={3} tags={item.customer_tags}/>;
      },
    },
    {
      title: '添加人次',
      dataIndex: 'add_customer_count',
      valueType: 'digit',
      hideInSearch: true,
      sorter: true,
      showSorterTooltip: false,
      width: 120,
      tooltip: '统计添加渠道码的人次，若客户重复添加将会记录多条数据',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      sorter: true,
      filtered: true,
      render: (dom, item) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: moment(item.created_at).format('YYYY-MM-DD HH:mm').split(' ').join('<br />'),
            }}
          />
        );
      },
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_, item) => [
        <a
          key='detail'
          onClick={() => {
            setItemDetailVisible(true);
            setCurrentItem(item);
          }}
        >
          详情
        </a>,
        <a
          key='download'
          onClick={() => {
            if (item?.qr_code) {
              FileSaver.saveAs(item?.qr_code, `${item.name}.png`);
            }
          }}
        >
          下载
        </a>,
        <Dropdown
          key='more'
          overlay={
            <Menu>
              <Menu.Item
                key='edit'
                onClick={() => {
                  history.push(`/staff-admin/customer-growth/contact-way/edit?id=${item.id}`);
                }}
              >
                修改
              </Menu.Item>
              <Menu.Item
                key='copy'
                onClick={() => {
                  history.push(`/staff-admin/customer-growth/contact-way/copy?id=${item.id}`);
                }}
              >
                复制
              </Menu.Item>
              {item.ext_creator_id === localStorage.getItem(LSExtStaffAdminID) && (
                <Menu.Item
                  key='delete'
                  onClick={() => {
                    Modal.confirm({
                      title: `删除渠道码`,
                      content: `是否确认删除「${item.name}」渠道码？`,
                      okText: '删除',
                      okType: 'danger',
                      cancelText: '取消',
                      onOk() {
                        return HandleRequest({ids: [item.id]}, Delete, () => {
                          actionRef.current?.clearSelected?.();
                          actionRef.current?.reload?.();
                        });
                      },
                    });
                  }}
                >删除</Menu.Item>
              )}
            </Menu>
          }
          trigger={['hover']}
        >
          <a style={{display: 'flex', alignItems: 'center'}}>
            编辑
            <CaretDownOutlined style={{fontSize: '8px', marginLeft: '3px'}}/>
          </a>
        </Dropdown>,
      ],
    },
  ];

  // @ts-ignore
  // @ts-ignore
  return (
    <PageContainer
      fixedHeader
      header={{
        title: '渠道活码列表',
        subTitle: (
          <a
            target={'_blank'}
            className={styles.tipsLink}
            // href={'https://www.openscrm.cn/wiki/contact-way'}
          >
            什么是渠道活码？
          </a>
        ),
      }}
      extra={[
        <Button
          key='create'
          type='primary'
          icon={<PlusOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
          onClick={() => {
            history.push('/staff-admin/customer-growth/contact-way/create');
          }}
        >
          新建活码
        </Button>,
      ]}
    >
      <ProTable<ContactWayItem>
        actionRef={actionRef}
        className={'table'}
        scroll={{x: 'max-content'}}
        columns={columns}
        rowKey='id'
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          pageSize: 5,
        }}
        toolBarRender={false}
        bordered={false}
        tableAlertRender={false}
        rowSelection={{
          onChange: (_, items) => {
            setSelectedItems(items);
          },
        }}
        tableRender={(_, dom) => (
          <div className={styles.mixedTable}>
            <div className={styles.leftPart}>
              <div className={styles.header}>
                <Button
                  key='1'
                  className={styles.button}
                  type='text'
                  onClick={() => setCreateGroupVisible(true)}
                  icon={<PlusSquareFilled style={{color: 'rgb(154,173,193)', fontSize: 15}}/>}
                >
                  新建分组
                </Button>
              </div>
              <Menu
                onSelect={(e) => {
                  setFilterGroupID(e.key as string);
                }}
                defaultSelectedKeys={['0']}
                mode='inline'
                className={styles.menuList}
              >
                <Menu.Item
                  icon={<FolderFilled style={{fontSize: '16px', color: '#138af8'}}/>}
                  key='0'
                >
                  全部
                </Menu.Item>
                {groupItems.map((item) => (
                  <Menu.Item
                    icon={<FolderFilled style={{fontSize: '16px', color: '#138af8'}}/>}
                    key={item.id}
                  >
                    <div className={styles.menuItem}>
                      {item.name}
                      <span className={styles.count}
                            style={{marginRight: item.is_default === True ? 16 : 0}}>{item.count}</span>
                    </div>
                    {item.is_default === False && (
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
                                setCurrentGroup(item);
                                setEditGroupVisible(true);
                              }}
                              key='edit'
                            >
                              修改名称
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => {
                                showDeleteGroupConfirm(item);
                              }}
                              key='delete'
                            >
                              删除分组
                            </Menu.Item>
                          </Menu>
                        }
                        trigger={['hover']}
                      >
                        <MoreOutlined style={{color: '#9b9b9b', fontSize: 18}}/>
                      </Dropdown>
                    )}
                  </Menu.Item>
                ))}
              </Menu>
            </div>
            <div className={styles.rightPart}>
              <div className={styles.tableWrap}>{dom}</div>
            </div>
          </div>
        )}
        params={{
          group_id: filterGroupID !== '0' ? filterGroupID : '',
        }}
        request={async (params, sort, filter) => {
          return ProTableRequestAdapter(params, sort, filter, Query);
        }}
        dateFormatter='string'
      />

      {selectedItems?.length > 0 && (
        // 底部选中条目菜单栏
        <FooterToolbar>
          <span>
            已选择 <a style={{fontWeight: 600}}>{selectedItems.length}</a> 项 &nbsp;&nbsp;
            <span></span>
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
          <Button onClick={() => setBatchUpdateVisible(true)}>批量分组</Button>
          <Button
            icon={<CloudDownloadOutlined/>}
            type={'primary'}
            onClick={() => {
              Modal.confirm({
                title: `批量下载渠道码`,
                content: `是否批量下载所选「${selectedItems.length}」个渠道码？`,
                okText: '下载',
                cancelText: '取消',
                onOk: async () => {
                  const zip = new JSZip();
                  // eslint-disable-next-line no-restricted-syntax
                  for (const item of selectedItems) {
                    if (item?.qr_code) {
                      // eslint-disable-next-line no-await-in-loop
                      const img = (await fetch(item?.qr_code)).blob();
                      zip.file(`${item.name}_${item.id}.png`, img);
                    }
                  }
                  const content = await zip.generateAsync({type: 'blob'});
                  FileSaver.saveAs(content, `渠道活码_${moment().format('YYYY_MM_DD')}.zip`);
                  actionRef.current?.clearSelected?.();
                  return true;
                },
              });
            }}
          >
            批量下载
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
                    Delete,
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

      <ModalForm
        width={468}
        className={'dialog from-item-label-100w'}
        layout={'horizontal'}
        visible={batchUpdateVisible}
        onVisibleChange={setBatchUpdateVisible}
        onFinish={async (values) => {
          return await HandleRequest(
            {ids: selectedItems.map((item) => item.id), ...values},
            BatchUpdate,
            () => {
              actionRef.current?.clearSelected?.();
              actionRef.current?.reload?.();
              setGroupItemsTimestamp(Date.now);
            },
          );
        }}
      >
        <h2 className='dialog-title'> 批量修改渠道码 </h2>
        <ProFormSelect
          // @ts-ignore
          options={groupItems.map((groupItem) => {
            return {key: groupItem.id, label: groupItem.name, value: groupItem.id};
          })}
          labelAlign={'left'}
          name='group_id'
          label='新分组'
          placeholder='请选择分组'
          rules={[
            {
              required: true,
              message: '请选择新分组',
            },
          ]}
        />
      </ModalForm>

      <ModalForm
        width={400}
        className={'dialog from-item-label-100w'}
        layout={'horizontal'}
        visible={createGroupVisible}
        onVisibleChange={setCreateGroupVisible}
        onFinish={async (params) =>
          HandleRequest({...currentGroup, ...params}, CreateGroup, () => {
            setGroupItemsTimestamp(Date.now);
          })
        }
      >
        <h2 className='dialog-title'> 新建分组 </h2>
        <ProFormText
          name='name'
          label='分组名称'
          tooltip='最长为 24 个汉字'
          placeholder='请输入分组名称'
          rules={[
            {
              required: true,
              message: '请填写分组名称',
            },
          ]}
        />
      </ModalForm>

      <ModalForm
        className={'dialog from-item-label-100w'}
        layout={'horizontal'}
        width={'500px'}
        visible={editGroupVisible}
        onVisibleChange={setEditGroupVisible}
        onFinish={async (params) =>
          HandleRequest({...currentGroup, ...params}, UpdateGroup, () => {
            setGroupItemsTimestamp(Date.now);
          })
        }
      >
        <h2 className='dialog-title'> 修改名称 </h2>
        <ProFormText
          colon={true}
          name='name'
          label='分组名称'
          tooltip='最长为 24 个汉字'
          placeholder='请输入分组名称'
          initialValue={currentGroup.name}
          rules={[
            {
              required: true,
              message: '请填写分组名称',
            },
          ]}
        />
      </ModalForm>

      <Modal
        className={styles.detailDialog}
        width={'800px'}
        visible={itemDetailVisible}
        onCancel={() => setItemDetailVisible(false)}
        footer={null}
      >
        <h2 className='dialog-title' style={{textAlign: "center", fontSize: 19}}> 渠道码详情 </h2>
        <Row>
          <Col span={8} className={styles.leftPart}>
            <img src={currentItem.qr_code}/>
            <h3>{currentItem.name}</h3>
            <Button
              type={'primary'}
              onClick={() => {
                if (currentItem?.qr_code) {
                  FileSaver.saveAs(currentItem?.qr_code, `${currentItem.name}.png`);
                }
              }}
            >
              下载渠道码
            </Button>
            <Button
              onClick={() => {
                history.push(
                  `/staff-admin/customer-growth/contact-way/edit?id=${currentItem.id}`,
                );
              }}
            >
              修改
            </Button>
          </Col>
          <Col span={16} className={styles.rightPart}>
            <div className={styles.section}>
              <div className={styles.titleWrapper}>
                <div className={styles.divider}/>
                <span className={styles.title}>基本设置</span>
              </div>
              <div className={styles.formItem}>
                <span className={styles.title}>创建时间：</span>
                <span className='date'>
                  {moment(currentItem.created_at).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
              <div className={styles.formItem}>
                <span className={styles.title}>绑定员工：</span>
                {currentItem.staffs?.map((staff) => (
                  <Tag
                    key={staff.id}
                    className={styles.staffTag}
                    style={{opacity: staff.online === False ? '0.5' : '1'}}
                  >
                    <img className={styles.icon} src={staff.avatar_url} alt={staff.name}/>
                    <span className={styles.text}>{staff.name}</span>
                  </Tag>
                ))}
              </div>
              <div className={styles.formItem}>
                <span className={styles.title}>备份员工：</span>
                {currentItem.backup_staffs?.map((staff) => (
                  <Tag
                    key={staff.id}
                    className={styles.staffTag}
                    style={{opacity: staff.online === False ? '0.5' : '1'}}
                  >
                    <img className={styles.icon} src={staff.avatar_url} alt={staff.name}/>
                    <span className={styles.text}>{staff.name}</span>
                  </Tag>
                ))}
              </div>
              <p className={styles.formItem}>
                <span className={styles.title}>自动通过好友：</span>
                {currentItem.auto_skip_verify_enable === True && (
                  <span>
                    {currentItem.skip_verify_start_time && '~'}
                    {currentItem.skip_verify_end_time}自动通过
                  </span>
                )}
                {currentItem.auto_skip_verify_enable === False && <span>未开启</span>}
              </p>
              <p className={styles.formItem}>
                <span className={styles.title}>客户标签：</span>
                {currentItem.customer_tags?.map((tag) => (
                  <Tag key={tag.id} className={styles.staffTag}>
                    <span className={styles.text}>{tag.name}</span>
                  </Tag>
                ))}
              </p>
            </div>
          </Col>
        </Row>
      </Modal>
    </PageContainer>
  );
};

export default ContactWayList;
