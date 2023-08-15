import React, { useEffect, useState } from 'react';
import type { ProFormSelectProps } from '@ant-design/pro-form/lib/components/Select';
import { Button, Form, Input, InputNumber, Popover } from 'antd';
import type { TableFormItem } from '@ant-design/pro-table/lib/components/Form/FormRender';

export type NumberRangeInputProps = {
  label: string;
  onChange?: (lowerLimit: number, upperLimit: number) => void;
  formRef?: TableFormItem<any>['formRef'];
} & ProFormSelectProps;

const NumberRangeInput: React.FC<NumberRangeInputProps> = (props) => {
  const { label, onChange, formRef } = props;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [lowerLimit, setLowerLimit] = useState<number>(0);
  const [upperLimit, setUpperLimit] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (formRef) {
      formRef?.current?.setFieldsValue({
        time_span_lower_limit: lowerLimit,
        time_span_upper_limit: upperLimit,
      });
    }
  }, [formRef, lowerLimit, onChange, upperLimit]);

  const CalInputValue = (a: number, b: number): string => {
    let value = '';
    if (!a && !b) {
      return '';
    }

    if (a) {
      value += a.toString();
    } else {
      value += '不限制';
    }

    value += '~';

    if (b) {
      value += b.toString();
    } else {
      value += '不限制';
    }

    return value;
  };

  return (
    <Popover
      placement='bottom'
      visible={modalVisible}
      onVisibleChange={setModalVisible}
      content={
        <div style={{ marginTop: 12 }}>
          <Form.Item name='time_span_lower_limit' label={`最小${label}`}>
            <InputNumber
              placeholder={`最小${label}`}
              onChange={(value) => {
                setLowerLimit(value);
                setInputValue(CalInputValue(value, upperLimit));
              }}
              value={lowerLimit}
              min={0}
            />
          </Form.Item>
          <Form.Item name='time_span_upper_limit' label={`最大${label}`}>
            <InputNumber
              placeholder={`最大${label}`}
              onChange={(value) => {
                setUpperLimit(value);
                setInputValue(CalInputValue(lowerLimit, value));
              }}
              value={upperLimit}
              min={0}
            />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ marginRight: 6 }}
              htmlType='button'
              onClick={() => {
                setInputValue('');
                formRef?.current?.setFieldsValue({
                  time_span_lower_limit: 0,
                  time_span_upper_limit: 0,
                });
              }}
            >
              重置
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              onClick={() => {
                if (onChange) {
                  onChange(lowerLimit, upperLimit);
                }
                setModalVisible(false);
                setInputValue(CalInputValue(lowerLimit, upperLimit));
                return true;
              }}
            >
              确定
            </Button>
          </Form.Item>
        </div>
      }
      trigger='click'
    >
      <Input
        placeholder={`请输入${label}范围`}
        value={inputValue}
        allowClear={true}
        onChange={(e) => {
          let val = e.target.value;
          setInputValue(val);
          if (val === '') {
            setLowerLimit(0);
            setUpperLimit(0);
            if (onChange) {
              onChange(0, 0);
            }
            return;
          }

          val = val.replaceAll(/[ \-~,，]+/g, '~');
          setInputValue(val);
          let start = Number.parseInt(val, 10) || 0;
          let end = 0;
          if (val.includes('~')) {
            const [part1, part2] = val.split('~');
            start = Number.parseInt(part1, 10) || 0;
            end = Number.parseInt(part2, 10) || 0;
          }
          setLowerLimit(start);
          setUpperLimit(end);
          if (onChange) {
            onChange(start, end);
          }
        }}
      />
    </Popover>
  );
};

export default NumberRangeInput;
