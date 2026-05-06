import { useLocation, useNavigate } from "react-router-dom";

interface FailureState {
  repoUrl: string;
  deploymentId: string;
  timeTaken: number;
}

const AlertIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const HashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function DeployFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as FailureState | null;

  const repoUrl = state?.repoUrl ?? "Unknown repository";
  const deploymentId = state?.deploymentId ?? "N/A";
  const timeTaken = state?.timeTaken ?? 0;
  const failedAt = new Date().toLocaleString();

  const details = [
    { icon: <HashIcon />, label: "Deployment ID", value: deploymentId },
    { icon: <GitHubIcon />, label: "Repository", value: repoUrl },
    { icon: <ClockIcon />, label: "Time Taken", value: formatTime(timeTaken) },
    { icon: <ClockIcon />, label: "Failed At", value: failedAt },
  ];

  return (
    <main className="min-h-screen h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-red-900/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md flex flex-col gap-5">
        {/* Brand */}
        <div className="flex items-center gap-2 justify-center mb-3">
          <span className="text-white font-semibold text-lg tracking-tight">
            DeployX
          </span>
        </div>

        {/* Failure Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50 animate-fadeIn">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-950/40 border border-red-900/50 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Failed
            </span>
          </div>

          {/* Icon + heading */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-950/40 border border-red-900/40 flex items-center justify-center text-red-400">
              <AlertIcon />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Deployment Failed
              </h2>
              <p className="text-sm text-zinc-500">
                Something went wrong while building or deploying your project.
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3 mb-6">
            {details.map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 bg-zinc-800/40 border border-zinc-800 rounded-xl px-4 py-3"
              >
                <span className="flex-shrink-0 mt-0.5 text-zinc-500">
                  {icon}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium tracking-widest uppercase text-zinc-500">
                    {label}
                  </span>
                  <span className="text-sm text-zinc-200 break-all">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon />
              Try Again
            </button>
            <button
              onClick={() => window.open(repoUrl, "_blank")}
              disabled={!repoUrl.startsWith("http")}
              className="w-full py-3 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <GitHubIcon />
              View Repository
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-700">
          Powered by <span className="text-zinc-500">DeployX</span> · Private
          &amp; Secure
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.35s ease forwards; }
      `}</style>
    </main>
  );
}
