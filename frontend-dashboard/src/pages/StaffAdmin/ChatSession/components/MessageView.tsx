import React, {useState, useEffect, useRef} from 'react';
import styles from './index.less'
import {Spin, Image, Empty} from 'antd'
import {parseTime} from "@/utils/utils";
import {useInViewport} from 'ahooks';
import damagedImage from '@/assets/damaged-image.png'
import defaultImage from '@/assets/default-image.png'

export type NewMsg = ChatMessage.Item & {
  showTime?: boolean;
}

interface MassageViewProps {
  chatMessageList: NewMsg[];
  currentStaff: Staffs.Item;
  currentChatSession: ChatSessions.Item;
  chatMessageListLoading?: boolean;
  chatSessionsListLoading?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  loadMore?: any;
  noMore?: boolean;
  loadEarlierData?: any;
  loadNearData?: any;
  loadingMoreEarlierData?: boolean;
  loadingMoreNearData?: boolean;
  total: number;
  isContextView?: boolean;
  timeRange?: string[];
}

export const msgTypeMap = {
  "revoke": '',
  "voice": '语音',
  "file": '文件',
  "link": '链接',
  'image': '图片'
  // "chatrecord"
  // "weapp"
  // "docmsg"
  // "markdown"
  // "meeting"
  // "collect"
  // "vote"
  // "news"
  // "calendar"
  // "card"
  // "location"
  // "emotion"
}

const MessageView: React.FC<MassageViewProps> = (props) => {
    const {
      timeRange,
      chatMessageList,
      chatMessageListLoading,
      chatSessionsListLoading,
      currentStaff,
      loadingMore, // 默认消息列表loading
      loadMore, // 默认消息列表 加载更多 触发函数
      currentChatSession,
      total,
      isContextView,// 是否为查看上下问消息列表
      loadEarlierData, // 查看上下文消息列表 加载更多 触发函数
      loadNearData,// 查看上下文消息列表 加载更多 触发函数
      loadingMoreEarlierData, // 查看上下文消息列表  loading
      loadingMoreNearData// 查看上下文消息列表 loading
    } = props
    const messagesEnd = useRef<HTMLDivElement>(null);
    const loadMoreTopRef = useRef<HTMLDivElement>(null);
    const loadMoreNearRef = useRef<HTMLDivElement>(null);
    const loadMoreEarlierRef = useRef<HTMLDivElement>(null);
    const previousMsg = useRef<HTMLDivElement>(null);
    const inViewPortTop = useInViewport(loadMoreTopRef)
    const inViewPortTopEarlier = useInViewport(loadMoreEarlierRef)
    const inViewPortBottom = useInViewport(loadMoreNearRef)
    const [hasLoadMore, setHasLoadMore] = useState(0)

    const scroll = (ref: any, action: string) => {
      if (ref && ref.current) {
        if(action === 'getEarlier'){
          window.scrollTo(0, ref.current.offsetTop)
        }
        if(action === 'getNear'){
          window.scrollTo(0, ref.current.offsetBottom)
        }
      }
    };

    const renderMsgDetail = (msg: NewMsg) => {
      return <div className={styles.detailContainer}>
        {
          msg.msgtype === 'text' && <div className={styles.textMsg}>
            {msg?.content_text}
          </div>
        }
        {
          msg.msgtype === 'image' && <div className={styles.imageMsg}>
            <Image src={msg?.chat_msg_content.file_url}
                   fallback={damagedImage} style={{maxWidth: 200, maxHeight: 200}}
            />
          </div>
        }
        {
          msg.msgtype !== 'text' && msg?.msgtype !== 'image' && <div className={styles.textMsg}>
            [{msgTypeMap[msg.msgtype]}消息]，暂不支持预览
          </div>
        }
      </div>
    }

    const leftMsg = (msg: NewMsg, index: number) => {
      return <div className={styles.leftMsg} ref={index === 0 ? previousMsg : null}>
        <div className={styles.sendTime}>
          {msg.showTime || index === 0 ? parseTime(msg?.msgtime) : ''}
        </div>
        <div className={styles.leftMsgInfo}>
          <Image src={msg.sender_avatar} preview={false} className={styles.leftAvatar} fallback={defaultImage}/>
          {renderMsgDetail(msg)}
        </div>
      </div>
    }

    const rightMsg = (msg: NewMsg, index: number) => {
      return <div className={styles.rightMsg} ref={index === 0 ? previousMsg : null}>
        <div className={styles.sendTime}>
          {msg.showTime || index === 0 ? parseTime(msg.msgtime) : ''}
        </div>
        <div className={styles.rightMsgInfo}>
          {renderMsgDetail(msg)}
          <Image src={msg.sender_avatar} preview={false} className={styles.rightAvatar} fallback={defaultImage}/>
        </div>
      </div>
    }

    // 默认消息列表 下拉加载更早的消息
    useEffect(() => {
      if (inViewPortTop && chatMessageList.length < total && chatMessageList.length > 0) {
        console.log('loadmore')
        loadMore()
        setTimeout(() => {
          scroll(loadMoreTopRef, 'getEarlier')
        }, 1000)
      }
      setHasLoadMore(() => hasLoadMore + 1)
    }, [inViewPortTop])

    // 查看上下文消息列表 上拉加载最近的消息
    useEffect(() => {
      if (inViewPortBottom && chatMessageList.length < total && chatMessageList.length > 0 && isContextView) {
        loadNearData()
        setTimeout(() => {
          scroll(loadMoreEarlierRef, 'getEarlier')
        }, 1000)
      }
      setHasLoadMore(() => hasLoadMore + 1)
    }, [inViewPortBottom])

    // 查看上下文消息列表 下拉加载更早的消息
    useEffect(() => {
      if (inViewPortTopEarlier && chatMessageList.length < total && chatMessageList.length > 0) {
        loadEarlierData()
        setTimeout(() => {
          scroll(loadMoreNearRef, 'getNear')
        }, 1000)      }
      setHasLoadMore(() => hasLoadMore + 1)
    }, [inViewPortTopEarlier])

    useEffect(() => {
      // if (hasLoadMore === 0 && !isContextView) {
      //   scroll();
      // }
    }, [chatMessageList])

    useEffect(() => {
      setHasLoadMore(0)
    }, [currentStaff, currentChatSession])

    return (
      <div className={styles.messageViewOuter}>
        {
          timeRange && timeRange?.[0].length > 0 ? <div className={styles.timeNotion}>
            <span>{timeRange?.[0]}至{timeRange?.[1]}期间的结果</span>
          </div> : <></>
        }
        <div className={isContextView ? styles.contextViewContainer : styles.viewContainer}>
          {
            chatMessageList.length === 0 && !chatMessageListLoading && !chatSessionsListLoading &&
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{marginTop: 100}}/>
          }
          <div className={styles.messageListBox}>
            {
              isContextView ?
                // 触发'加载更多'的Ref
                <div ref={loadMoreEarlierRef} className={styles.loadMoreSpin}>
                  <Spin spinning={loadingMoreEarlierData}/>
                </div>
                :
                <div ref={loadMoreTopRef} className={styles.loadMoreSpin}>
                  <Spin spinning={loadingMore}/>
                </div>
            }
            {/* 渲染消息列表 */}
            {
              chatMessageList?.length > 0 && chatMessageList?.map((msg, index) => {
                return msg?.sender_name === currentStaff.name ? rightMsg(msg, index) : leftMsg(msg, index)
              })
            }
          </div>
          {
            // 触发'加载更多'的Ref
            isContextView && <div ref={loadMoreNearRef} className={styles.loadMoreBottomSpin}>
              <Spin spinning={loadingMoreNearData}/>
            </div>
          }
          <div style={{clear: 'both', height: '30px', width: '100%'}} ref={messagesEnd}></div>
        </div>
      </div>
    );
  }
;
export default MessageView;
