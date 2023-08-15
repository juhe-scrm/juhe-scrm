import { LeftOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { history } from 'umi';

const MemberDetailInfo = (props: any) => {
    console.log(props.location.query)
    return (
        <PageContainer
            onBack={() => history.goBack()}
            backIcon={<LeftOutlined />}
            header={{
                title: '成员详情',
            }}
        >
        </PageContainer>
    )
}

export default MemberDetailInfo
