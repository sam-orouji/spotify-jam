const clientId = "ac5aa309cebb46d6b014da02440d5918";
const params = new URLSearchParams(window.location.hash.substring(1));
const accessToken = params.get("access_token");

if (!accessToken) {
  redirectToAuthCodeFlow(clientId);
} else {
  try {
    const profile = await fetchProfile(accessToken);
    const topTracks = await fetchTopTracks(accessToken);
    const currentlyPlaying = await fetchCurrentlyPlaying(accessToken);
    const queue = await fetchQueue(accessToken);
    console.log(topTracks);
    populateProfile(profile);
    populateTopTracks(topTracks);
    populateCurrentlyPlaying(currentlyPlaying);
    populateQueue(queue);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

document.getElementById("add-to-queue").addEventListener("click", async () => {
  const artistName = document.getElementById("artist-name").value;
  const trackTitle = document.getElementById("track-title").value;
  try {
    const trackUri = await searchTrack(accessToken, artistName, trackTitle);
    if (trackUri) {
      await addToQueue(accessToken, trackUri);
      alert("Song added to queue!");
      const queue = await fetchQueue(accessToken);
      populateQueue(queue);
    } else {
      alert("Track not found.");
    }
  } catch (error) {
    console.error("Error adding song to queue:", error);
    alert("Failed to add song to queue.");
  }
});

document.getElementById("submit-vote").addEventListener("click", async () => {
  const selectedRadio = document.querySelector('input[name="vote"]:checked');
  if (selectedRadio) {
    const selectedUri = selectedRadio.value;
    console.log(`Selected song URI: ${selectedUri}`);
    try {
      await addToQueue(accessToken, selectedUri);
      alert("Song added to queue!");
    } catch (error) {
      console.error("Error adding song to queue:", error);
      alert("Failed to add song to queue.");
    }
  } else {
    alert("Please select a song to vote for.");
  }
});

export function redirectToAuthCodeFlow(clientId) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "token");
  params.append("redirect_uri", "http://localhost:5174/callback");
  params.append(
    "scope",
    "user-read-private user-read-email user-top-read user-read-playback-state user-modify-playback-state"
  );

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!result.ok) {
    const error = await result.json();
    throw new Error(`Error fetching profile: ${error.error.message}`);
  }

  return await result.json();
}

async function fetchTopTracks(token) {
  const result = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?limit=5&offset=0",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!result.ok) {
    const error = await result.json();
    throw new Error(`Error fetching top tracks: ${error.error.message}`);
  }

  return await result.json();
}

async function fetchCurrentlyPlaying(token) {
  const result = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!result.ok) {
    if (result.status === 204) {
      return null; // No track currently playing
    }
    const error = await result.json();
    throw new Error(
      `Error fetching currently playing track: ${error.error.message}`
    );
  }

  const text = await result.text();
  if (!text) {
    return null; // No content in response
  }

  return JSON.parse(text);
}

async function searchTrack(token, artistName, trackTitle) {
  const query = encodeURIComponent(`${trackTitle} artist:${artistName}`);
  console.log(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`
  );

  const result = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!result.ok) {
    const error = await result.json();
    throw new Error(`Error searching for track: ${error.error.message}`);
  }

  const data = await result.json();
  console.log("Search result:", data); // Log the search result

  if (data.tracks.items.length > 0) {
    return data.tracks.items[0].uri;
  } else {
    return null;
  }
}

async function addToQueue(token, songUri) {
  console.log(`Adding song to queue: ${songUri}`);
  const result = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(
      songUri
    )}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!result.ok) {
    const error = await result.json();
    console.error("Error response:", error); // Log the error response
    throw new Error(`Error adding song to queue: ${error.error.message}`);
  }

  console.log("Song added to queue successfully");
}

async function fetchQueue(token) {
  const result = await fetch("https://api.spotify.com/v1/me/player/queue", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!result.ok) {
    const error = await result.json();
    throw new Error(`Error fetching queue: ${error.error.message}`);
  }

  return await result.json();
}

function populateProfile(profile) {
  document.getElementById("displayName").innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar").appendChild(profileImage);
    document.getElementById("imgUrl").innerText = profile.images[0].url;
  }
  document.getElementById("id").innerText = profile.id;
  document.getElementById("email").innerText = profile.email;
  document.getElementById("uri").innerText = profile.uri;
  document
    .getElementById("uri")
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url").innerText = profile.href;
  document.getElementById("url").setAttribute("href", profile.href);
}

function populateTopTracks(topTracks) {
  const tracksList = document.getElementById("tracks-list");
  topTracks.items.forEach((track) => {
    const listItem = document.createElement("li");
    listItem.innerText = `${track.name} by ${track.artists
      .map((artist) => artist.name)
      .join(", ")}`;
    tracksList.appendChild(listItem);
  });
}

function populateCurrentlyPlaying(currentlyPlaying) {
  const currentTrackElement = document.getElementById("current-track");
  if (currentlyPlaying && currentlyPlaying.item) {
    const track = currentlyPlaying.item;
    currentTrackElement.innerText = `${track.name} by ${track.artists
      .map((artist) => artist.name)
      .join(", ")}`;
  } else {
    currentTrackElement.innerText = "No track currently playing";
  }
}

function populateQueue(queue) {
  const queueList = document.getElementById("queue-list");
  queueList.innerHTML = ""; // Clear the existing queue
  queue.queue.slice(0, 4).forEach((track, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <input type="radio" name="vote" id="vote-${index}" value="${track.uri}">
      <label for="vote-${index}">${track.name} by ${track.artists
      .map((artist) => artist.name)
      .join(", ")}</label>
    `;
    queueList.appendChild(listItem);
  });
}
