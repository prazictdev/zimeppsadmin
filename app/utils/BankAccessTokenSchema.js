import * as yup from 'yup';

export const BankAccessTokenSchema = yup.object({
  bank_id: yup.number().required('Bank is required').integer(),
  status: yup
    .string()
    .oneOf(['ACTIVE', 'BLOCKED'], 'Status must be ACTIVE or BLOCKED')
    .required('Status is required'),
});

export const BankAccessTokenUpdateSchema = yup.object({
  status: yup
    .string()
    .oneOf(['ACTIVE', 'BLOCKED'], 'Status must be ACTIVE or BLOCKED')
    .required('Status is required'),
});
