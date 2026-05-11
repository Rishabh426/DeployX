import axios from "axios";

const HISTORY_URL = "http://localhost:4000";

export async function saveDeployment(data: {
  id: string;
  userId: string;
  repoUrl: string;
  status: string;
  deployedUrl?: string;
  timeTaken?: number;
}) {
  await axios.post(`${HISTORY_URL}/history`, data);
}

export async function getDeployments(userId: string) {
  const res = await axios.get(`${HISTORY_URL}/history/${userId}`);
  return res.data.deployments;
}
