import {PlusOutlined} from '@ant-design/icons';
import {PageContainer} from '@ant-design/pro-layout';
import {Button} from 'antd';
import React, {useRef} from 'react';
import EnterpriseScript from './EnterpriseScript';
import styles from './index.less'

const ScriptLibrary: React.FC = () => {
  const enterpriseScriptRef = useRef<any>({})
  return (
    <div className={styles.scriptLibrary}>
      <PageContainer
        fixedHeader
        header={{
          title: '企业话术库',
        }} extra={[
        <Button
          type="dashed"
          icon={<PlusOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
          style={{marginRight: 6}}
          onClick={() => {
            enterpriseScriptRef.current.createEnterpriseScript()
          }}
        >
          新建话术
        </Button>
      ]}

      >
        <EnterpriseScript
          ref={enterpriseScriptRef}
        />
      </PageContainer>

    </div>
  );
};
export default ScriptLibrary
