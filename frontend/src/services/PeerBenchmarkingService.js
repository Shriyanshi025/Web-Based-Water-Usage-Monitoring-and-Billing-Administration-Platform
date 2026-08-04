import api from './api';

const PeerBenchmarkingService = {
  getMyBenchmark: async () => {
    const response = await api.get('/peer-benchmarking/me');
    return response.data;
  },
};

export default PeerBenchmarkingService;
