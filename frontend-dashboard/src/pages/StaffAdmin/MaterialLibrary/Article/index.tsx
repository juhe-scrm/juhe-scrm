import React, {useState} from 'react';
import {Button, Input} from 'antd'
import empty from '@/assets/empty.png'
import styles from './index.less'

const Article: React.FC = () =>  {
  const [currentArticalType,setCurrentArticalType] = useState(1)
  const [wxArticles] = useState([])
  const [scrmArticles] = useState([])

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.tabButtonConttainer}>
          <Button
            type={currentArticalType===0?'primary':'default'}
            onClick={()=>setCurrentArticalType(0)}
          >公众号素材</Button>
          <Button
            type={currentArticalType===1?'primary':'default'}
            onClick={()=>setCurrentArticalType(1)}
          >小橘有客文章素材</Button>
        </div>
        <div className={styles.contentContainer}>
          {
            currentArticalType===1 &&<div>
              <div className={styles.topNav}>
                <div className={styles.topNavTitle}>
                  文章素材(共{}篇)
                </div>
                <div className={styles.topNavOperator}>
                  <Input.Search placeholder={'请输入文章标题'} width={200}/>
                  <Button type={'primary'}>新建素材</Button>
                </div>
              </div>
                {
                  scrmArticles.length===0 ? <div className={styles.noneArticles}>
                    <img src={empty}/>
                    <p>暂无文章素材</p>
                    <Button type={"primary"}>新建素材</Button>
                  </div>
                    :
                  <div className={styles.articles}>
                  </div>
                }
            </div>
          }
          {
            currentArticalType===0 &&<div>
              {
                wxArticles.length===0 ? <div className={styles.noneArticles}>
                    <img src={empty}/>
                    <p>暂无文章素材</p>
                    <p>可添加公众号，同步公众号文章素材</p>
                    <Button type={"primary"}>添加公众号</Button>
                  </div>
                  :
                  <div className={styles.articles}>
                  </div>
              }
            </div>

          }
        </div>


      </div>
    </div>
  );
}
export default Article;

