import * as yup from 'yup';

export const AdministrationFeeSchema = yup.object().shape({
  participant: yup
    .string()
    .required('Participant is required')
    .oneOf(['Domestic', 'International']),
  procurementgroup_id: yup
    .number()
    .typeError('Procurement group is required')
    .required('Procurement group is required')
    .positive()
    .integer(),
  currency_id: yup
    .number()
    .typeError('Currency is required')
    .required('Currency is required')
    .positive()
    .integer(),
  amount: yup
    .number()
    .typeError('Amount is required')
    .required('Amount is required')
    .min(0, 'Amount must be 0 or greater'),
  description: yup.string().nullable(),
});
