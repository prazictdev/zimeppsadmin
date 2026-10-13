export const useProcurementClassHelper = () => {
  const client = useSanctumClient();

  const getProcurementClasses = async () => {
    try {
      const data = await client('/api/v1/procurement-classes/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getProcurementClass = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-classes/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createProcurementClass = async (payload) => {
    try {
      const data = await client('/api/v1/procurement-classes', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateProcurementClass = async (id, payload) => {
    try {
      const data = await client(`/api/v1/procurement-classes/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveProcurementClass = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-classes/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  // ─── Thresholds ──────────────────────────────────────────────────────────
  const getThresholdsByClass = async (classId) => {
    try {
      const data = await client(`/api/v1/procurement-classes/${classId}/thresholds`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createThreshold = async (payload) => {
    try {
      const data = await client('/api/v1/procurement-class-thresholds', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateThreshold = async (id, payload) => {
    try {
      const data = await client(`/api/v1/procurement-class-thresholds/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteThreshold = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-class-thresholds/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  // ─── Fees ────────────────────────────────────────────────────────────────
  const getFeesByClass = async (classId) => {
    try {
      const data = await client(`/api/v1/procurement-classes/${classId}/fees`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createFee = async (payload) => {
    try {
      const data = await client('/api/v1/procurement-class-fees', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateFee = async (id, payload) => {
    try {
      const data = await client(`/api/v1/procurement-class-fees/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteFee = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-class-fees/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getProcurementClasses,
    getProcurementClass,
    createProcurementClass,
    updateProcurementClass,
    archiveProcurementClass,
    getThresholdsByClass,
    createThreshold,
    updateThreshold,
    deleteThreshold,
    getFeesByClass,
    createFee,
    updateFee,
    deleteFee,
  };
};
