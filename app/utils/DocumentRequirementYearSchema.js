import * as yup from 'yup';

export const DocumentRequirementYearSchema = yup.object({
  year: yup
    .number()
    .typeError('Year is required')
    .integer('Year must be a whole number')
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier')
    .required('Year is required'),
  label: yup.string().nullable().max(255),
  effective_from: yup.string().nullable(),
  effective_to: yup
    .string()
    .nullable()
    .test('after-from', 'Effective-to must be on/after effective-from', function (value) {
      const from = this.parent.effective_from;
      if (!from || !value) return true;
      return new Date(value) >= new Date(from);
    }),
  notes: yup.string().nullable().max(5000),
});

export const DocumentRequirementYearItemSchema = yup.object({
  document_id: yup.number().typeError('Document is required').integer().required('Document is required'),
  notes: yup.string().nullable().max(2000),
  sort_order: yup.number().nullable().integer().min(0).max(65535),
});
