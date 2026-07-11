import api from './api';

export const getCommunities = () => {
    return api.get('/lookups/communities');
};

export const getBlocks = (communityId) => {
    return api.get(`/lookups/blocks/${communityId}`);
};

export const getUnits = (blockId) => {
    return api.get(`/lookups/units/${blockId}`);
};
