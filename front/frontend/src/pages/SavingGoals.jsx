import { useState, useEffect } from 'react';
import { savingGoalService } from '../services/savingGoalService.js';
import { groupService } from '../services/groupService.js';
import { authService } from '../services/authService.js';
import './SavingGoals.css';

/**
 * Página de gestión de metas de ahorro
 */
export const SavingGoals = () => {
  const currentUser = authService.getCurrentUser();

  const [goals, setGoals] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    type: 'personal',
    group_id: '',
    description: '',
  });

  const [transactionData, setTransactionData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadGoals();
    loadGroups();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await savingGoalService.getAll();
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando metas:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await groupService.getAll();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
  };

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount,
        type: goal.type,
        group_id: goal.group_id || '',
        description: goal.description || '',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        target_amount: '',
        type: 'personal',
        group_id: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      target_amount: '',
      type: 'personal',
      group_id: '',
      description: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await savingGoalService.update(editingGoal.id, {
          name: formData.name,
          target_amount: parseFloat(formData.target_amount),
          description: formData.description,
        });
      } else {
        await savingGoalService.create({
          name: formData.name,
          target_amount: parseFloat(formData.target_amount),
          type: formData.type,
          group_id: formData.type === 'group' ? parseInt(formData.group_id) : null,
          description: formData.description,
        });
      }
      loadGoals();
      handleCloseModal();
    } catch (error) {
      console.error('Error guardando meta:', error);
      alert('Error al guardar la meta');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta meta?')) {
      try {
        await savingGoalService.delete(id);
        loadGoals();
      } catch (error) {
        console.error('Error eliminando meta:', error);
        alert('Error al eliminar la meta');
      }
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(transactionData.amount);
    const currentAmount = parseFloat(selectedGoal.current_amount);
    const targetAmount = parseFloat(selectedGoal.target_amount);
    const newTotal = currentAmount + amount;
    const exceedsGoal = newTotal > targetAmount;
    const completesGoal = currentAmount < targetAmount && newTotal >= targetAmount;

    // Mostrar confirmación si sobrepasa la meta
    if (exceedsGoal) {
      const excess = (newTotal - targetAmount).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const confirmed = window.confirm(
        `⚠️ Este aporte sobrepasará tu meta de ahorro por $${excess}.\n\n` +
        `Meta: $${targetAmount.toLocaleString('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}\n` +
        `Total después del aporte: $${newTotal.toLocaleString('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}\n\n` +
        `¿Deseas continuar?`
      );

      if (!confirmed) return;
    }

    try {
      await savingGoalService.addTransaction(selectedGoal.id, {
        amount,
        description: transactionData.description,
        date: transactionData.date,
      });

      // Mostrar felicitaciones si se completó la meta
      if (completesGoal) {
        setTimeout(() => {
          alert(
            `🎉 ¡Felicidades! 🎉\n\n` +
            `¡Has completado tu meta de ahorro "${selectedGoal.name}"!\n\n` +
            `Meta: $${targetAmount.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}\n` +
            `Total ahorrado: $${newTotal.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          );
        }, 500);
      }

      setTransactionData({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      setShowTransactionModal(false);
      loadGoals();
    } catch (error) {
      console.error('Error agregando transacción:', error);
      alert('Error al agregar transacción');
    }
  };

  const handleOpenGoalDetail = (goal) => {
    setSelectedGoal(goal);
    setShowTransactionModal(true);
  };

  const getGoalProgress = (goal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getGoalGroupName = (goal) => {
    if (goal.type === 'personal') return 'Personal';
    const group = groups.find(g => g.id === goal.group_id);
    return group ? group.name : `Grupo ${goal.group_id}`;
  };

  return (
    <div className="saving-goals-page">
      <div className="page-header">
        <h1>Metas de Ahorro</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Nueva Meta
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando metas...</div>
      ) : goals.length === 0 ? (
        <div className="no-data">No tienes metas de ahorro aún</div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <h3>{goal.name}</h3>
                <span className={`goal-type ${goal.type}`}>{getGoalGroupName(goal)}</span>
              </div>

              <p className="goal-description">{goal.description || 'Sin descripción'}</p>

              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getGoalProgress(goal)}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  ${parseFloat(goal.current_amount).toLocaleString('es-ES', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} / ${parseFloat(goal.target_amount).toLocaleString('es-ES', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>

              <div className="goal-actions">
                <button 
                  className="btn-add-transaction"
                  onClick={() => handleOpenGoalDetail(goal)}
                >
                  + Agregar Aporte
                </button>
                <button 
                  className="btn-edit"
                  onClick={() => handleOpenModal(goal)}
                >
                  Editar
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(goal.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de crear/editar meta */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingGoal ? 'Editar Meta' : 'Nueva Meta de Ahorro'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Ej: Viaje a playa"
                  required
                />
              </div>

              <div className="form-group">
                <label>Monto Objetivo</label>
                <input
                  type="number"
                  name="target_amount"
                  value={formData.target_amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              {!editingGoal && (
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                  >
                    <option value="personal">Personal</option>
                    <option value="group">Grupal</option>
                  </select>
                </div>
              )}

              {!editingGoal && formData.type === 'group' && (
                <div className="form-group">
                  <label>Grupo</label>
                  <select
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Selecciona un grupo</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Descripción (opcional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe tu meta..."
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingGoal ? 'Actualizar' : 'Crear'} Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de agregar transacción */}
      {showTransactionModal && selectedGoal && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Agregar Aporte a "{selectedGoal.name}"</h2>
            
            <div className="transaction-info-box">
              <p><strong>Meta:</strong> ${parseFloat(selectedGoal.target_amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Ahorrado:</strong> ${parseFloat(selectedGoal.current_amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Falta:</strong> ${Math.max(0, parseFloat(selectedGoal.target_amount) - parseFloat(selectedGoal.current_amount)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            {transactionData.amount && parseFloat(transactionData.amount) > 0 && (
              <div className={`amount-preview ${parseFloat(transactionData.amount) + parseFloat(selectedGoal.current_amount) > parseFloat(selectedGoal.target_amount) ? 'warning' : 'normal'}`}>
                <p><strong>Total después del aporte:</strong> ${(parseFloat(transactionData.amount) + parseFloat(selectedGoal.current_amount)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                {parseFloat(transactionData.amount) + parseFloat(selectedGoal.current_amount) > parseFloat(selectedGoal.target_amount) && (
                  <p className="warning-text">⚠️ Este aporte sobrepasa la meta en ${(parseFloat(transactionData.amount) + parseFloat(selectedGoal.current_amount) - parseFloat(selectedGoal.target_amount)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                )}
              </div>
            )}

            <form onSubmit={handleAddTransaction}>
              <div className="form-group">
                <label>Monto</label>
                <input
                  type="number"
                  value={transactionData.amount}
                  onChange={e => setTransactionData({...transactionData, amount: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción (opcional)</label>
                <input
                  type="text"
                  value={transactionData.description}
                  onChange={e => setTransactionData({...transactionData, description: e.target.value})}
                  placeholder="Ej: Aporte mensual"
                />
              </div>

              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={transactionData.date}
                  onChange={e => setTransactionData({...transactionData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowTransactionModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Agregar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingGoals;