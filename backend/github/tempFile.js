import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Ensures environment variables (like your API token) are loaded
dotenv.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function fetchGitHubProfile(username) {
  // **FIX 1: Define headers for authentication**
  const headers = {
    "Accept": "application/vnd.github.v3+json",
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }

  // **FIX 2: Use Promise.all to fetch user and repo data in parallel**
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers })
  ]);

  // **FIX 3: Provide specific error handling**
  if (userRes.status === 404) {
    throw new Error(`GitHub user '${username}' not found.`);
  }
  if (!userRes.ok || !reposRes.ok) {
    throw new Error(`GitHub API error. User Status: ${userRes.status}, Repos Status: ${reposRes.status}`);
  }

  const [userData, reposData] = await Promise.all([userRes.json(), reposRes.json()]);

  // Your original logic for processing the data remains the same
  const topRepos = reposData
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map(repo => ({
      title: repo.name,
      description: repo.description || "No description provided."
    }));

  const skills = [...new Set(reposData.flatMap(r => r.language ? [r.language] : []))].filter(Boolean);

  // Return the complete profile object as you originally intended
  return {
    name: userData.name || username,
    bio: userData.bio || '',
    email: userData.email || '',
    location: userData.location || '',
    projects: topRepos,
    skills: skills
  };
}