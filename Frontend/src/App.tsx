import { useState } from "react";
import axios from "axios";

const BACKEND_UPLOAD_URL = "http://localhost:3000";

export default function Landing() {
  const [repoUrl, setRepoUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deployed, setDeployed] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      
      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Deploy your GitHub Repository
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter the URL of your GitHub repository to deploy it
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm text-gray-700">
              GitHub Repository URL
            </label>
            <input
              type="text"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            />
          </div>

          <button
            onClick={async () => {
              setUploading(true);
              const res = await axios.post(`${BACKEND_UPLOAD_URL}/deploy`, {
                repoUrl: repoUrl,
              });

              setUploadId(res.data.id);
              setUploading(false);

              const interval = setInterval(async () => {
                const response = await axios.get(
                  `${BACKEND_UPLOAD_URL}/status?id=${res.data.id}`
                );

                if (response.data.status === "deployed") {
                  clearInterval(interval);
                  setDeployed(true);
                }
              }, 3000);
            }}
            disabled={uploadId !== "" || uploading}
            className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {uploadId
              ? `Deploying (${uploadId})`
              : uploading
              ? "Uploading..."
              : "Upload"}
          </button>
        </div>
      </div>

      {deployed && (
        <div className="w-full max-w-md border border-gray-200 rounded-2xl p-6 shadow-sm mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Deployment Status
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Your website is successfully deployed!
          </p>

          <div className="mt-5 space-y-2">
            <label className="text-sm text-gray-700">
              Deployed URL
            </label>
            <input
              readOnly
              value={`http://${uploadId}.rishabh.dev.com:3001/index.html`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>

          <button className="w-full mt-4 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
            <a
              href={`http://${uploadId}.rishabh.dev.com:3001/index.html`}
              target="_blank"
              rel="noreferrer"
            >
              Visit Website
            </a>
          </button>
        </div>
      )}
    </main>
  );
}