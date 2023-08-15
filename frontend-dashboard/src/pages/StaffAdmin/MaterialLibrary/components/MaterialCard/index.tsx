import React from "react";
import {Space, Tooltip, Image, Tag} from 'antd'
import styles from './index.less'
import pdfpng from '@/assets/file-icon-pdf.svg'
import pptpng from '@/assets/file-icon-ppt.svg'
import wordpng from '@/assets/file-icon-word.svg'
import excelpng from '@/assets/file-icon-excel.svg'
import moment from "moment";
import {parseFileSize} from '@/utils/utils'
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';
import {TagContext} from '../../TagProvider';
import damagedImage from '@/assets/damaged-image.png'

const imageMap = {
  'pdf': pdfpng, 'ppt': pptpng, 'word': wordpng, 'excel': excelpng
}

type Callback = {
  callback: (targetMaterial: Material.Item, operation: string) => void
}

const MaterialCard: React.FC<Material.Item & Callback> = (props) => {
  const {allTagsMap} = React.useContext(TagContext)
  const {material_type, link, title, digest, url, created_at, callback, material_tag_list, file_size, id} = props

  const renderTagBox = () => {
    return <div className={styles.tagBox}>
      {
        material_tag_list?.map((tagId: string, index: number) => {
            const length = material_tag_list?.length
            if (index < 3) {
              return (
                <Tag
                  key={tagId}
                >
                  {allTagsMap[tagId]?.name}
                </Tag>
              );
            }

            if (index === 3) {
              return (
                <Tag
                  key={'extend'}
                >
                  <span className={styles.text}> +{(length - index)} ...</span>
                </Tag>
              );
            }
            return '';
          }
        )
      }
    </div>
  }

  const renderOperator = () => {
    return <div>
      <Space>
        <Tooltip title="修改素材">
                  <span>
                      <EditOutlined onClick={() => callback({...props}, 'update')}/>
                  </span>
        </Tooltip>
        <Tooltip title="删除素材">
                  <span>
                      <DeleteOutlined onClick={() => callback({...props}, 'delete')}/>
                  </span>
        </Tooltip>
      </Space>
    </div>
  }
  return (
    <>
      {
        material_type === 'link' && <div className={styles.card} key={id}>
          <div className={styles.linkInfoContainer}>
            <div className={styles.info}>
              <span className={styles.title}>
                  {title}
              </span>
              <div className={styles.infoInnerFlexBox}>
                <a target={'_blank'} href={link}>
                  {digest}
                </a>
                <Image src={url} fallback={damagedImage}/>
              </div>
            </div>
          </div>
          {
            material_tag_list?.length > 0 && renderTagBox()
          }
          <div className={styles.operateFooter}>
            <span>创建时间：{moment(created_at).format('YYYY-MM-DD')}</span>
            {renderOperator()}
          </div>

        </div>
      }
      {
        (material_type === 'poster' || material_type === 'video') &&
        <div className={styles.posterOrVideoCard} key={id}>
          {
            material_type === 'poster' ?
              <div className={styles.imgContainer}>
                <Image
                  width={'100%'}
                  src={url}
                  fallback={damagedImage}
                />
              </div>
              :
              <div className={styles.videoContainer}>
                <div className={styles.videoBox}>
                  <video width={'100%'} height={310} src={url} controls={true}/>
                </div>
              </div>
          }
          <div>
            {
              material_tag_list?.length > 0 ?
                renderTagBox()
                :
                <div style={{height: 0}}></div>
            }
          </div>
          <div className={styles.operateFooter}>
            <span className={styles.titleFooter}>{title}</span>
            {renderOperator()}
          </div>
        </div>
      }
      {
        (material_type === 'pdf' || material_type === 'ppt' || material_type === 'excel' || material_type === 'word') &&
        <div className={styles.fileCard} key={id}>
          <div className={styles.fileInfoContainer}>
            <div className={styles.fileInfo}>
              <p>{title}</p>
              <p>{parseFileSize(Number(file_size))}</p>
            </div>
            <img src={imageMap[material_type]}/>
          </div>
          {
            material_tag_list?.length > 0 && renderTagBox()
          }
          <div className={styles.operateFooter}>
            <span>创建时间：{moment(created_at).format('YYYY-MM-DD')}</span>
            {renderOperator()}
          </div>

        </div>
      }
    </>

  )
}
export default React.memo(MaterialCard)
