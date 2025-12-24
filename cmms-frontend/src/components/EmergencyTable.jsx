export default function EmergencyTable({ data }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="font-semibold text-lg mb-4">
        Аварии по оборудованию
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2">Оборудование</th>
            <th className="py-2 text-right">Аварий</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.equipment} className="border-b last:border-0">
              <td className="py-2">{item.equipment}</td>
              <td className="py-2 text-right font-semibold text-red-600">
                {item.count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
