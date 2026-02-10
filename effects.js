/* =========================================
   GLOBAL EFFECTS (cursor + falling hearts)
   Use on ALL pages
========================================= */

(function(){

/* ===============================
   GOLD HEART CURSOR
=============================== */

const cursor = document.createElement("div");
cursor.id = "heart-cursor";
document.body.appendChild(cursor);

document.addEventListener("mousemove", e=>{
    cursor.style.left = e.clientX + "px";
    cursor.style.top  = e.clientY + "px";
});


/* ===============================
   FALLING HEARTS
=============================== */

function spawnHeart(){

    const heart = document.createElement("div");
    heart.className = "falling-heart";
    heart.innerHTML = "❤";

    heart.style.left = Math.random()*100 + "vw";

    const size = Math.random()*10 + 12;
    heart.style.fontSize = size + "px";

    const duration = Math.random()*3 + 4;
    heart.style.animationDuration = duration + "s";

    document.body.appendChild(heart);

    setTimeout(()=>heart.remove(), duration*1000);
}

/* create hearts continuously */
setInterval(spawnHeart, 700);

})();
