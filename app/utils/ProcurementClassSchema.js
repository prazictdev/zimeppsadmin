import * as yup from 'yup';

export const ProcurementClassSchema = yup.object({
  name: yup.string().required('Name is required').max(255, 'Name must be at most 255 characters'),
  status: yup.string().oneOf(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});
