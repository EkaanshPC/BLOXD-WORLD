console.log("🔥 Script loaded!");

// ✅ 1️⃣ Initialize Supabase client
const client = supabase.createClient(
  "https://pxmsgzfufvwxpnyeobwk.supabase.co",
 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bXNnemZ1ZnZ3eHBueWVvYndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjU1OTksImV4cCI6MjA2NzM0MTU5OX0.-fRzI_259AIkq60Ck7PcgpX2SThnp8rBwVGglKxgY2U"
);

const authArea = document.getElementById("authArea");
console.log("⚙️ Supabase client initialized:", client);

// ✅ 2️⃣ Handle URL stuff
async function handleOAuthRedirect() {
  console.log("🐱 handleOAuthRedirect() called");
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const hash = window.location.hash;

  console.log("🔍 URL params:", window.location.search);
  console.log("🔍 URL hash:", hash);

  if (code) {
    console.log("🎉 Found ?code param:", code);
    // For PKCE flow
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("❌ Error exchanging code:", error.message);
    } else {
      console.log("✅ Session established:", data.session);
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (hash.includes("access_token")) {
    console.log("🎉 Found #access_token — LET Supabase handle it automatically.");
    // DO NOT clean hash now — wait for auth event!
  } else {
    console.log("⚠️ No OAuth params found.");
  }
}

// ✅ 3️⃣ Render UI based on user state
async function renderUser() {
  console.log("🎭 renderUser() called");

  const { data: { session }, error: sessionError } = await client.auth.getSession();
  console.log("💾 getSession() response:", session, sessionError);

  const user = session?.user;
  console.log("🗝️ Current user:", user);

  if (user) {
    console.log("✅ Logged in user:", user);
    authArea.innerHTML = `
      <li>
        <span style="color:white">${user.email}</span>
        <a href="#" id="logoutBtn">🚪 Logout</a>
      </li>
    `;
    document.getElementById("logoutBtn").onclick = async (e) => {
      e.preventDefault();
      console.log("🚪 Logging out...");
      await client.auth.signOut();
      location.reload();
    };
  } else {
    console.log("🙅 No user logged in.");
    authArea.innerHTML = `
      <li><a href="#" id="loginBtn">🔑 Login with Google</a></li>
    `;
    document.getElementById("loginBtn").onclick = async (e) => {
      e.preventDefault();
      console.log("🔑 Starting OAuth sign in...");
      await client.auth.signInWithOAuth({
        provider: "google",
      });
    };
  }
}


// ✅ 4️⃣ React to auth state changes
client.auth.onAuthStateChange(async (_event, session) => {
  console.log("⚡ Auth state changed:", _event, session);

  // 🧹 Clean up hash AFTER session is valid
  if (session && window.location.hash.includes("access_token")) {
    console.log("🧹 Cleaning up #access_token from URL");
    window.location.hash = "";
  }

  await renderUser();
});

// ✅ 5️⃣ Run on page load
console.log("🏃 Running handleOAuthRedirect() & renderUser()...");
handleOAuthRedirect().then(renderUser);

