import { useDay1Partners } from "../hooks/useDay1Partners";

export const Day1Partners = () => {
  const { completedPartners, pendingPartners, isLoading, error } =
    useDay1Partners();

  // Helper function to divide partners into columns
  const getColumnsData = (partners: string[], columnCount: number = 4) => {
    const result: string[][] = Array.from({ length: columnCount }, () => []);
    const itemsPerColumn = Math.ceil(partners.length / columnCount);

    partners.forEach((partner, index) => {
      const columnIndex = Math.floor(index / itemsPerColumn);
      result[columnIndex].push(partner);
    });

    return result;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 shadow-lg text-center">
        <p>Loading partners data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 shadow-lg text-center">
        <p className="text-red-500">Error loading partners data</p>
      </div>
    );
  }

  const completedColumns = getColumnsData(completedPartners);
  const pendingColumns = getColumnsData(pendingPartners);

  return (
    <div className="bg-white p-8 border-2 border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Day 1 Partner Migration Status
      </h2>

      {/* Completed Partners Section */}
      {completedPartners.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-[#476520]">
            L2 Migration Completed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {completedColumns.map((column, columnIndex) => (
              <div key={`completed-col-${columnIndex}`}>
                {column.map((partner, index) => (
                  <div
                    key={`completed-${columnIndex}-${index}`}
                    className="mb-2 flex items-center"
                  >
                    <span className="text-green-500 mr-2">✓</span>
                    {partner}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Partners Section */}
      {pendingPartners.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-[#FFA15F] flex items-center">
            L2 Migration In Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {pendingColumns.map((column, columnIndex) => (
              <div key={`pending-col-${columnIndex}`}>
                {column.map((partner, index) => (
                  <div key={`pending-${columnIndex}-${index}`} className="mb-2">
                    {partner}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {completedPartners.length === 0 && pendingPartners.length === 0 && (
        <p className="text-center text-gray-500">No partner data available</p>
      )}
    </div>
  );
};
