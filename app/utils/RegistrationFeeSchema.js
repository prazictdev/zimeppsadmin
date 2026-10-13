import * as yup from 'yup';

export const RegistrationFeeSchema = yup.object().shape({
  suppliergroup_id: yup.number().required('Supplier group is required').positive().integer(),
  locality: yup.string().required('Locality is required').oneOf(['local', 'foreign', 'all']),
  currency_id: yup.number().required('Currency is required').positive().integer(),
  fee: yup.number().required('Fee is required').min(0, 'Fee must be 0 or greater'),
});
