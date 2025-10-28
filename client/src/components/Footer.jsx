import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="fixed bottom-3 w-full flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-4 mb-1">
        <a
          href="https://www.linkedin.com/in/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-600 transition transform hover:scale-110"
        >
          <Linkedin size={18} strokeWidth={1.8} />
        </a>
        <a
          href="https://github.com/yourgithub"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-black transition transform hover:scale-110"
        >
          <Github size={18} strokeWidth={1.8} />
        </a>
      </div>

      <p className="text-[11px] sm:text-xs text-gray-500">
        © 2025 <span className="font-medium text-gray-700">Ashim</span> — Crafted with 💙 for simplicity.
      </p>
    </footer>
  );
}
