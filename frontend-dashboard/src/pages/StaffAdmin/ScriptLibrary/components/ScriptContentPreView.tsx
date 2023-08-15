import React from 'react';
import styles from "./index.less";
import {Image, Tooltip} from "antd";
import {parseFileSize} from "@/utils/utils";
import pdfImage from "@/assets/file-icon-pdf.svg";
import videoImage from '@/assets/file-icon-video.svg'
import ExpandableParagraph from './ExpandableParagraph'
import damagedImage from '@/assets/damaged-image.png'

interface ScriptContentPreViewProps {
  script: Script.Item;
}

const iconWidth = 40;

const ScriptContentPreView: React.FC<ScriptContentPreViewProps> = (props) => {
  const {script} = props
  return (
    <div>
      {
        script.reply_details.map((reply: any, index) => {
          if (index < 2) {
            return <div style={{width: 200}}>
              {
                reply.content_type === 2 && <div key={reply.id} style={{width: '100%', margin: '8px 0'}}>
                  <ExpandableParagraph content={reply.quick_reply_content?.text?.content} rows={4}/>
                </div>
              }
              {
                reply.content_type === 3 && <div key={reply.id} className={styles.imageOverview}>
                  <div className={styles.leftPart}>
                    <Image src={reply.quick_reply_content?.image?.picurl} width={iconWidth} fallback={damagedImage}/>
                  </div>
                  <div className={styles.rightPart}>
                    <p>{reply.quick_reply_content?.image?.title}</p>
                    <p>{parseFileSize(reply.quick_reply_content?.image?.size)}</p>
                  </div>
                </div>
              }
              {
                reply.content_type === 4 && <div className={styles.imageOverview}>
                  <div className={styles.leftPart}>
                    <Image src={reply.quick_reply_content?.link?.picurl} width={iconWidth} fallback={damagedImage}/>
                  </div>
                  <div className={styles.rightPart}>
                    <Tooltip placement="topLeft" title={reply.quick_reply_content?.link?.title}>
                      <p>{reply.quick_reply_content?.link?.title}</p>
                    </Tooltip>
                    <Tooltip placement="topLeft" title={reply.quick_reply_content?.link?.desc}>
                      <p>{reply.quick_reply_content?.link?.desc}</p>
                    </Tooltip>
                  </div>
                </div>
              }
              {
                reply.content_type === 5 && <div className={styles.imageOverview}>
                  <div className={styles.leftPart}>
                    <Image src={pdfImage} width={iconWidth} preview={false} fallback={damagedImage}/>
                  </div>
                  <div className={styles.rightPart}>
                    <p>{reply.quick_reply_content?.pdf?.title}</p>
                    <p>{parseFileSize(reply.quick_reply_content?.pdf?.size)}</p>
                  </div>
                </div>
              }
              {
                reply.content_type === 6 && <div className={styles.imageOverview}>
                  <div className={styles.leftPart}>
                    <Image src={videoImage} width={iconWidth} preview={false} fallback={damagedImage}/>
                  </div>
                  <div className={styles.rightPart}>
                    <p>{reply.quick_reply_content?.video?.title}</p>
                    <p>{parseFileSize(reply.quick_reply_content?.video?.size)}</p>
                  </div>
                </div>
              }
            </div>
          }
          if (index === 3) {
            return <div style={{color: '#666'}}>...</div>
          }
          return <></>
        })
      }
      <div style={{color: '#666'}}>共{script.reply_details.length}条</div>
    </div>
  )
}
export default React.memo(ScriptContentPreView)
