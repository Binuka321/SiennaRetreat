const projects = [
  {
    title: "Skill Horizon",
    description:
      "Learning skill management and social app developed for the SLIIT PAF module. Built the full backend and integrated Google OAuth2.",
    tech: "React.js, Vite, Spring Boot, MongoDB",
  },
  {
    title: "CCL Academy Website",
    description:
      "Educational website with course listings, booking, and payments. Built key pages and integrated payment system.",
    tech: "PHP, WordPress",
  },
  {
    title: "Lunu Mirisa Restaurant System",
    description:
      "Restaurant management web app with cart and payment systems.",
    tech: "React.js, Vite, Tailwind CSS, MongoDB",
  },
  {
    title: "Finance Management System",
    description:
      "Internal project for All In One Holdings. Managed and developed the complete system.",
    tech: "PHP, MSSQL",
  },
  {
    title: "Mathale Aluvihare Website",
    description:
      "Informational site for cultural tourism. Built history and contact pages.",
    tech: "React.js, Vite, GitHub",
  },
];

const Projects = () => (
  <section id="projects">
    <h2 className="text-2xl font-bold text-blue-900 dark:text-cyan-300 mb-4">Projects</h2>
    <div className="space-y-6">
      {projects.map((project, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-5 transition transform hover:scale-[1.02]">
          <h3 className="text-xl font-semibold text-blue-800 dark:text-cyan-200">{project.title}</h3>
          <p className="mt-2">{project.description}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"><strong>Tech:</strong> {project.tech}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Projects;
