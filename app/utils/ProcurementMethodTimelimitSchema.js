import * as yup from 'yup';

const optionalDays = yup
  .number()
  .nullable()
  .integer('Days must be a whole number')
  .min(0, 'Days must be 0 or more')
  .max(5000, 'Days must be 5000 or less')
  .transform((v, orig) => (orig === '' || orig === null || orig === undefined ? null : Number(orig)));

export const ProcurementMethodTimelimitSchema = yup.object({
  procurementmethod_id: yup.number().required('Procurement method is required').integer().positive(),
  procurementgroup_id: yup.number().required('Procurement group is required').integer().positive(),
  minimum_advertising_days: optionalDays,
  minimum_cycle_days: optionalDays,
  minimum_lead_days: optionalDays,
  notes: yup.string().nullable().max(5000),
});
