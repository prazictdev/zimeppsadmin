import { defineStore } from 'pinia';

export const useCustomerTypeSupplierCategoryStore = defineStore('customertypesuppliercategory', () => {
  const toast = useToast();
  const { create: createHelper, remove: removeHelper } = useCustomerTypeSupplierCategoryHelper();

  const create = async (payload) => {
    const { ok, error } = await createHelper(payload);
    if (!ok) {
      toast.error({
        title: 'Failed to assign supplier category',
        message: error ?? 'Assignment failed.',
        position: 'topRight',
        layout: 2,
      });
    }
    return ok;
  };

  const remove = async (id) => {
    const { ok, error } = await removeHelper(id);
    if (!ok) {
      toast.error({
        title: 'Failed to remove supplier category',
        message: error ?? 'Removal failed.',
        position: 'topRight',
        layout: 2,
      });
    }
    return ok;
  };

  return { create, remove };
});
