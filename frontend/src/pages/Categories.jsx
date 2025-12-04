import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService.js';
import './Categories.css';

/**
 * Página de gestión de categorías
 */
export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3B82F6',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
      } else {
        await categoryService.create(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      await loadCategories();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      alert(error.response?.data?.error || 'Error al guardar categoría');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#3B82F6',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await categoryService.delete(id);
      await loadCategories();
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert(error.response?.data?.error || 'Error al eliminar categoría');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: '#3B82F6',
    });
  };

  const incomeCategories = categories.filter((cat) => cat.type === 'income');
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  const colorPresets = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
  ];

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categorías</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setShowModal(true);
          }}
        >
          + Nueva Categoría
        </button>
      </div>

      <div className="categories-grid">
        <div className="category-section">
          <h2>Ingresos</h2>
          {incomeCategories.length === 0 ? (
            <p className="no-data">No hay categorías de ingresos</p>
          ) : (
            <div className="categories-list">
              {incomeCategories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-info">
                    <span
                      className="category-color"
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(category)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(category.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="category-section">
          <h2>Gastos</h2>
          {expenseCategories.length === 0 ? (
            <p className="no-data">No hay categorías de gastos</p>
          ) : (
            <div className="categories-list">
              {expenseCategories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-info">
                    <span
                      className="category-color"
                      style={{ backgroundColor: category.color }}
                    ></span>
                    <span className="category-name">{category.name}</span>
                  </div>
                  <div className="category-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(category)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(category.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {editingCategory ? 'Editar' : 'Nueva'} Categoría
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Ej: Comida, Salario, etc."
                />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                  <div className="color-presets">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="color-preset"
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setFormData({ ...formData, color })
                        }
                      ></button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



