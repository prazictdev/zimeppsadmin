export const useBidValidityPeriodFeeHelper = () => {
  const client = useSanctumClient();

  const getBidValidityPeriodFees = async () => {
    try {
      const data = await client('/api/v1/bid-validity-period-fees', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getBidValidityPeriodFee = async (id) => {
    try {
      const data = await client(`/api/v1/bid-validity-period-fees/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createBidValidityPeriodFee = async (payload) => {
    try {
      const data = await client('/api/v1/bid-validity-period-fees', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateBidValidityPeriodFee = async (id, payload) => {
    try {
      const data = await client(`/api/v1/bid-validity-period-fees/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteBidValidityPeriodFee = async (id) => {
    try {
      const data = await client(`/api/v1/bid-validity-period-fees/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getBidValidityPeriodFees,
    getBidValidityPeriodFee,
    createBidValidityPeriodFee,
    updateBidValidityPeriodFee,
    deleteBidValidityPeriodFee,
  };
};
