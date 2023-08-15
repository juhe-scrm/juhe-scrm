import React, {useState} from 'react'
import { Form, Input,DatePicker} from 'antd';
import styles from './index.less'

interface TableInputProps {
  name: string;
  inputType?: string;
  defaultValue?: any;
}

const TableInput: React.FC<TableInputProps> = (props) => {
  const {defaultValue} = props
  const [value] = useState(defaultValue)

  const renderInput = () => {
    if(props.name === 'birthday') {
      return <DatePicker/>
    }
    return <Input value={value} placeholder={'请输入'}/>
  }

  return <div className={styles.tableInput} style={{height:'100%'}}>
      <Form.Item name={props.name}>
        {renderInput()}
      </Form.Item>
    </div>

}
export default TableInput;
