import * as yup from 'yup';

export const ProcurementClassFeeSchema = yup.object({
  currency_id: yup
    .number()
    .typeError('Currency is required')
    .integer()
    .required('Currency is required'),
  inventoryitem_id: yup
    .number()
    .typeError('Inventory item is required')
    .integer()
    .required('Inventory item is required'),
  amount: yup
    .number()
    .typeError('Amount is required')
    .min(0, 'Amount must be 0 or greater')
    .required('Amount is required'),
});
