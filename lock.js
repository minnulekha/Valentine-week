/* ===============================
   GLOBAL VALENTINE LOCK SYSTEM
=============================== */

(function(){

    const unlocked = localStorage.getItem("valentineUnlocked");

    if(unlocked !== "true"){

        sessionStorage.setItem("redirectAfterLock", window.location.pathname);

        window.location.href = "lock.html";
    }
// ADD ONLY THIS LINE
    createManualRelock();
})();
/* ===============================
   Manual relock button (MAIN SITE)
=============================== */
function createManualRelock(){

    // prevent duplicate
    if(document.getElementById("manual-site-lock")) return;

    const btn = document.createElement("div");
    btn.id = "manual-site-lock";
    btn.innerHTML = "🔐";
    btn.title = "Lock website";

    btn.style.position = "fixed";
    btn.style.bottom = "22px";
    btn.style.left = "22px";   // left side (story lock is right side)
    btn.style.width = "44px";
    btn.style.height = "44px";
    btn.style.borderRadius = "50%";
    btn.style.background = "#630D16";
    btn.style.color = "#D4AF37";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.fontSize = "20px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "9999";
    btn.style.boxShadow = "0 8px 25px rgba(0,0,0,0.35)";

    btn.onclick = () => {
        localStorage.removeItem("valentineUnlocked");
        alert("Locked 🔐");
        window.location.href = "lock.html";
    };

    document.body.appendChild(btn);
}