import React, {useEffect, useState, useRef} from 'react'
import styles from './index.less'
import {CustomerEvents} from "@/pages/StaffAdmin/Customer/data";
import {Dictionary} from "lodash";
import {StaffOption} from "@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal";
import _ from 'lodash'
import moment from 'moment'
import {Spin, BackTop, Empty, Radio} from 'antd'
import {useLoadMore} from '@umijs/hooks';
import {QueryCustomerEvents} from "@/pages/StaffAdmin/Customer/service";
import {FnParams} from "@umijs/hooks/es/useLoadMore";
import {useInViewport} from 'ahooks';
import {TagsFilled} from "@ant-design/icons";

interface EventsProps {
  data?: CustomerEvents.Item[];
  simpleRender?: boolean;
  staffMap: Dictionary<StaffOption>;
  extCustomerID: string;
}

const customerEventType = {
  '': '全部动态',
  'customer_action': '客户动态',
  'integral_record': '积分记录',
  'manual_event': '跟进记录',
  'moment_interaction': '朋友圈互动',
  'reminder_event': '提醒事件',
  'template_event': '模板事件',
  'update_remark': '修改信息',
}

const Events: React.FC<EventsProps> = (props) => {
  const {simpleRender, data, extCustomerID} = props
  const [currentType, setCurrentType] = useState('')
  const [groupData, setGroupData] = useState({} as any)
  const [eventsList, setEventsList] = useState<CustomerEvents.Item[]>([])
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [eventListLoading, setEventListLoading] = useState(true)
  const inViewPort = useInViewport(loadMoreRef);

  const getEvents = (page_size?: number, page?: number) => {
    return QueryCustomerEvents({
      ext_customer_id: extCustomerID,
      ext_staff_id: localStorage.getItem('extStaffAdminID') as string,
      page_size,
      page,
      event_type: currentType
    }).then(res => {
      console.log('QueryCustomerEventsQueryCustomerEvents', res)
      setEventsList([...eventsList].concat(res?.data?.items).filter(elem => elem !== null))
      setEventListLoading(false)
      return Promise.resolve({data: res?.data?.items || [], total: res?.data?.total_rows})
    })
  }

  const asyncFn = ({pageSize, page}: FnParams): Promise<{
    total: number;
    data: any[];
  }> => {
    return getEvents(pageSize, page).then(res => {
      return Promise.resolve({
        total: res?.total,
        data: res?.data
      })
    })
  }

  const {loadingMore, reload, loadMore, noMore} = useLoadMore<any, any>(
    asyncFn,
    {
      initPageSize: 20,
      incrementSize: 20,
    },
  );

  useEffect(() => {
    if (inViewPort && !simpleRender && eventsList.length >= 20) {
      loadMore()
    }
  }, [inViewPort])

  useEffect(() => {
    const temp = _.groupBy(simpleRender ? data : eventsList, (item) => {
      return moment(item?.created_at).format('MMM Do YYYY,dddd')
    })
    setGroupData(temp)
  }, [data, eventsList])

  const render = () => {
    return <div className={styles.groupByDay}>
      {
        Object.keys(groupData).map((key: any) => {
          return <>
            <div className={styles.day}>{key}</div>
            <div className={styles.events}>
              {
                groupData[key].map((item: any) => {
                  return <div className={styles.eventItem}>
                    <div className={styles.timeHeader}>
                      <TagsFilled />
                      <span>{moment(item?.created_at).format('h:mm')}</span>
                    </div>
                    <div className={styles.infoBottom}>
                      <div className={styles.infoBox}>
                        <span className={styles.eventType}>{customerEventType[item?.event_type]}</span>
                        <span className={styles.eventContent}>{item?.content}</span>
                      </div>
                    </div>
                  </div>
                })
              }
            </div>
          </>
        })
      }
    </div>
  }
  const onRadioChange = (e: any) => {
    setCurrentType(e.target.value)
    setEventListLoading(true)
    setEventsList([])
    reload()
  }

  return <div className={styles.events} style={{minHeight:300}}>
    <Spin spinning={eventListLoading} style={{marginTop:60}}>
      {
        simpleRender ? <div>
            {render()}
          </div>
          :
          <div>
            <Radio.Group onChange={onRadioChange} value={currentType}>
              {
                Object.keys(customerEventType).map(key => {
                  return <Radio value={key}>{customerEventType[key]}</Radio>
                })
              }
            </Radio.Group>
            <div style={{marginTop: 40}}>
              {render()}
              <Spin spinning={loadingMore}>
                <div style={{clear: 'both', height: '30px', width: '100%'}} ref={loadMoreRef}/>
              </Spin>
              <BackTop/>
              {
                noMore && eventsList?.length > 0 &&
                <div style={{display: 'flex', justifyContent: 'center', color: '#aaa'}}>没有更多信息了</div>
              }
            </div>
          </div>
      }
    </Spin>
    {
      !simpleRender && eventsList?.length === 0 && !eventListLoading && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
    }
  </div>

}
export default Events;


