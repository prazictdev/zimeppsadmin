export const useBidderSubmissionKeyFeeHelper = () => {
  const client = useSanctumClient();

  const getAll = async () => {
    try {
      const data = await client('/api/v1/bidder-submission-key-fees', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getOne = async (id) => {
    try {
      const data = await client(`/api/v1/bidder-submission-key-fees/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createOne = async (payload) => {
    try {
      const data = await client('/api/v1/bidder-submission-key-fees', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateOne = async (id, payload) => {
    try {
      const data = await client(`/api/v1/bidder-submission-key-fees/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteOne = async (id) => {
    try {
      const data = await client(`/api/v1/bidder-submission-key-fees/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getAll, getOne, createOne, updateOne, deleteOne };
};
