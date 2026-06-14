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
     --bg-app: #F8FAFC;        /* Main background color (Slate white) */
     --bg-card: #FFFFFF;       /* Card background */
     --color-text: #0F172A;    /* Primary text color (Deep slate) */
     --color-gold: #6366F1;    /* Primary accent color (Modern Indigo) */
     --color-accent-blue: #06B6D4; /* Hydration water color (Cyan) */
     /* ... */
   }
   ```
3. Swap the hex codes to match your brand's style guides. The entire UI will dynamically update to reflect the new theme.

---

## 🤖 AI Chatbot Assistant (Flow Coach)

The companion app includes a built-in productivity coach, **Flow Coach**, which operates in two distinct modes:

### 1. Offline Local Mode (100% Free & No Setup)
By default, the assistant runs locally in your browser. It does not require any internet connection or API keys. It parses keywords like "plan", "morning", "priorities", "hydration", or "pomodoro" to provide instant productivity advice, time-blocking strategies, and daily motivation.

### 2. Pro Custom AI Mode (Optional Integration)
If you want to have fully custom, open-ended conversations with your productivity coach, you can connect your own **OpenAI API Key** in the settings panel (accessible via the gear icon in the chatbot header).

#### 💰 How API Costs Work (Extremely Cheap!)
Unlike standard ChatGPT Plus which costs a flat **$20/month**, using your own API key is a **pay-as-you-go** model. You only pay for what you use, and it is incredibly cheap:
- The app uses OpenAI's high-speed **`gpt-4o-mini`** model.
- Price: **$0.15** per 1 million input tokens and **$0.60** per 1 million output tokens.
- **Real-World Cost**: 1,000 chat messages will cost you roughly **$0.01 to $0.05** (less than a nickel!).
- Putting a one-time **$5.00 pre-paid credit** on your OpenAI account will likely last you **over a year** of active daily planning!

#### 🔑 How to Get an OpenAI API Key:
1. Go to [platform.openai.com](https://platform.openai.com) and sign up for a free developer account.
2. Navigate to the **Settings > Billing** page and add a small pre-paid credit (minimum is $5.00).
3. Go to **API Keys** and click **"Create new secret key"**. Copy the key (starts with `sk-...`).
4. Open the Focus Flow Companion App, click the chatbot trigger, click the settings gear icon, paste your key, and click **Save**. Your key is saved strictly locally inside your own browser's secure cache.

#### 🧠 Comparison of API Providers:
- **OpenAI (gpt-4o-mini)**: Supported natively in the companion app. Exceptional speed and reasoning, costing ~ $0.0001 per query.
- **Claude (claude-3-5-haiku)**: Highly articulate, costs ~$0.80 per million input tokens (~$0.0005 per query).
- **DeepSeek (deepseek-chat)**: Very low cost, ~$0.14 per million tokens.

---

## 🌐 Deploying to the Web (Free)

To host this live on the web so you or your customers can access it via a custom URL:

1. **GitHub Pages (Recommended)**:
   - Create a free GitHub repository.
   - Upload the files (`index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`, `icon.png`).
   - Go to Settings > Pages, select the `main` branch, and click Save. Your site will be live at `https://<username>.github.io/<repo-name>`.
   
2. **Netlify / Vercel**:
   - Drag and drop this folder onto the Netlify dropzone for instant, free deployment.

