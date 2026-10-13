import * as yup from 'yup';

export const SbdTemplateSchema = yup.object().shape({
  procurementgroup_id: yup
    .number()
    .typeError('Procurement group is required')
    .required('Procurement group is required')
    .positive()
    .integer(),
  name: yup.string().required('Name is required').max(255),
});
