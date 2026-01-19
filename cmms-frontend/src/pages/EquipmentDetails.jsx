import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { EquipmentTreeService } from "../services/equipmentTree.service"

const Field = ({ label, children }) => (
  <div className="grid grid-cols-[220px_1fr] items-center gap-3 py-1">
    <div className="text-sm text-gray-700">{label}</div>
    <div>{children}</div>
  </div>
)

const Section = ({ title, children }) => (
  <div className="mt-6">
    <div className="text-green-700 font-semibold mb-2">
      {title}
    </div>
    <div className="border border-gray-300 p-4 space-y-1">
      {children}
    </div>
  </div>
)

export default function EquipmentDetails() {
  const { id } = useParams()
const [equipment, setEquipment] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  let mounted = true

  if (!id) {
    setLoading(false)
    return
  }

  EquipmentTreeService.getNodeById(id)
    .then(data => {
      if (mounted) {
        setEquipment(data)
        setLoading(false)
      }
    })
    .catch(() => {
      setLoading(false)
    })

  return () => {
    mounted = false
  }
}, [id])

if (loading) {
  return <div className="text-gray-500">Загрузка...</div>
}

  if (!equipment) {
  return (
    <div className="text-red-600">
      Объект оборудования не найден
    </div>
  )
}

  return (
    <div className="space-y-6 text-sm">

      {/* =======================
          ОСНОВНАЯ ФОРМА
         ======================= */}
      <div className="border border-gray-300 p-4 space-y-2">

        <Field label="Родитель">
          <input className="erp-input" value="Здания производственные" readOnly />
        </Field>

        <Field label="Наименование">
          <input className="erp-input" value={equipment.name || ""} />
        </Field>

        <Field label="Код">
          <input className="erp-input" value="000000000014" />
        </Field>

        <Field label="Тип объекта">
          <select className="erp-input">
            <option>Единица оборудования</option>
          </select>
        </Field>

        <Field label="Направление">
          <select className="erp-input">
            <option>Здания и сооружения</option>
          </select>
        </Field>

        <Field label="Типовой ОР">
          <select className="erp-input">
            <option>Промышленные здания</option>
          </select>
        </Field>

        <div className="flex gap-6 pt-2 text-blue-600">
          <button>📘 Журнал объекта ремонта</button>
          <button>⚙ Настройка показателей эксплуатации</button>
        </div>
      </div>

      {/* =======================
          ВКЛАДКИ
         ======================= */}
      <div className="border-b border-gray-300 flex gap-6">
        {[
          ["general", "Общие"],
          ["passport", "Паспортные характеристики"],
          ["norms", "Нормативы планирования"],
          ["history", "История перемещения оборудования"]
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 ${
              tab === key
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* =======================
          ОБЩИЕ
         ======================= */}
      {tab === "general" && (
        <>
          <Section title="Данные по эксплуатации">
            <Field label="">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="erp-checkbox" />
                Объект принадлежит стороннему контрагенту
              </label>
            </Field>

            <Field label="Организация">
              <input className="erp-input" value='РК "Гефест"' />
            </Field>

            <Field label="Подразделение">
              <input className="erp-input" value="Служба эксплуатации" />
            </Field>

            <Field label="Критичность">
              <select className="erp-input border-yellow-400">
                <option>Высокая</option>
              </select>
            </Field>

            <Field label="Дата ввода в экспл.">
              <input type="date" className="erp-input" />
            </Field>

            <Field label="График работы">
              <input className="erp-input" value="Круглосуточный" />
            </Field>

            <Field label="Срок полезного исп.">
              <input className="erp-input" value="600" />
            </Field>

            <Field label="Инвентарный №">
              <input className="erp-input" value="100-01" />
            </Field>

            <Field label="Технологический №">
              <input className="erp-input" value="89000-01" />
            </Field>
          </Section>

          <Section title="Местоположение">
            <Field label="Широта">
              <input className="erp-input" value="0,000000000000000" />
            </Field>

            <Field label="Долгота">
              <input className="erp-input" value="0,000000000000000" />
            </Field>

            <Field label="Высота">
              <input className="erp-input" value="0,00" />
            </Field>

            <Field label="Местонахождение">
              <input className="erp-input" value="г. Москва, Заводская стр.1" />
            </Field>

            <Field label="Адрес">
              <input className="erp-input" />
            </Field>
          </Section>

          <Section title="Данные изготовителя">
            <Field label="Изготовитель">
              <input className="erp-input" value='ОАО "ГосСтрой"' />
            </Field>

            <Field label="Дата выпуска">
              <input type="date" className="erp-input" />
            </Field>

            <Field label="Комментарий">
              <textarea className="erp-input h-20" />
            </Field>
          </Section>
        </>
      )}

      {/* =======================
          BREADCRUMB
         ======================= */}
      <div className="border-t border-gray-300 pt-3 text-xs text-gray-600 flex gap-2">
        🏠 Начальная страница /
        Объекты ремонта /
        <span className="font-semibold">
          Здание цеха №1
        </span>
        <span className="text-blue-600">[Эксплуатация]</span>
        <span className="text-green-600">[Выполняется ремонт]</span>
      </div>
    </div>
  )
}
