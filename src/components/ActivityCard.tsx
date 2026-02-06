
import React from 'react';

interface ActivityCardProps {
  title: string;
  description: string;
  downloadLink: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, description, downloadLink }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md flex flex-col items-center text-center">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <a
        href={downloadLink}
        download
        className="mt-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Baixar Agora Grátis
      </a>
    </div>
  );
};

export default ActivityCard;
