
import React from 'react';
import ActivityCard from '@/components/ActivityCard';
import Header from '@/components/Header'; // Import the Header component

const AtividadesPage: React.FC = () => {
  const activities = [
    {
      id: 1,
      title: 'Atividade de Alfabetização - Nível 1',
      description: 'Folha de exercícios para introdução às vogais e consoantes.',
      downloadLink: '/materiais/alfabetização.pdf', // Placeholder link
    },
    {
      id: 2,
      title: 'Boas Vindas - Educação Infantil',
      description: 'Atividade lúdica para receber os alunos no início do ano letivo.',
      downloadLink: '/materiais/Boas Vindas.pdf', // Placeholder link
    },
    {
      id: 3,
      title: 'Contando Histórias na Páscoa',
      description: 'Sequência didática sobre a história da Páscoa para ensino fundamental.',
      downloadLink: '/img/historiapascoa.jpg', // Another placeholder, maybe a PDF later
    },
    {
      id: 4,
      title: 'Recursos para o Dia do Sapo',
      description: 'Músicas e brincadeiras sobre o sapo para crianças.',
      downloadLink: '/testimonials/bocadosapo.jpg', // Another placeholder
    },
  ];

  return (
    <>
      <Header /> {/* Add the Header component here */}
      <main className="container mx-auto px-4 py-8 mt-[380px]"> {/* Added mt-[200px] to account for fixed header */}
        <h1 className="text-4xl font-bold text-center mb-10">Atividades Gratuitas para Download</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              title={activity.title}
              description={activity.description}
              downloadLink={activity.downloadLink}
            />
          ))}
        </div>
      </main>
    </>
  );
};

export default AtividadesPage;

