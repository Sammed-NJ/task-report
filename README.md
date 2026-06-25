# 📋 Task Reporter & Timesheet Compiler

## 📖 About the Application

**Task Reporter & Timesheet Compiler** is a modern, high-performance web application designed to simplify the daily developer reporting workflow. It helps developers and teams construct clean, structured, and compliant daily timesheet logs or weekly sprint plans. 

Using **Google Gemini AI (Gemini 3.5 Flash)**, the application can ingest unstructured raw notes (such as bullet points, Slack messages, or rough drafts), parse them, and automatically map them into standardized, professional task items. Additionally, it audits entries in real-time for compliance with team Standard Operating Procedures (SOPs)—such as flagging vague task descriptions, identifying zero-hour estimates, and enforcing the 4-hour max limit per task to prevent over-allocation.

---

## 🛠️ Tech Stack (What is used to build)

The application is built using a modern full-stack web architecture:

- **Frontend**:
  - **React 19**: Responsive single-page application framework.
  - **TypeScript**: Ensures type-safety across all UI components and API contracts.
  - **Tailwind CSS v4 / PostCSS**: Modern styling engine with an ultra-premium, dark-mode zinc and emerald color scheme.
  - **Motion**: Fluid micro-animations and transitions.
  - **Lucide React**: Clean developer iconography.

- **Backend & APIs**:
  - **Express**: Node.js server used to serve frontend assets and route development API requests locally.
  - **Netlify Serverless Functions**: Native serverless architecture (`netlify/functions`) to securely proxy Gemini API requests in production without exposing sensitive API keys to the browser.
  - **Google Gen AI SDK (`@google/genai`)**: Interacts directly with `gemini-3.5-flash` for JSON-schema-validated task generation.
  - **esbuild**: Used to package and bundle the server typescript modules efficiently.

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** (v18 or higher is recommended)
- **Gemini API Key**: Create one securely from [Google AI Studio](https://aistudio.google.com/).

### Step-by-Step Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Sammed-NJ/task-report.git
   cd task-reporter
   ```

2. **Install Dependencies**:
   Install the required node modules for both the frontend and server:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (you can copy `.env.example` as a starting point) and add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-actual-api-key"
   ```

4. **Run the Development Server**:
   Start the Express server which hosts both the API and the Vite development server in middleware mode:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## ☁️ Production Deployment on Netlify

This application is ready for one-click deployment on Netlify using the serverless backend.

1. **Set up Build Settings on Netlify**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Functions Directory**: `netlify/functions`
   *(These are pre-configured in `netlify.toml`)*

2. **Add Environment Variables**:
   In your Netlify dashboard under **Site Settings > Environment Variables**, add your secure key:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
