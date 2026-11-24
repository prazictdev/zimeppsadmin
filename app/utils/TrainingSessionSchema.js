import * as yup from 'yup';

export const TrainingSessionSchema = yup.object({
  session_name: yup
    .string()
    .trim()
    .min(3, 'Session name must be at least 3 characters.')
    .max(150, 'Session name cannot exceed 150 characters.')
    .required('Session name is required.'),
  number_of_users: yup
    .number()
    .typeError('Number of test users is required.')
    .integer('Number of test users must be a whole number.')
    .min(1, 'Generate at least one test user.')
    .max(100, 'A session can contain at most 100 test users.')
    .required('Number of test users is required.'),
  validity_period_days: yup
    .number()
    .typeError('Validity period is required.')
    .integer('Validity period must be a whole number of days.')
    .min(1, 'Validity period must be at least one day.')
    .max(365, 'Validity period cannot exceed 365 days.')
    .required('Validity period is required.'),
});
