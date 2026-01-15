import { api } from './api';

export const sparePartsService = {
  getAll: () => api.get('/spare-parts'),
  getById: (id) => api.get(`/spare-parts/${id}`),
  create: (data) => api.post('/spare-parts', data),
  update: (id, data) => api.put(`/spare-parts/${id}`, data),
  delete: (id) => api.delete(`/spare-parts/${id}`),
  getStock: () => api.get('/spare-parts-stock'),
  updateStock: (id, data) => api.put(`/spare-parts-stock/${id}`, data),
};

export const materialsService = {
  getAll: () => api.get('/materials'),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
};

export const maintenanceTypesService = {
  getAll: () => api.get('/maintenance-types'),
  getById: (id) => api.get(`/maintenance-types/${id}`),
  create: (data) => api.post('/maintenance-types', data),
  update: (id, data) => api.put(`/maintenance-types/${id}`, data),
  delete: (id) => api.delete(`/maintenance-types/${id}`),
};

export default {
  sparePartsService,
  materialsService,
  maintenanceTypesService,
};
