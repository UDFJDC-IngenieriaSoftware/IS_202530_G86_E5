import api from '../config/api.js';

/**
 * Servicio de grupos
 */
export const groupService = {
  /**
   * Obtiene todos los grupos
   */
  async getAll() {
    const response = await api.get('/groups');
    return response.data;
  },

  /**
   * Obtiene un grupo por ID
   */
  async getById(id) {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo grupo
   */
  async create(data) {
    const response = await api.post('/groups', data);
    return response.data;
  },

  /**
   * Invita un usuario a un grupo
   */
  async invite(groupId, email) {
    const response = await api.post(`/groups/${groupId}/invite`, { email });
    return response.data;
  },

  /**
   * Responde a una invitación
   */
  async respondToInvitation(invitationId, accept) {
    const response = await api.post(`/groups/invitations/${invitationId}/respond`, {
      accept,
    });
    return response.data;
  },

  /**
   * Propone una modificación
   */
  async proposeModification(groupId, modificationType, newValue) {
    const response = await api.post(`/groups/${groupId}/modifications`, {
      modification_type: modificationType,
      new_value: newValue,
    });
    return response.data;
  },

  /**
   * Responde a una modificación
   */
  async respondToModification(modificationId, approve) {
    const response = await api.post(
      `/groups/modifications/${modificationId}/respond`,
      { approve }
    );
    return response.data;
  },
};



