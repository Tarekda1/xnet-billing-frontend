const Notifications: React.FC = () => {
  const notifications = [
    { message: '5 invoices are overdue!', type: 'warning' },
    { message: 'Payment received from John Doe', type: 'success' },
  ];

  return (
    <div>
      <button className="relative">
        🔔
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>
      {notifications.length > 0 && (
        <div className="absolute mt-2 bg-white border shadow-lg p-4 w-64">
          {notifications.map((note, index) => (
            <div
              key={index}
              className={`p-2 border-b ${
                note.type === 'success' ? 'text-green-500' : 'text-yellow-500'
              }`}
            >
              {note.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
