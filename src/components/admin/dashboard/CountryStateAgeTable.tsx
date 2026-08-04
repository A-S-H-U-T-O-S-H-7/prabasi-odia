"use client";

interface CountryStateAgeRow {
  country: string;
  state: string;
  total: number;
  ageGroups: Record<string, number>;
}

interface CountryStateAgeTableProps {
  data: CountryStateAgeRow[];
}

const AGE_COLUMNS = ["18-24", "25-34", "35-44", "45-54", "55+"];

export default function CountryStateAgeTable({ data }: CountryStateAgeTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56">
        <p className="text-[#6B5E5A]">No country/state age-group data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs md:text-sm">
        <thead>
          <tr className="text-left border-b border-[#E7D7E8] bg-[#FFF8F2]">
            <th className="px-3 py-2 font-semibold text-[#2A1636]">Country</th>
            <th className="px-3 py-2 font-semibold text-[#2A1636]">State</th>
            {AGE_COLUMNS.map((group) => (
              <th key={group} className="px-3 py-2 font-semibold text-[#2A1636] text-center">{group}</th>
            ))}
            <th className="px-3 py-2 font-semibold text-[#2A1636] text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={`${row.country}-${row.state}-${idx}`} className="border-b border-[#E7D7E8]/50 hover:bg-[#FFF8F2]/50">
              <td className="px-3 py-2 text-[#2A1636]">{row.country}</td>
              <td className="px-3 py-2 text-[#6B5E5A]">{row.state}</td>
              {AGE_COLUMNS.map((group) => (
                <td key={group} className="px-3 py-2 text-center text-[#2A1636]">{row.ageGroups[group] || 0}</td>
              ))}
              <td className="px-3 py-2 text-center font-semibold text-[#6B1E5B]">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
