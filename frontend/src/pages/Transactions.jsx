import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService.js';
import { categoryService } from '../services/categoryService.js';
import { getSocket } from '../config/socket.js';
import './Transactions.css';

/**
 * Página de gestión de transacciones
 */
export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'expense',
  });

  useEffect(() => {
    loadData();

    // Socket.IO para actualizaciones en tiempo real
    const socket = getSocket();
    socket.on('transaction:created', handleTransactionUpdate);
    socket.on('transaction:updated', handleTransactionUpdate);
    socket.on('transaction:deleted', handleTransactionUpdate);

    return () => {
      socket.off('transaction:created');
      socket.off('transaction:updated');
      socket.off('transaction:deleted');
    };
  }, []);

  const handleTransactionUpdate = () => {
    loadTransactions();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, categoriesData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll(),
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, formData);
      } else {
        await transactionService.create(formData);
      }
      setShowModal(false);
      setEditingTransaction(null);
      resetForm();
      await loadTransactions();
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
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción?')) return;

    try {
      await transactionService.delete(id);
      await loadTransactions();
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
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

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

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <p className="no-data">No hay transacciones registradas</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-card">
              <div className="transaction-info">
                <div className="transaction-category">
                  <span
                    className="category-color"
                    style={{ backgroundColor: transaction.category_color }}
                  ></span>
                  <span>{transaction.category_name}</span>
                </div>
                <div className="transaction-details">
                  <p className="transaction-description">
                    {transaction.description || 'Sin descripción'}
                  </p>
                  <p className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="transaction-amount">
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
                <div className="transaction-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(transaction)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(transaction.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {editingTransaction ? 'Editar' : 'Nueva'} Transacción
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value, category_id: '' });
                  }}
                  required
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



