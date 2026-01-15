import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';

export default function SpareParts() {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    manufacturer: '',
    unit_of_measure: 'шт',
    unit_price: '',
    supplier: '',
    category: ''
  });

  useEffect(() => {
    loadSpareParts();
  }, []);

  const loadSpareParts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/spare-parts');
      setSpareParts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки запасных частей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      manufacturer: '',
      unit_of_measure: 'шт',
      unit_price: '',
      supplier: '',
      category: ''
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        await api.delete(`/spare-parts/${id}`);
        loadSpareParts();
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/spare-parts/${editingId}`, formData);
      } else {
        await api.post('/spare-parts', formData);
      }
      loadSpareParts();
      setShowModal(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const filteredParts = spareParts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Запасные части" />

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по коду или названию..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddNew} className="ml-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Добавить
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Код</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Название</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Производитель</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Категория</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Цена</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{part.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{part.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{part.manufacturer || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{part.category || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{part.unit_price ? parseFloat(part.unit_price).toFixed(2) : '0.00'} ₽</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(part)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(part.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Редактировать' : 'Новая запасная часть'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Код</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Производитель</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ед. изм.</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Поставщик</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Сохранить</Button>
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
