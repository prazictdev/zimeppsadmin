import * as yup from 'yup';

export const InventoryItemSchema = yup.object({
  name: yup.string().required('Name is required').max(255, 'Name must be at most 255 characters'),
  glcode: yup.string().required('GL Code is required').max(100, 'GL Code must be at most 100 characters'),
  status: yup
    .string()
    .oneOf(['ACTIVE', 'ARCHIVED'], 'Status must be ACTIVE or ARCHIVED')
    .required('Status is required'),
});
