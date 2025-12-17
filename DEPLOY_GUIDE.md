# How to Deploy Kings Kingdom to Netlify

This guide will help you upload your code to GitHub and deploy it to Netlify.

## Step 1: Download the Code
1. In the Manus interface (right panel), go to the **Code** tab.
2. Click the **Download All** button.
3. This will download a zip file of your project. Extract this folder on your computer.

## Step 2: Upload to GitHub
1. Go to [GitHub.com](https://github.com) and sign in.
2. Click the **+** icon in the top right and select **New repository**.
3. Name it `kings-kingdom` (or any name you like).
4. Select **Private** (recommended) or Public.
5. Click **Create repository**.
6. On the next screen, you will see options to upload code.
   - If you are comfortable with command line (Git):
     ```bash
     cd path/to/extracted/folder
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/kings-kingdom.git
     git push -u origin main
     ```
   - **Easier Method (GitHub Desktop or Web Upload):**
     - You can simply click **"uploading an existing file"** link on the GitHub page if your project is small enough.
     - OR download [GitHub Desktop](https://desktop.github.com/), log in, go to File > Add Local Repository, select your extracted folder, and click "Publish repository".

## Step 3: Deploy to Netlify
1. Go to [Netlify.com](https://www.netlify.com/) and sign in.
2. Click **"Add new site"** > **"Import from an existing project"**.
3. Select **GitHub**.
4. Authorize Netlify to access your GitHub account if asked.
5. Search for and select your `kings-kingdom` repository.
6. Netlify will detect the settings automatically:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
7. Click **Deploy Site**.

## That's it!
Netlify will build your site (takes about 1-2 minutes). Once done, you will get a link like `https://kings-kingdom-123456.netlify.app`.

### Important Notes
- **Admin Access:** Remember your admin username is `AlgoKingX`.
- **Data Persistence:** Since this is a static site simulation, data (points, users) is stored in the browser's Local Storage. If users clear their cache or switch devices, their progress will reset. For a real production app with permanent data, you would need a backend database (which requires a more complex setup).
