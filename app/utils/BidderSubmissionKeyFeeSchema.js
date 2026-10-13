import * as yup from 'yup';

export const BidderSubmissionKeyFeeSchema = yup.object({
  bidder_type: yup.string().oneOf(['DOMESTIC', 'FOREIGN']).required('Bidder type is required'),
  currency_id: yup.number().typeError('Currency is required').required('Currency is required'),
  inventoryitem_id: yup.number().typeError('Inventory item is required').required('Inventory item is required'),
  amount: yup.number().typeError('Amount must be a number').min(0, 'Amount cannot be negative').required('Amount is required'),
  description: yup.string().max(500).nullable(),
  effective_from: yup.string().required('Effective from is required'),
  effective_to: yup
    .string()
    .nullable()
    .test('after-from', 'Effective to must be after effective from', function (value) {
      if (!value) return true;
      const from = this.parent.effective_from;
      if (!from) return true;
      return new Date(value) > new Date(from);
    }),
  source_si: yup.string().max(100).nullable(),
});
