import Paragraph from 'antd/es/typography/Paragraph';
import React, {Fragment, useState} from 'react';


export type ExpandableParagraphProps = {
  rows: number; // 列数
  content: string; // 文字内容
}
// 展开折叠文字
export const ExpandableParagraph: React.FC<ExpandableParagraphProps> = (props) => {
  const {rows, content} = props;
  const [key, setKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  return (
    <Fragment>
      <div key={key}>
        <Paragraph ellipsis={{
          rows,
          expandable: true,
          onExpand: () => {
            setExpanded(true)
          }
        }}>
          {content}
        </Paragraph>
      </div>
      {expanded && <a onClick={(e) => {
        e.preventDefault();
        setKey(key + 1)
        setExpanded(false)
      }}>折叠</a>}
    </Fragment>
  );
};

export default ExpandableParagraph;
