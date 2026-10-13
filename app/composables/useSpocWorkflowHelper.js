export const useSpocWorkflowHelper = () => {
  const client = useSanctumClient();
  const request = async (url, options = {}) => {
    try { return { data: await client(url, options), error: null }; }
    catch (error) { return { data: null, error }; }
  };
  const submissions = '/api/v1/spoc-submissions';
  const agendas = '/api/v1/spoc-agendas';

  return {
    board: params => request(`${submissions}/board${params ? `?${new URLSearchParams(params)}` : ''}`),
    myAssigned: params => request(`${submissions}/my-assigned${params ? `?${new URLSearchParams(params)}` : ''}`),
    show: uuid => request(`${submissions}/${uuid}`),
    create: body => request(submissions, { method: 'POST', body }),
    assign: (uuid, body) => request(`${submissions}/${uuid}/assign`, { method: 'POST', body }),
    priority: (uuid, priority) => request(`${submissions}/${uuid}/priority`, { method: 'PUT', body: { priority } }),
    specialistReview: (uuid, body) => request(`${submissions}/${uuid}/specialist-review`, { method: 'POST', body }),
    managerReview: (uuid, body) => request(`${submissions}/${uuid}/manager-review`, { method: 'POST', body }),
    directorReview: (uuid, body) => request(`${submissions}/${uuid}/director-review`, { method: 'POST', body }),
    sittingDecision: (uuid, body) => request(`${submissions}/${uuid}/sitting-decision`, { method: 'POST', body }),
    closeRoundRobin: (uuid, comments) => request(`${submissions}/${uuid}/close-round-robin`, { method: 'POST', body: { comments } }),
    circulateRecord: (uuid, body) => request(`${submissions}/${uuid}/records`, { method: 'POST', body }),
    confirmRecord: (uuid, body) => request(`${submissions}/${uuid}/records/confirm`, { method: 'POST', body }),
    finalize: (uuid, comments) => request(`${submissions}/${uuid}/finalize`, { method: 'POST', body: { comments } }),
    agendas: () => request(agendas),
    agenda: uuid => request(`${agendas}/${uuid}`),
    createAgenda: body => request(agendas, { method: 'POST', body }),
    publishAgenda: uuid => request(`${agendas}/${uuid}/publish`, { method: 'POST' }),
    startAgenda: uuid => request(`${agendas}/${uuid}/start`, { method: 'POST' }),
    assignMembers: (caseUuid, members) => request(`/api/v1/spoc-cases/${caseUuid}/members`, { method: 'PUT', body: { members } }),
    declareConflict: (caseUuid, body) => request(`/api/v1/spoc-cases/${caseUuid}/conflict`, { method: 'PUT', body }),
    vote: (caseUuid, body) => request(`/api/v1/spoc-cases/${caseUuid}/vote`, { method: 'PUT', body }),
  };
};
