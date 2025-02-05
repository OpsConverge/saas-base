// File: components/team/InfraInventory.tsx
import React, { useEffect, useState } from 'react';

interface InfraItem {
  id: string;
  name: string;
  status: string;
}

interface InfraInventoryProps {
  team: {
    id: string;
    name: string;
  };
}

const InfraInventory: React.FC<InfraInventoryProps> = ({ team }) => {
  const [infraItems, setInfraItems] = useState<InfraItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfraInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate an API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Dummy data
      const data: InfraItem[] = [
        { id: '1', name: 'Web Server', status: 'Running' },
        { id: '2', name: 'Database Cluster', status: 'Stopped' },
        { id: '3', name: 'Load Balancer', status: 'Running' },
      ];
      setInfraItems(data);
    } catch (err) {
      setError('Failed to load infrastructure inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfraInventory();
  }, []);

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Infrastructure Inventory</h2>
      {loading && <p>Loading infrastructure inventory...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <>
          {infraItems.length === 0 ? (
            <p>No infrastructure deployed.</p>
          ) : (
            <ul className="space-y-2">
              {infraItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center border p-2 rounded">
                  <span>{item.name}</span>
                  <span className={`font-semibold ${item.status === 'Running' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={fetchInfraInventory}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Inventory
          </button>
        </>
      )}
    </div>
  );
};

export default InfraInventory;
