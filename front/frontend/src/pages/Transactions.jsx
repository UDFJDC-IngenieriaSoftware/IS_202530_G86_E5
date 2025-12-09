import { useState, useEffect, useRef } from 'react';
import { transactionService } from '../services/transactionService.js';
import { categoryService } from '../services/categoryService.js';
import { getSocket } from '../config/socket.js';
import { authService } from "../services/authService.js";
import { groupService } from '../services/groupService.js';
import './Transactions.css';

/**
 * Página de gestión de transacciones
 */
export const Transactions = () => {
  const currentUser = authService.getCurrentUser();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // CONTROL: owner_type y owner_id
  const [ownerType, setOwnerType] = useState("user");
  const [ownerId, setOwnerId] = useState(currentUser?.id || null);

  // FORM DATA
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'expense',
  });

  const [filterMode, setFilterMode] = useState('all'); // all | user | groups

  const categoryRefs = useRef({});
  const infoContainerRef = useRef(null);

  useEffect(() => {
    loadCategories();
    loadGroups();

    const socket = getSocket();
    socket.on('transaction:created', loadTransactions);
    socket.on('transaction:updated', loadTransactions);
    socket.on('transaction:deleted', loadTransactions);

    return () => {
      socket.off('transaction:created');
      socket.off('transaction:updated');
      socket.off('transaction:deleted');
    };
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filterMode]);

  useEffect(() => {
    // Pequeño delay para asegurar que el DOM esté renderizado
    const timer = setTimeout(() => {
      let maxWidth = 0;

      // PASO 1: Encontrar el ancho máximo de TODAS las transacciones
      Object.keys(categoryRefs.current).forEach(id => {
        const container = categoryRefs.current[id];
        if (container) {
          const category = container.querySelector('.transaction-category');
          const badge = container.querySelector('.tx-owner-badge');

          if (category && badge) {
            // Resetear temporalmente para obtener el ancho natural
            category.style.width = 'auto';
            badge.style.width = 'auto';

            const categoryWidth = category.offsetWidth;
            const badgeWidth = badge.offsetWidth;
            const itemMaxWidth = Math.max(categoryWidth, badgeWidth);
            maxWidth = Math.max(maxWidth, itemMaxWidth);
          }
        }
      });

      // PASO 2: Aplicar ese ancho máximo a TODOS
      Object.keys(categoryRefs.current).forEach(id => {
        const container = categoryRefs.current[id];
        if (container) {
          const category = container.querySelector('.transaction-category');
          const badge = container.querySelector('.tx-owner-badge');

          if (category && badge) {
            category.style.width = `${maxWidth}px`;
            badge.style.width = `${maxWidth}px`;
          }
          container.style.minWidth = `${maxWidth}px`;
        }
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [transactions]);

  const loadGroups = async () => {
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const buildParams = () => {
    if (filterMode === 'user') return { owner_type: 'user' };
    if (filterMode === 'groups') return { owner_type: 'group' }; // Sin owner_id
    return {}; // all
  };

  const groupAndOrder = (list) => {
    const userTx = list
      .filter(t => t.owner_type === 'user')
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const groupTx = list
      .filter(t => t.owner_type === 'group')
      .sort(
        (a, b) =>
          (a.owner_group_name || '').localeCompare(b.owner_group_name || '') ||
          (new Date(b.date) - new Date(a.date))
      );

    const sections = [];
    if (userTx.length) sections.push({ label: 'Mis movimientos', items: userTx });

    let current = null;
    groupTx.forEach(tx => {
      const name = tx.owner_group_name || `Grupo ${tx.owner_id}`;
      if (!current || current.label !== name) {
        current = { label: `GRP: ${name}`, items: [] };
        sections.push(current);
      }
      current.items.push(tx);
    });

    return sections;
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = buildParams();
      const data = await transactionService.getAll(params);
      const sections = Array.isArray(data) ? groupAndOrder(data) : [];
      setTransactions(sections);
    } catch (e) {
      console.error('Error cargando transacciones', e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      owner_type: ownerType,
      owner_id: ownerId,
    };

    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, payload);
      } else {
        await transactionService.create(payload);
      }

      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      loadTransactions();

    } catch (error) {
      console.error('Error guardando transacción:', error);
      alert(error.response?.data?.error || 'Error al guardar transacción');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);

    setFormData({
      category_id: transaction.category_id,
      amount: transaction.amount,
      date: transaction.date.split('T')[0],
      description: transaction.description || '',
      type: transaction.type,
    });

    setOwnerType(transaction.owner_type);
    setOwnerId(transaction.owner_id);

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción?')) return;

    try {
      await transactionService.delete(id);
      loadTransactions();
    } catch (error) {
      console.error('Error eliminando transacción:', error);
      alert('Error al eliminar transacción');
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: 'expense',
    });

    setOwnerType("user");
    setOwnerId(currentUser?.id || null);
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transacciones</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingTransaction(null);
            resetForm();
            setShowModal(true);
          }}
        >
          + Nueva Transacción
        </button>
      </div>

      {/* Filtros */}
      <div className="tx-filters">
        {/* ...otros filtros existentes... */}
        <label>Mostrar:</label>
        <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
          <option value="all">Todas las transacciones</option>
          <option value="user">Solo mis movimientos</option>
          <option value="groups">Solo movimientos en grupos</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : !Array.isArray(transactions) || transactions.length === 0 ? (
        <p className="no-data">No hay transacciones para mostrar</p>
      ) : (
        transactions.map((section) => (
          <div key={section.label} className="tx-section">
            <h4 className="tx-section-title">{section.label}</h4>
            {section.items.map((tx) => (
              <div key={tx.id} className="transaction-card">
                <div 
                  className="transaction-info"
                  ref={(el) => {
                    categoryRefs.current[tx.id] = el;
                    if (!infoContainerRef.current) infoContainerRef.current = el;
                  }}
                >
                  <div className="transaction-category">
                    <span
                      className="category-color"
                      style={{ backgroundColor: tx.category_color }}
                    ></span>
                    <span className="category-name">{tx.category_name}</span>
                  </div>
                  
                  <span className="tx-owner-badge">
                    {tx.owner_type === 'group'
                      ? `GRP: ${tx.owner_group_name || tx.owner_id}`
                      : 'Mis movimientos'}
                  </span>
                </div>

                <div className="transaction-details">
                  <p className="transaction-description">
                    {tx.description || 'Sin descripción'}
                  </p>
                  <p className="transaction-date">
                    {new Date(tx.date).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className="transaction-right">
                  <div className="transaction-actions">
                    <button className="btn-delete" onClick={() => handleDelete(tx.id)}>
                      Eliminar
                    </button>
                    <button className="btn-edit" onClick={() => handleEdit(tx)}>
                      Editar
                    </button>
                  </div>

                  <div className="transaction-amount">
                    <span className={`amount ${tx.type === 'income' ? 'positive' : 'negative'}`}>
                      {tx.type === 'income' ? '+' : '-'}$
                      {parseFloat(tx.amount).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTransaction ? 'Editar' : 'Nueva'} Transacción</h2>

            <form onSubmit={handleSubmit}>

              {/* SELECTOR OWNER */}
              <div className="form-group">
                <label>A donde?</label>

                <select
                  value={`${ownerType}:${ownerId}`}
                  onChange={(e) => {
                    const [type, id] = e.target.value.split(':');
                    setOwnerType(type);
                    setOwnerId(Number(id));
                  }}
                >
                  <option value={`user:${currentUser.id}`}>
                    Mis movimientos
                  </option>

                  {groups.map((g) => (
                    <option key={g.id} value={`group:${g.id}`}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* RESTO DEL FORM */}
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value, category_id: '' })
                  }
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Opcional"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-primary">
                  {editingTransaction ? 'Actualizar' : 'Crear'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};


