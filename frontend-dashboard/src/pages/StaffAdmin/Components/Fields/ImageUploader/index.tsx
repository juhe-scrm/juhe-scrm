import type {Dispatch, SetStateAction} from 'react';
import React, {useState} from 'react';
import type {UploadProps} from 'antd';
import defaultImage from '@/assets/default-image.png'
import {Badge, Image, message, Upload} from 'antd';
import {CloseCircleFilled, LoadingOutlined, PlusCircleFilled} from '@ant-design/icons';
import styles from './index.less';
import _ from 'lodash';

export type ImageUploaderProps = {
  value?: string,
  onChange?: Dispatch<SetStateAction<string>>;
} & UploadProps;

const ImageUploader: React.FC<ImageUploaderProps> = (props) => {
  const {value, onChange} = props;
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <Upload
      accept={'.jpg,.png,.jpeg'}
      name='avatar'
      listType='picture-card'
      className={styles.imageUploader}
      showUploadList={false}
      beforeUpload={(file) => {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
          message.error('只能上传jpg和png格式');
          return false;
        }
        if (file.size / 1024 / 1024 > 20) {
          message.error('图片最大20M');
          return false;
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
                }}
                style={{color: 'rgb(199,199,199)'}}
              />
            }
          >
            <Image
              preview={false}
              className={styles.image}
              src={value}
              fallback={defaultImage}
            />
          </Badge>
        )}
        {!value && (
          <div className={styles.button}>
            {loading ? <LoadingOutlined/> : <PlusCircleFilled/>}
            <div className={styles.text}>上传图片</div>
          </div>
        )}
      </div>
    </Upload>
  );
};

export default ImageUploader;
