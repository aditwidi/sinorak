"use client";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle }) => {
  return (
    <div className="flex flex-col p-4 bg-white rounded-xl shadow-lg border border-gray-100"> {/* Updated shadow-lg class */}
      {/* Icon Section */}
      <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-lg bg-gray-100">
        {icon}
      </div>

      {/* Text Content */}
      <div className="flex flex-col">
        <h3 className="text-md font-medium text-gray-700">{title}</h3>
        <p className="text-xs text-gray-400 mb-1">{subtitle}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
