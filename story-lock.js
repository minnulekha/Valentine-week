/* ===============================
   STORY PRIVATE LOCK SYSTEM
   + Floating relock button
=============================== */

(function(){

    const siteUnlocked = localStorage.getItem("valentineUnlocked");
    if(siteUnlocked !== "true") return;

    const storyUnlocked = localStorage.getItem("storyUnlocked");

    // If not unlocked → go to lock page
    if(storyUnlocked !== "true"){
        sessionStorage.setItem("storyRedirect", window.location.pathname);
        window.location.href = "story-lock.html";
        return;
    }

    // If unlocked → create floating lock button
    createRelockButton();

})();


/* ===============================
   Floating relock icon
=============================== */
function createRelockButton(){

    const btn = document.createElement("div");
    btn.innerHTML = "🔒";
    btn.title = "Lock again";

    btn.style.position = "fixed";
    btn.style.bottom = "22px";
    btn.style.right = "22px";
    btn.style.width = "44px";
    btn.style.height = "44px";
    btn.style.borderRadius = "50%";
    btn.style.background = "#1A1A1A";
    btn.style.color = "#D4AF37";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.fontSize = "22px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "9999";
    btn.style.boxShadow = "0 8px 25px rgba(0,0,0,0.35)";
    btn.style.transition = "0.25s";

    btn.onmouseenter = () => btn.style.transform = "scale(1.15)";
    btn.onmouseleave = () => btn.style.transform = "scale(1)";

    btn.onclick = () => {
        localStorage.removeItem("storyUnlocked");
        alert("Locked again 🔐");
        window.location.href = "index.html";
    };

    document.body.appendChild(btn);
}