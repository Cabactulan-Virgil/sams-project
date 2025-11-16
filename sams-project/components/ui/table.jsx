export default function Table({ headers = [], rows = [], emptyText = 'No data found.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="text-left px-3 py-2 border-b border-gray-200">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 border-b border-gray-100">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-3 py-2 text-center text-gray-400">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
