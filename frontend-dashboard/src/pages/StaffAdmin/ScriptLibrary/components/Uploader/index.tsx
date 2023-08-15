import type {Dispatch, SetStateAction} from 'react';
import React, {useState} from 'react';
import type {UploadProps} from 'antd';
import {Badge, Image, message, Upload, Button} from 'antd';
import {CloseCircleFilled, LoadingOutlined, PlusCircleFilled} from '@ant-design/icons';
import styles from './index.less';
import _ from 'lodash';
import pdfImage from '@/assets/file-icon-pdf.svg'
import uploadImage from '@/assets/uploadimage.svg'
import defaultImage from '@/assets/default-image.png'
import {parseFileSize} from '@/utils/utils'

export type ImageUploaderProps = {
  value?: string,
  onChange?: Dispatch<SetStateAction<string>>;
  fileType: string;
  fileInfoAry?: { fileName: string, fileSize: string, key: number }[];
  currentKey?: number;
  setFileInfoAry?: Dispatch<SetStateAction<{ fileName: string, fileSize: string, key: number }[]>>;
  initialFileInfo?: { fileName: string, fileSize: string, key: number };
} & UploadProps;

const commonNoValueRender = (loading: boolean, fileType: string) => (
  <div className={styles.button}>
    {loading ? <LoadingOutlined/> : null}
    <img src={uploadImage} style={{width:80,height:50}}/>
    {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
    <p>请上传{fileMap[fileType].accept}格式</p>
    {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
    <p>不超过{fileMap[fileType].limitSize}M的文件 </p>
    <Button style={{marginTop: 10}}>上传{fileType}</Button>
  </div>
)
const commonExistValueRender = (value: any, fileInfo: any, fileType: string) => (
  <div className={styles.fileContainer}>
    <div className={styles.fileCard}>
      <div className={styles.fileInfo}>
        <p>{fileInfo.fileName}</p>
        <p>{parseFileSize(Number(fileInfo.fileSize))}</p>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
      <img src={fileMap[fileType].image}/>
    </div>
  </div>
)
const fileMap = {
  'formImage': {
    accept: '.jpg,.png',
    contentType: [ 'image/png', 'image/jpg'],
    limitSize: 2,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    existValueRender: (value: any, fileInfo: any, fileType: string) => (
      <Image
        preview={false}
        className={styles.image}
        src={value}
        fallback={defaultImage}
      />
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    noValueRender: (loading: boolean, fileType: string) => (
      <div className={styles.formImageButton}>
        {loading ? <LoadingOutlined/> : <PlusCircleFilled/>}
        <div className={styles.text}>上传图片</div>
      </div>
    ),
  },
  '视频': {
    accept: '.mp4',
    contentType: ['video/mp4'],
    limitSize: 10,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    existValueRender: (value: any, fileInfo: any, fileType: string) => (
          <video src={value} style={{width: 260}} controls={true}></video>
    ),
    noValueRender: (loading: boolean, fileType: string) => commonNoValueRender(loading, fileType),
  },
  'PDF': {
    accept: '.pdf',
    contentType: ['application/pdf'],
    limitSize: 20,
    image: pdfImage,
    existValueRender: (value: any, fileInfo: any, fileType: string) => commonExistValueRender(value, fileInfo, fileType),
    noValueRender: (loading: boolean, fileType: string) => commonNoValueRender(loading, fileType),
  },

}

const Uploader: React.FC<ImageUploaderProps> = (props) => {
  const {value, onChange, fileType, ...rest} = props;
  const [loading, setLoading] = useState<boolean>(false);
  return <>
    <Upload
      {...rest}
      key={props.currentKey}
      accept={fileMap[fileType].accept}
      name='avatar'
      listType='picture-card'
      className={fileType === 'formImage' ? styles.formImageUploader : styles.uploader}
      showUploadList={false}
      beforeUpload={(file) => {
        if (!fileMap[fileType].contentType.includes(file.type)) {
          message.error(`只能上传${fileMap[fileType].accept}格式`);
          return false;
        }
        if (file.size / 1024 / 1024 > fileMap[fileType].limitSize) {
          message.error(`图片最大${fileMap[fileType].limitSize}M`);
          return false;
        }
        if(fileType==='PDF'){
          // @ts-ignore
          const temp = [...props?.fileInfoAry]
          temp.push({fileName:file.name,fileSize:file.size,key:props.currentKey})
          props?.setFileInfoAry?.(temp || [])
        }
        return true;
      }}
      onChange={(info) => {
        if (info.file.status === 'uploading') {
          setLoading(true);
          return;
        }
        if (info.file.status === 'done') {
          setLoading(false);
        }
      }}
      {...(_.omit(props, ['value']))}
    >
      <div>
        {value && (
          <Badge
            count={
              <CloseCircleFilled
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onChange) {
                    onChange('');
                  }
                  setLoading(false);
                  if(fileType==='PDF'){
                    // @ts-ignore
                    const temp = [...props?.fileInfoAry]
                    for (let i = 0; i < temp.length; i += 1) {
                      if (temp[i].key === props.currentKey) {
                        temp.splice(i, 1)
                      }
                    }
                    props?.setFileInfoAry?.(temp || [])
                  }
                }}
                style={{color: 'rgb(199,199,199)'}}
              />
            }
          >
            {fileMap[fileType].existValueRender(value, props?.fileInfoAry?.find((item: any) => item.key === props.currentKey) || props.initialFileInfo, fileType)}
          </Badge>
        )}
        {
          !value && fileMap[fileType].noValueRender(loading, fileType)
        }
      </div>
    </Upload>
  </>;
};

export default Uploader;

