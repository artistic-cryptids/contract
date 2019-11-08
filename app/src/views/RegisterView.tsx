import * as React from 'react';

import Register from '../components/Register';
import { CommonProps } from '../helper/eth';

const RegisterView: React.FC<CommonProps> = (props) => {
  const { contracts, accounts } = props;
  return <Register contracts={contracts} accounts={accounts}/>;
};

export default RegisterView;
