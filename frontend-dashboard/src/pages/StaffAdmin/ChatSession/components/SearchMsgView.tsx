import React, {useState} from 'react';
import styles from './index.less'
import {message} from 'antd'
import {parseTime} from "@/utils/utils";
import {Button} from 'antd';
import {QueryChatMessages} from "@/pages/StaffAdmin/ChatSession/service";
import MessageView from "@/pages/StaffAdmin/ChatSession/components/MessageView";
import {LeftOutlined} from "@ant-design/icons";

interface SearchMsgViewProps {
  searchMsgList: SearchMessage.Item[];
  setShowSearchMessageView: any;
  currentStaff: Staffs.Item;
  currentChatSession: ChatSessions.Item;
  total: number;
}

const SearchMsgView: React.FC<SearchMsgViewProps> = (props) => {
  const {searchMsgList, setShowSearchMessageView, currentChatSession, currentStaff, total: msgTotal} = props
  const [chatMessageList, setChatMessageList] = useState<ChatMessage.Item[]>([]) // 消息
  const [showContextMsgList, setShowContextMsgList] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMoreEarlierData, setLoadingMoreEarlierData] = useState(false)
  const [loadingMoreNearData, setLoadingMoreNearData] = useState(false)

  const queryChatMessages = (action: string, min_id?: string, max_id?: string, pageSize?: number, pageNth?: number) => {
    return QueryChatMessages({
      page_size: pageSize,
      page: pageNth,
      ext_staff_id: currentStaff?.ext_staff_id || 'none',
      receiver_id: currentChatSession.peer_ext_id || 'none',
      max_id,
      min_id
    }).then(res => {
      if (res?.code === 0) {
        setChatMessageList([])
        let newMsgList: any[] = []
        if (action === 'getEarlier') {
          newMsgList = [...res.data.items]?.concat([...chatMessageList]).filter((m: any) => m !== null)
          setLoadingMoreEarlierData(false)
        } else if (action === 'getNear') {
          newMsgList = [...chatMessageList]?.concat([...res.data.items]).filter((m: any) => m !== null)
          setLoadingMoreNearData(false)
        }
        newMsgList?.map((msg: any) => {
          return {...msg, showTime: false}
        })
        for (let i = 0; i < newMsgList.length; i += 1) {
          if (Math.floor(Number(newMsgList[i]?.msgtime) / 10800 / 1000) !== Math.floor(Number(newMsgList[i + 1]?.msgtime) / 10800 / 1000)) {
            newMsgList[i].showTime = true
          }
        }
        setChatMessageList(newMsgList || [])
        setPage(() => page + 1)
      } else {
        message.error(res?.message)
      }
    })
  }

  // 下拉 min_id
  const loadEarlierData = () => {
    setLoadingMoreEarlierData(true)
    queryChatMessages('getEarlier', chatMessageList?.[0]?.id, undefined, 10, page)
  }

  // 上拉 max_id
  const loadNearData = () => {
    setLoadingMoreNearData(true)
    queryChatMessages('getNear', undefined, chatMessageList?.[chatMessageList?.length - 1]?.id, 10, page)
  }

  // 获取初始的上下文列表
  const getInitialChatMessageList = (msg: SearchMessage.Item) => {
    QueryChatMessages({
      page_size: 10,
      page: 1,
      ext_staff_id: currentStaff?.ext_staff_id || 'none',
      receiver_id: currentChatSession.peer_ext_id || 'none',
      max_id: msg.id
    }).then(maxRes => {
      if (maxRes?.code === 0) {
        QueryChatMessages({
          page_size: 10,
          page: 1,
          ext_staff_id: currentStaff?.ext_staff_id || 'none',
          receiver_id: currentChatSession.peer_ext_id || 'none',
          min_id: msg.id
        }).then(minRes => {
          // 查询结果按时间从小到大排序。用min_id查询比目标时间更早的数据
          if (minRes?.code === 0) {
            const initialChatMessageList = [...minRes.data.items].concat([msg]).concat([...maxRes.data.items]).filter((m: any) => m !== null) || []
            initialChatMessageList?.map((initialMsg: any) => {
              return {...initialMsg, showTime: false}
            })
            for (let i = 0; i < initialChatMessageList.length; i += 1) {
              if (Math.floor(Number(initialChatMessageList[i]?.msgtime) / 10800 / 1000) !== Math.floor(Number(initialChatMessageList[i + 1]?.msgtime) / 10800 / 1000)) {
                initialChatMessageList[i].showTime = true
              }
            }
            setChatMessageList(initialChatMessageList || [])
            setPage(() => page + 1)
          }
        })
      }

    })
  }

  return (
    <div className={styles.searchViewContainerOuter}>
      <div className={styles.back}>
        <Button type={'link'} onClick={() => {
          if (showContextMsgList) {
            setShowContextMsgList(false)
            setPage(1)
          } else {
            setShowSearchMessageView(false)
          }
        }}><LeftOutlined/>返回</Button>
      </div>
      <div className={styles.searchViewContainer}>
        <div className={styles.searchMessageView} style={{display: showContextMsgList ? 'none' : 'block'}}>
          {
            searchMsgList.map(msg => (
              <div className={styles.msgItem}>
                <img src={msg.sender_avatar}/>
                <div className={styles.textBox}>
                  <div className={styles.nameAndTime}>
                    <span>{msg.sender_name}</span>
                    <span>{parseTime(msg.msgtime)}</span>
                  </div>
                  <div className={styles.textContent}>
                    <div>
                      {msg.content_text}
                    </div>
                    <Button type={'link'} onClick={() => {
                      getInitialChatMessageList(msg)
                      setShowContextMsgList(true)
                    }}>查看上下文</Button>
                  </div>
                </div>
              </div>
            ))
          }
          {
            searchMsgList.length > 0 && <p className={styles.noMore}>没有更多了</p>
          }
        </div>
        <div className={styles.contextMsgView} style={{display: showContextMsgList ? 'block' : 'none'}}>
          <MessageView chatMessageList={chatMessageList || []} currentStaff={currentStaff}
                       loadEarlierData={loadEarlierData} loadNearData={loadNearData}
                       loadingMoreEarlierData={loadingMoreEarlierData}
                       loadingMoreNearData={loadingMoreNearData} currentChatSession={currentChatSession}
                       total={msgTotal} isContextView={true}/>
        </div>
      </div>

    </div>
  )
};
export default SearchMsgView;
