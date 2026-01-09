// frontend/src/app/page.tsx
// Landing page at http://localhost:3000/

export default function HomePage() {
  return (
    <main>
      <section className="section">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Blood Bank Management
            <span className="block text-red-600 mt-2">AI-Ready</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            A clean, scalable system to manage donors, hospitals, and blood
            requests — built for real-world workflows and future RAG analytics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/donors" className="btn btn-primary">
              View Donors
            </a>

            <a href="/hospitals" className="btn btn-primary">
              View Hospitals
            </a>

            <a href="/requests" className="btn btn-primary">
              View Requests
            </a>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid-3 mb-24">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Clean Architecture</h3>
            <p>
              Well-structured backend and frontend designed for readability,
              testing, and long-term scale.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">
              Real-world CRUD Flows
            </h3>
            <p>
              Manage donors, hospitals, and requests with realistic forms,
              validations, and workflows.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-2">AI-Ready Design</h3>
            <p>
              Built to support future RAG, analytics, and insights without
              painful refactors.
            </p>
          </div>
        </div>

        {/* Footer (Landing page only) */}
        <footer className="border-t border-gray-200 pt-10 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Built by{" "}
            <span className="font-medium text-gray-800">Dino Jackson</span>
          </p>

          {/* Tech stack */}
          <p className="text-xs text-gray-400 mb-6">
            FastAPI · Django · Next.js · Tailwind CSS · PostgreSQL
          </p>

          <div className="flex justify-center gap-8">
            <a
              href="https://github.com/Dno-J"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-sm text-gray-600 relative
                after:absolute after:left-0 after:-bottom-1
                after:h-[1px] after:w-0 after:bg-red-600
                after:transition-all after:duration-300
                hover:text-red-600 hover:after:w-full
              "
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/dino-jackson-486840368/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-sm text-gray-600 relative
                after:absolute after:left-0 after:-bottom-1
                after:h-[1px] after:w-0 after:bg-red-600
                after:transition-all after:duration-300
                hover:text-red-600 hover:after:w-full
              "
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}

