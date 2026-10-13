import * as yup from 'yup'

export const PaymentChannelSchema = yup.object({
  code: yup
    .string()
    .required('Code is required')
    .max(50, 'Code must be at most 50 characters')
    .matches(/^[a-z0-9_]+$/, 'Code must be lowercase letters, numbers, or underscores'),
  name: yup.string().required('Name is required').max(255, 'Name must be at most 255 characters'),
  is_active: yup.boolean().default(true),
})
