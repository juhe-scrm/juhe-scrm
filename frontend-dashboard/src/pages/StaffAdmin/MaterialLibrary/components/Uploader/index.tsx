import type {Dispatch, SetStateAction} from 'react';
import React, {useState} from 'react';
import type {UploadProps} from 'antd';
import {Badge, Image, message, Upload, Button} from 'antd';
import {CloseCircleFilled, LoadingOutlined, PlusCircleFilled} from '@ant-design/icons';
import styles from './index.less';
import _ from 'lodash';
import pdfImage from '@/assets/file-icon-pdf.svg'
import pptImage from '@/assets/file-icon-ppt.svg'
import wordImage from '@/assets/file-icon-word.svg'
import excelImage from '@/assets/file-icon-excel.svg'
import uploadimage from '@/assets/uploadimage.svg'
import defaultImage from '@/assets/default-image.png'
import {parseFileSize} from '@/utils/utils'

export type ImageUploaderProps = {
  value?: string,
  onChange?: Dispatch<SetStateAction<string>>;
  fileType: string;
  fileInfo: { fileName: string, fileSize: string };
  setFileInfo: Dispatch<SetStateAction<{ fileName: string, fileSize: string }>>
} & UploadProps;

const commonNoValueRender = (loading: boolean, fileType: string) => (
  <div className={styles.button}>
    {loading ? <LoadingOutlined/> : null}
    <img src={uploadimage} style={{width: 80, height: 50}}/>
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
    contentType: ['image/png', 'image/jpg'],
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
  '海报': {
    accept: '.jpg,.png',
    contentType: ['image/png', 'image/jpg'],
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
    noValueRender: (loading: boolean, fileType: string) => commonNoValueRender(loading, fileType)
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
  'PPT': {
    accept: '.pptx,.ppt',
    contentType: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    limitSize: 20,
    image: pptImage,
    existValueRender: (value: any, fileInfo: any, fileType: string) => commonExistValueRender(value, fileInfo, fileType),
    noValueRender: (loading: boolean, fileType: string) => commonNoValueRender(loading, fileType),
  },
  '表格': {
    accept: '.xls,.xlsx',
    contentType: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    limitSize: 20,
    image: excelImage,
    existValueRender: (value: any, fileInfo: any, fileType: string) => commonExistValueRender(value, fileInfo, fileType),
    noValueRender: (loading: boolean, fileType: string) => commonNoValueRender(loading, fileType),
  },
  '文档': {
    accept: '.doc,.docx',
    contentType: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    limitSize: 20,
    image: wordImage,
    existValueRender: (value: any, fileInfo: any, fileType: string) => commonExistValueRender(value, fileInfo, fileType),
    noValueRender: (loading: boolean, fileType: string) => commonNoValueRender(loading, fileType),
  }
}

const Uploader: React.FC<ImageUploaderProps> = (props) => {
  const {value, onChange, fileType, ...rest} = props;
  const [loading, setLoading] = useState<boolean>(false);
  const {fileInfo, setFileInfo} = props
  return <Upload
    {...rest}
    key={fileType}
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
      setFileInfo({fileName: file.name, fileSize: String(file.size)})
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
              }}
              style={{color: 'rgb(199,199,199)'}}
            />
          }
        >
          {fileMap[fileType].existValueRender(value, fileInfo, fileType)}
        </Badge>
      )}
      {
        !value && fileMap[fileType].noValueRender(loading, fileType)
      }
    </div>
  </Upload>
};

export default Uploader;

