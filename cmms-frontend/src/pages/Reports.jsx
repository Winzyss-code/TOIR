import PageHeader from "../components/ui/PageHeader"
import Card from "../components/ui/Card"

export default function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Отчёты"
        subtitle="Аналитика и показатели ТОиР"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-medium mb-2">Аварии по оборудованию</h3>
          <div className="text-sm text-gray-500">График будет здесь</div>
        </Card>

        <Card>
          <h3 className="font-medium mb-2">Среднее время ремонта</h3>
          <div className="text-sm text-gray-500">KPI</div>
        </Card>
      </div>
    </div>
  )
}
