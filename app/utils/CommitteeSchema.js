import * as yup from 'yup';

export const CommitteeSchema = yup.object({
  name: yup.string().trim().required('Name is required').max(255, 'Name must be at most 255 characters'),
  qualifications_required: yup.boolean().required(),
  work_history_required: yup.boolean().required(),
});
