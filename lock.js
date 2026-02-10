/* ===============================
   GLOBAL VALENTINE LOCK SYSTEM
=============================== */

(function(){

    const unlocked = localStorage.getItem("valentineUnlocked");

    if(unlocked !== "true"){

        sessionStorage.setItem("redirectAfterLock", window.location.pathname);

        window.location.href = "lock.html";
    }

})();
