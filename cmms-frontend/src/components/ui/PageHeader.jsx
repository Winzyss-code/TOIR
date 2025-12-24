export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
