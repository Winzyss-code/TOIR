import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';

export default function MaintenanceTypes() {
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    frequency_type: 'days',
    frequency_value: '',
    description: ''
  });

  const frequencyTypes = [
    { value: 'hours', label: 'Часы' },
    { value: 'days', label: 'Дни' },
    { value: 'weeks', label: 'Недели' },
    { value: 'months', label: 'Месяцы' },
    { value: 'kilometers', label: 'Километры' }
  ];

  useEffect(() => {
    loadMaintenanceTypes();
  }, []);

  const loadMaintenanceTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance-types');
      setMaintenanceTypes(response.data);
    } catch (error) {
      console.error('Ошибка загрузки типов ТО:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      code: '',
      name: '',
      frequency_type: 'days',
      frequency_value: '',
      description: ''
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
        await api.delete(`/maintenance-types/${id}`);
        loadMaintenanceTypes();
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/maintenance-types/${editingId}`, formData);
      } else {
        await api.post('/maintenance-types', formData);
      }
      loadMaintenanceTypes();
      setShowModal(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const filteredTypes = maintenanceTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFrequencyLabel = (type) => {
    const freq = frequencyTypes.find(f => f.value === type.frequency_type);
    return freq ? freq.label : type.frequency_type;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Типы технического обслуживания" />

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
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Периодичность</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Описание</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{type.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{type.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Каждые {type.frequency_value} {getFrequencyLabel(type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {type.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
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
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Редактировать' : 'Новый тип ТО'}
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
                    placeholder="ТО-1"
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
                    placeholder="Техническое обслуживание первого вида"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Периодичность</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.frequency_type}
                      onChange={(e) => setFormData({ ...formData, frequency_type: e.target.value })}
                    >
                      {frequencyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Значение</label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.frequency_value}
                      onChange={(e) => setFormData({ ...formData, frequency_value: e.target.value })}
                      placeholder="7"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание типа технического обслуживания"
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
