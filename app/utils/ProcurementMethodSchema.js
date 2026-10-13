import * as yup from 'yup';

export const ProcurementMethodSchema = yup.object({
  code: yup.string().required('Code is required').max(50, 'Code must be at most 50 characters'),
  name: yup.string().required('Name is required').max(255, 'Name must be at most 255 characters'),
  can_request_bidbond: yup.boolean().default(false),
  subject_to_spoc: yup.boolean().default(false),
});
