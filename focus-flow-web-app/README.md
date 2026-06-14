# Focus Flow Companion Web App — Usage & Customization Guide

Welcome to the **Focus Flow Companion Web App**! This interactive digital planner is designed to work hand-in-hand with your printable PDF sheets. 

It is completely client-side, privacy-focused (all data stays local to your browser), and formatted with a custom print stylesheet to let you print out your day's work onto a standard A4 page.

---

## 🚀 How to Use the App

### 1. Run it Locally (No Installation Needed)
Simply double-click the `index.html` file in this folder to open it in any web browser (Chrome, Safari, Firefox, Edge, etc.). You don't need any special hosting or servers.

### 2. Auto-Save Feature
Any text you type into the planner, any water glasses you log, and any schedule items you add are automatically saved to your browser's local storage. If you refresh the page or return tomorrow, your notes will still be here!

### 3. Print / Export to PDF
- Click the **Export A4 PDF** button in the header, or press `Ctrl + P` (`Cmd + P` on Mac).
- The custom print stylesheet will automatically hide the Pomodoro Timer, sidebar buttons, and settings, presenting a perfectly clean, minimalist A4 daily planner sheet.
- Set your destination printer to **"Save as PDF"** or print it out directly!

---

## 🎨 Rebranding & Customizing (For Etsy Sellers / White Labeling)

If you are a digital product seller looking to resell this app or bundle it under your own brand, customizing the design is very straightforward:

### Customize the Logo & Text
1. Open `index.html` in a text editor (like VS Code, Notepad, or TextEdit).
2. Change the header title `<div class="header-logo">` to match your own brand name.
3. Edit the tips, placeholders, and labels as needed.

### Change Color Themes
1. Open `style.css` in your text editor.
2. Locate the `:root` variables block at the very top:
   ```css
   :root {
     --bg-app: #FAF6F0;        /* Main background color */
     --bg-card: #FFFFFF;       /* Card backgrounds */
     --color-text: #1A1A1A;    /* Primary text color */
     --color-gold: #C5A880;    /* Highlight accent color */
     --color-accent-blue: #A9C5E8; /* Hydration water color */
     /* ... */
   }
   ```
3. Swap the hex codes to match your brand's style guides. The entire UI will dynamically update to reflect the new theme.

---

## 🌐 Deploying to the Web (Free)

To host this live on the web so you or your customers can access it via a custom URL:

1. **GitHub Pages (Recommended)**:
   - Create a free GitHub repository.
   - Upload the files (`index.html`, `style.css`, `app.js`).
   - Go to Settings > Pages, select the `main` branch, and click Save. Your site will be live at `https://<username>.github.io/<repo-name>`.
   
2. **Netlify / Vercel**:
   - Drag and drop this folder onto the Netlify dropzone for instant, free deployment.
