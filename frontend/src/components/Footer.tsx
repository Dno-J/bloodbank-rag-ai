// frontend/src/app/components/Footer.tsx

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3 text-sm">
          {/* Project */}
          <div>
            <p className="font-semibold">
              Blood Bank <span className="text-[var(--accent)]">AI</span>
            </p>
            <p className="text-[var(--text-secondary)] mt-1">
              Real-world CRUD system<br />
              AI-ready architecture (RAG)
            </p>
          </div>

          {/* Stack */}
          <div>
            <p className="font-semibold">Tech Stack</p>
            <p className="text-[var(--text-secondary)] mt-1">
              Next.js • Tailwind • Django REST<br />
              PostgreSQL • JWT • RAG-ready
            </p>
          </div>

          {/* Links */}
          <div className="md:text-right">
            <p className="font-semibold">Links</p>
            <div className="mt-1 flex md:justify-end gap-4">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                className="hover:text-[var(--accent)] transition"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                className="hover:text-[var(--accent)] transition"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          Built with production intent • Resume project
        </p>
      </div>
    </footer>
  );
}
