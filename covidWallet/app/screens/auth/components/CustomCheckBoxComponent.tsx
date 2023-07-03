import React, { useState } from 'react';
import { CheckBox, Icon } from '@rneui/themed';

type CheckboxComponentProps = {};
const CustomCheckBoxComponent: React.FunctionComponent<CheckboxComponentProps> = () => {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);

  return (
    <>
      <CheckBox center title="Click Here" checked={check1} onPress={() => setCheck1(!check1)} />

      <CheckBox
        center
        title="Click Here"
        checkedIcon="dot-circle-o"
        uncheckedIcon="circle-o"
        checked={check2}
        onPress={() => setCheck2(!check2)}
      />

      <CheckBox
        center
        title={`Click Here to ${check1 ? 'Remove' : 'Add'} This Item`}
        iconRight
        iconType="material"
        checkedIcon="clear"
        uncheckedIcon="add"
        checkedColor="red"
        checked={check1}
        onPress={() => setCheck1(!check1)}
      />

      <CheckBox
        center
        checkedIcon={
          <Icon
            name="radio-button-checked"
            type="material"
            color="green"
            size={25}
            iconStyle={{ marginRight: 10 }}
          />
        }
        uncheckedIcon={
          <Icon
            name="radio-button-unchecked"
            type="material"
            color="grey"
            size={25}
            iconStyle={{ marginRight: 10 }}
          />
        }
        checked={check2}
        onPress={() => setCheck2(!check2)}
      />
    </>
  );
};

export default CustomCheckBoxComponent;
