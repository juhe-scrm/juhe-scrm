import type { Dispatch, SetStateAction } from 'react';
import React, { useState } from 'react';
import { Badge, Button, Input, Space, Tag } from 'antd';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './index.less';
import _ from 'lodash';

export type EditableTagProps = {
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
};

const EditableTag: React.FC<EditableTagProps> = (props) => {
  const { tags, setTags } = props;
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  return (
    <>
      <Space direction={'horizontal'} wrap={true} className={styles.tagList}>
        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            setInputVisible(true);
          }}
        >
          添加
        </Button>

        {inputVisible && (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            autoFocus={true}
            allowClear={true}
            placeholder="逗号分隔，回车保存"
            onBlur={() => {
              setInputValue('');
              setInputVisible(false);
            }}
            onPressEnter={(e) => {
              e.preventDefault();
              const params = inputValue
                .replace('，', ',')
                .split(',')
                .filter((val: any) => val);
              setTags(_.uniq<string>([...tags, ...params]));
              setInputValue('');
            }}
          />
        )}
        {tags?.map((tag) => (
          <Badge
            key={tag}
            className={styles.tagWrapper}
            count={
              <CloseCircleOutlined
                onClick={() => {
                  setTags(tags.filter((item) => tag !== item));
                }}
                style={{ color: 'rgb(199,199,199)' }}
              />
            }
          >
            <Tag className={styles.tagItem}>{tag}</Tag>
          </Badge>
        ))}
      </Space>
    </>
  );
};

export default EditableTag;
