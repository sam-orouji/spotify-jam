import './App.css';
import LoginButton from "./components/login";
import LogOut from "./components/logout";
import { useEffect} from 'react';
import { gapi } from 'gapi-script';

const clientId = "85931472280-3ocbkq4j94e2r1usv6k6q9hrdrqbmdes.apps.googleusercontent.com"

function App() {

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: "" //scope should be different bc we use other apis: spotify api
      })
    };

    gapi.load('client:auth2, start');
  });

  return (
    <div className="App">
      <LoginButton />
      <LogoutButton />
    </div>
  )
}

export default App;

const clientId = "ac5aa309cebb46d6b014da02440d5918";
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code"); // Extract the authorization code from the URL

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  getAccessToken(clientId, code).then(async (accessToken) => {
    const profile = await fetchProfile(accessToken);
    populateUI(profile);
    console.log(profile.display_name);
    const topTracks = await getTopTracks(accessToken);
    displayTopTracks(topTracks);
    history.pushState({}, null, "/"); // Clean the URL after getting the token
  });
}

export async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log(document.location);
}

function generateCodeVerifier(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  console.log("Access token: ", access_token);
  return access_token;
}

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

function populateUI(profile) {
  document.getElementById("displayName").innerText = profile.display_name;

  document.getElementById("id").innerText = profile.id;
  document.getElementById("email").innerText = profile.email;
  document.getElementById("uri").innerText = profile.uri;
  document
    .getElementById("uri")
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url").innerText = profile.href;
  document.getElementById("url").setAttribute("href", profile.href);
}

async function getTopTracks(token) {
  const result = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?limit=10",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await result.json();

  if (data.error) {
    console.error("Spotify API Error:", data.error); // Log the error
    return [];
  }

  return data.items;
}

function displayTopTracks(tracks) {
  const tracksContainer = document.getElementById("topTracks");
  tracksContainer.innerHTML = "<h2>My Top 10 Spotify Songs</h2>";
  console.log(tracks);
  console.log(tracks.length);

  if (!tracks || tracks.length === 0) {
    tracksContainer.innerHTML +=
      "<p>Could not fetch top tracks. Check your authentication or Spotify activity.</p>";
    return;
  }

  tracks.forEach((track, index) => {
    const trackElement = document.createElement("div");
    trackElement.classList.add("track");

    trackElement.innerHTML = `
      <p><strong>${index + 1}. ${track.name}</strong> by ${track.artists
      .map((artist) => artist.name)
      .join(", ")}</p>
      <img src="${track.album.images[0]?.url}" alt="${track.name}" width="100">
    `;

    tracksContainer.appendChild(trackElement);
  });
}
