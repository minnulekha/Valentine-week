# 💝 Valentine Week | Interactive Experience

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Version](https://img.shields.io/badge/Version-Valentine%20Edition%202026-pink?style=flat-square)

> *A playable love story, strictly timeline-locked and designed as a digital surprise.*

### 🔗 [Visit the Live Website](https://minnulekha.github.io/Valentine-week/index.html)

---

## 📖 About The Project

**Valentine Week** is not just a static webpage; it is an interactive web experience designed to simulate the anticipation of Valentine's week. 

Instead of a traditional layout, the application functions as a **digital advent calendar**. Users are presented with a timeline where each day of the week (Rose Day through Valentine's Day) is initially locked. Content is revealed only when the real-world date aligns with the event date, ensuring the experience unfolds in real-time.

The project moves away from standard web design patterns, utilizing **hidden clues, mini-games, and memory-based storytelling** to engage the user emotionally.

---

## ✨ Key Features

* **📅 Time-Locked Content:** Each day (Rose, Propose, Chocolate, etc.) is protected by a logic gate that checks the user's system date. Future days cannot be accessed early.
* **🔐 Secret Access:** The entry is gated by a specific passcode (`love26`), adding a layer of privacy and exclusivity.
* **🎮 Interactive Mechanics:** Includes mini-games, drag-and-drop interactions, and click-based discovery rather than static scrolling.
* **📖 Narrative Driven:** Features specific "Memory" pages (`memory2-voice.html`, `memory3-busstop.html`) that recount personal stories through UI elements.
* **📱 Mobile-First Design:** Optimized for touch interactions and vertical screens.

---

## 🔓 How It Works

### The Unlocking System
The core mechanic relies on Vanilla JavaScript `Date` objects. Scripts run on page load to compare the current timestamp against the target date for each specific event (e.g., Feb 7th for Rose Day). 

* **If the date has arrived:** The lock icon dissolves, and the interactive module for that day becomes accessible.
* **If the date is in the future:** The module remains visually locked with a "Wait for it" prompt.

### Authentication
To enter the experience, users must authenticate via the landing page.
* **Secret Code:** `love26`

---

## 🛠️ Technologies Used

This project was built entirely without frameworks to ensure lightweight performance and fine-grained control over animations.

| Component | Tech Stack |
| :--- | :--- |
| **Structure** | HTML5 (Semantic) |
| **Styling** | CSS3 (Custom Animations, Flexbox/Grid) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Hosting** | GitHub Pages |

---

## 📂 Project Structure

The codebase is modular, with distinct HTML/CSS/JS files for each day to maintain separation of concerns.

```text
Valentine-week/
├── 📂 assets/              # Images, icons, and audio files
├── 📄 index.html           # Landing page (Login)
├── 📄 calendar.html        # Main dashboard/Timeline interface
│
├── 📅 Daily Modules
│   ├── 📄 rose.html        # Rose Day interaction
│   ├── 📄 propose.html     # Propose Day (Custom CSS/JS)
│   ├── 📄 chocolate.html   # Chocolate Day mini-game
│   ├── 📄 teddy.html       # Teddy Day interaction
│   ├── 📄 promise.html     # Promise Day UI
│   ├── 📄 hug.html         # Hug Day visual
│   ├── 📄 kiss.html        # Kiss Day animation
│   └── 📄 valentine.html   # The Grand Finale
│
├── 🧠 Memory Lane
│   ├── 📄 memory2-voice.html
│   ├── 📄 memory3-busstop.html
│   └── 📄 memory4-river.html
│
└── ⚙️ Core Scripts
    ├── 📄 script.js        # Global logic
    ├── 📄 lock.js          # Security & unlocking algorithms
    └── 📄 effects.js       # Visual effects engine

```

---

## 🚀 How to Run Locally

If you wish to view the code or bypass the time-locks for testing purposes:

1. **Clone the repository**
```bash
git clone [https://github.com/minnulekha/Valentine-week.git](https://github.com/minnulekha/Valentine-week.git)

```


2. **Navigate to the directory**
```bash
cd Valentine-week

```


3. **Launch**
Open `index.html` in your preferred browser.
* *Tip: To test future days, you may need to temporarily adjust your system clock or modify the date logic in `lock.js`.*



---

## 💌 Purpose

This project explores the intersection of **web development and digital storytelling**. It demonstrates how code can be used to create emotional, timed experiences rather than just functional tools. It serves as a personal archive of memories, coded into a permanent digital format.

---

<div align="center">

**Created with ❤️ by [Minnu Lekha**](https://www.google.com/search?q=https://github.com/minnulekha)

</div>

