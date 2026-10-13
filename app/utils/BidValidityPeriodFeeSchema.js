import * as yup from 'yup';

const nullableNumber = () =>
  yup
    .number()
    .nullable()
    .transform((value, original) => (original === '' || original === null || Number.isNaN(value) ? null : value));

export const BidValidityPeriodFeeSchema = yup.object().shape({
  bid_validity_period: yup
    .number()
    .typeError('Validity period is required')
    .required('Validity period is required')
    .positive('Validity period must be greater than 0')
    .integer('Validity period must be a whole number of days')
    .max(3650, 'Validity period is too large'),
  locality: yup.string().required('Locality is required').oneOf(['local', 'foreign', 'all']),
  currency_id: yup
    .number()
    .typeError('Currency is required')
    .required('Currency is required')
    .positive()
    .integer(),
  min_amount: yup
    .number()
    .typeError('Lower bound is required')
    .required('Lower bound is required')
    .min(0, 'Lower bound must be 0 or greater'),
  max_amount: nullableNumber().moreThan(yup.ref('min_amount'), 'Upper bound must be greater than the lower bound'),
  fee_type: yup.string().required().oneOf(['flat', 'percentage']),
  fee: nullableNumber().when('fee_type', {
    is: 'flat',
    then: (s) => s.required('Fee is required').min(0, 'Fee must be 0 or greater'),
  }),
  fee_percentage: nullableNumber().when('fee_type', {
    is: 'percentage',
    then: (s) => s.required('Percentage is required').min(0).max(100, 'Percentage cannot exceed 100'),
  }),
  extension_days: nullableNumber().min(1, 'Extension days must be at least 1'),
  extension_percentage: nullableNumber().min(0).max(100, 'Percentage cannot exceed 100'),
  description: yup.string().nullable(),
});
