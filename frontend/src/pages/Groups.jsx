import { useState, useEffect } from 'react';
import { groupService } from '../services/groupService.js';
import { notificationService } from '../services/notificationService.js';
import { getSocket } from '../config/socket.js';
import './Groups.css';

/**
 * Página de gestión de grupos
 */
export const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [modificationData, setModificationData] = useState({
    modification_type: 'target_amount',
    new_value: '',
  });

  useEffect(() => {
    loadData();

    // Socket.IO para actualizaciones en tiempo real
    const socket = getSocket();
    socket.on('group:invitation', handleGroupUpdate);
    socket.on('group:invitation_response', handleGroupUpdate);
    socket.on('group:modification_proposed', handleGroupUpdate);
    socket.on('group:modification_response', handleGroupUpdate);

    return () => {
      socket.off('group:invitation');
      socket.off('group:invitation_response');
      socket.off('group:modification_proposed');
      socket.off('group:modification_response');
    };
  }, []);

  const handleGroupUpdate = () => {
    loadGroups();
    if (selectedGroup) {
      loadGroupDetails(selectedGroup.id);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadGroups(), loadNotifications()]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll(true);
      setNotifications(data);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const loadGroupDetails = async (groupId) => {
    try {
      const data = await groupService.getById(groupId);
      setSelectedGroup(data);
    } catch (error) {
      console.error('Error cargando detalles del grupo:', error);
      alert(error.response?.data?.error || 'Error al cargar grupo');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const group = await groupService.create(createFormData);
      setShowCreateModal(false);
      setCreateFormData({ name: '', description: '', target_amount: '' });
      await loadGroups();
      await loadGroupDetails(group.id);
      setSelectedGroup(group);
    } catch (error) {
      console.error('Error creando grupo:', error);
      alert(error.response?.data?.error || 'Error al crear grupo');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await groupService.invite(selectedGroup.id, inviteEmail);
      setShowInviteModal(false);
      setInviteEmail('');
      alert('Invitación enviada');
      await loadGroupDetails(selectedGroup.id);
    } catch (error) {
      console.error('Error invitando usuario:', error);
      alert(error.response?.data?.error || 'Error al enviar invitación');
    }
  };

  const handleRespondToInvitation = async (notification, accept) => {
    try {
      const invitationId = notification.data?.invitationId;
      if (!invitationId) return;

      await groupService.respondToInvitation(invitationId, accept);
      await notificationService.markAsRead(notification.id);
      await loadNotifications();
      await loadGroups();
      if (accept) {
        alert('Invitación aceptada');
      }
    } catch (error) {
      console.error('Error respondiendo invitación:', error);
      alert('Error al procesar invitación');
    }
  };

  const handleProposeModification = async (e) => {
    e.preventDefault();
    try {
      await groupService.proposeModification(
        selectedGroup.id,
        modificationData.modification_type,
        modificationData.new_value
      );
      setShowModificationModal(false);
      setModificationData({ modification_type: 'target_amount', new_value: '' });
      alert('Modificación propuesta. Esperando aprobación unánime.');
      await loadGroupDetails(selectedGroup.id);
    } catch (error) {
      console.error('Error proponiendo modificación:', error);
      alert(error.response?.data?.error || 'Error al proponer modificación');
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="groups-page">
      <div className="page-header">
        <h1>Grupos Colaborativos</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Nuevo Grupo
        </button>
      </div>

      {/* Notificaciones */}
      {notifications.length > 0 && (
        <div className="notifications-section">
          <h2>Notificaciones</h2>
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-card">
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
              </div>
              {notification.type === 'group_invitation' && (
                <div className="notification-actions">
                  <button
                    className="btn-accept"
                    onClick={() => handleRespondToInvitation(notification, true)}
                  >
                    Aceptar
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRespondToInvitation(notification, false)}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lista de grupos */}
      <div className="groups-list">
        {groups.length === 0 ? (
          <p className="no-data">No perteneces a ningún grupo</p>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className={`group-card ${
                selectedGroup?.id === group.id ? 'selected' : ''
              }`}
              onClick={() => loadGroupDetails(group.id)}
            >
              <h3>{group.name}</h3>
              <p className="group-description">
                {group.description || 'Sin descripción'}
              </p>
              <div className="group-meta">
                <span>Rol: {group.role}</span>
                {group.target_amount && (
                  <span>
                    Meta: ${parseFloat(group.target_amount).toLocaleString('es-ES')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detalles del grupo seleccionado */}
      {selectedGroup && (
        <div className="group-details">
          <h2>{selectedGroup.name}</h2>
          <p>{selectedGroup.description || 'Sin descripción'}</p>

          <div className="group-actions">
            {selectedGroup.userRole === 'admin' && (
              <>
                <button
                  className="btn-primary"
                  onClick={() => setShowInviteModal(true)}
                >
                  Invitar Usuario
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowModificationModal(true)}
                >
                  Proponer Modificación
                </button>
              </>
            )}
          </div>

          <div className="group-members">
            <h3>Miembros ({selectedGroup.members.length})</h3>
            {selectedGroup.members.map((member) => (
              <div key={member.id} className="member-card">
                <span>{member.name}</span>
                <span className="member-role">{member.role}</span>
              </div>
            ))}
          </div>

          <div className="group-transactions">
            <h3>Transacciones del Grupo</h3>
            {selectedGroup.transactions.length === 0 ? (
              <p className="no-data">No hay transacciones</p>
            ) : (
              <div className="transactions-list">
                {selectedGroup.transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div>
                      <span className="transaction-user">
                        {selectedGroup.members.find(
                          (m) => m.user_id === transaction.user_id
                        )?.name || 'Usuario'}
                      </span>
                      <span className="transaction-description">
                        {transaction.description || 'Sin descripción'}
                      </span>
                    </div>
                    <span
                      className={`amount ${
                        transaction.type === 'income' ? 'positive' : 'negative'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}$
                      {parseFloat(transaction.amount).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal crear grupo */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo Grupo</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Meta Colectiva (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={createFormData.target_amount}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      target_amount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal invitar */}
      {showInviteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowInviteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Invitar Usuario</h2>
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label>Email del usuario</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="usuario@email.com"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal proponer modificación */}
      {showModificationModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModificationModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Proponer Modificación</h2>
            <form onSubmit={handleProposeModification}>
              <div className="form-group">
                <label>Tipo de Modificación</label>
                <select
                  value={modificationData.modification_type}
                  onChange={(e) =>
                    setModificationData({
                      ...modificationData,
                      modification_type: e.target.value,
                    })
                  }
                  required
                >
                  <option value="target_amount">Meta Colectiva</option>
                  <option value="name">Nombre</option>
                  <option value="description">Descripción</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nuevo Valor</label>
                <input
                  type={
                    modificationData.modification_type === 'target_amount'
                      ? 'number'
                      : 'text'
                  }
                  step={
                    modificationData.modification_type === 'target_amount'
                      ? '0.01'
                      : undefined
                  }
                  value={modificationData.new_value}
                  onChange={(e) =>
                    setModificationData({
                      ...modificationData,
                      new_value: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModificationModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Proponer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



