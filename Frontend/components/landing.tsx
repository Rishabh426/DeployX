import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_UPLOAD_URL = "http://localhost:3000";

const GitHubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-zinc-400"
  >
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const ExternalLinkIcon = () => (
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
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CopyIcon = () => (
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
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [copied, setCopied] = useState(false);

  const deployedUrl = `http://${uploadId}.rishabh.dev.com:3001/index.html`;
  const visitUrl = `http://${uploadId}.localhost:3001/index.html`;

  const handleDeploy = async () => {
    const startTime = Date.now();

    try {
      setUploading(true);

      const res = await axios.post(`${BACKEND_UPLOAD_URL}/deploy`, { repoUrl });
      const deploymentId = res.data.id;
      setUploadId(deploymentId);
      setUploading(false);

      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${BACKEND_UPLOAD_URL}/status?id=${deploymentId}`,
          );

          if (response.data.status === "deployed") {
            clearInterval(interval);
            setDeployed(true);
          }

          if (response.data.status === "failed") {
            clearInterval(interval);
            navigate("/deploy-failed", {
              state: {
                repoUrl,
                deploymentId,
                timeTaken: Math.round((Date.now() - startTime) / 1000),
              },
            });
          }
        } catch (err) {
          console.log(err);
          clearInterval(interval);
          navigate("/deploy-failed", {
            state: {
              repoUrl,
              deploymentId,
              timeTaken: Math.round((Date.now() - startTime) / 1000),
            },
          });
        }
      }, 5000);
    } catch (err) {
      console.log(err);
      setUploading(false);
      navigate("/deploy-failed", {
        state: {
          repoUrl,
          deploymentId: uploadId || "N/A",
          timeTaken: Math.round((Date.now() - startTime) / 1000),
        },
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(deployedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDeploying = uploadId !== "" && !deployed;

  return (
    <main className="min-h-screen h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-violet-900/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md flex flex-col gap-5">
        <div className="flex items-center gap-2 justify-center mb-3">
          <span className="text-white font-semibold text-lg tracking-tight">
            DeployX
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-white mb-1">
              Deploy your repository
            </h2>
            <p className="text-sm text-zinc-500">
              Enter a GitHub repository URL to instantly deploy it.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase text-zinc-400">
                GitHub Repository URL
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-zinc-600">
                  <GitHubIcon />
                </span>
                <input
                  type="text"
                  placeholder="https://github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={uploadId !== ""}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              onClick={handleDeploy}
              disabled={!repoUrl || uploadId !== "" || uploading}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
                ${
                  deployed
                    ? "bg-emerald-600 text-white"
                    : "bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 16v-2a8 8 0 01-8-8z"
                    />
                  </svg>
                  Uploading…
                </>
              ) : isDeploying ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 16v-2a8 8 0 01-8-8z"
                    />
                  </svg>
                  Deploying · {uploadId}
                </>
              ) : deployed ? (
                <>
                  <CheckIcon />
                  Deployed!
                </>
              ) : (
                "Deploy"
              )}
            </button>
          </div>

          {isDeploying && (
            <div className="mt-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Building & deploying…</span>
                <span className="text-zinc-600">{uploadId}</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-600 rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          )}
        </div>

        {/* Deployment Result Card */}
        {deployed && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50 animate-fadeIn">
            <div className="flex items-center gap-2 mb-6">
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
              <span className="text-xs text-zinc-600">{uploadId}</span>
            </div>

            <h2 className="text-xl font-semibold text-white mb-1">
              Deployment Complete
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              Your site is live and accessible at the URL below.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-widest uppercase text-zinc-400">
                Deployed URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={deployedUrl}
                  className="flex-1 bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 outline-none select-all cursor-text"
                />
                <button
                  onClick={handleCopy}
                  title="Copy URL"
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all duration-150"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            </div>
            <a
              href={visitUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white text-sm font-medium transition-all duration-150 hover:border-zinc-600"
            >
              <ExternalLinkIcon />
              Visit Website
            </a>
          </div>
        )}

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
