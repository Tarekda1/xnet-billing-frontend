const ActivityLogs: React.FC = () => {
  const logs = [
    'Invoice #123 marked as paid',
    'Customer John Doe added',
    'Invoice #124 created for $500',
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Activity Logs</h3>
      <ul className="list-disc pl-6">
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLogs;
