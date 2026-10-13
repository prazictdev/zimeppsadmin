import * as yup from 'yup';

export const ProcurementClassThresholdSchema = yup.object({
  procurementgroup_id: yup
    .number()
    .typeError('Procurement group is required')
    .integer()
    .required('Procurement group is required'),
  procurementmethod_id: yup
    .number()
    .typeError('Procurement method is required')
    .integer()
    .required('Procurement method is required'),
  currency_id: yup.number().nullable().integer(),
  threshold_amount: yup
    .number()
    .typeError('Threshold amount is required')
    .min(0, 'Threshold must be 0 or greater')
    .required('Threshold amount is required'),
  notes: yup.string().nullable().max(2000),
});
