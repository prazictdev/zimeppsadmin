import * as yup from 'yup';

export const NsplEditionSchema = yup.object({
  period: yup.string().required('Period is required').max(100),
  year: yup
    .number()
    .typeError('Year is required')
    .integer('Year must be a whole number')
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier')
    .required('Year is required'),
  quarter: yup
    .number()
    .typeError('Quarter is required')
    .integer('Quarter must be a whole number')
    .min(1, 'Quarter must be 1-4')
    .max(4, 'Quarter must be 1-4')
    .required('Quarter is required'),
  notes: yup.string().nullable().max(5000),
});

export const NsplDivisionSchema = yup.object({
  category_id: yup.number().typeError('Category is required').integer().required('Category is required'),
  code: yup.string().required('Code is required').max(10),
  name: yup.string().required('Name is required').max(255),
  sort_order: yup.number().nullable().integer().min(0).max(65535),
});

export const NsplSectionSchema = yup.object({
  division_id: yup.number().typeError('Division is required').integer().required('Division is required'),
  code: yup.string().required('Code is required').max(15),
  name: yup.string().required('Name is required').max(255),
  sort_order: yup.number().nullable().integer().min(0).max(65535),
});

export const NsplProductSchema = yup.object({
  section_id: yup.number().typeError('Section is required').integer().required('Section is required'),
  code: yup.string().required('Code is required').max(30),
  name: yup.string().required('Name is required').max(255),
  specifications: yup.string().nullable().max(5000),
  usd_price: yup
    .number()
    .nullable()
    .transform((v, original) => (original === '' || original === null ? null : v))
    .typeError('Price must be a number')
    .min(0, 'Price must be 0 or greater'),
  is_branded: yup.boolean().nullable(),
});
