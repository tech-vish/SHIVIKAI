# Deploying Shivikai to Linode

This guide outlines the steps to deploy your Next.js application to a Linode VPS using Ubuntu, Node.js, and PM2.

## Prerequisites
- A Linode account.
- A fresh Linode instance (Ubuntu 22.04 LTS or 24.04 recommended).
- SSH access to your Linode.

## Step 1: Server Setup
SSH into your Linode:
```bash
ssh root@<your-linode-ip>
```

Update your system:
```bash
apt update && apt upgrade -y
```

## Step 2: Install Node.js
Install Node.js (v18 or v20 LTS) using NVM or NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
```

Verify installation:
```bash
node -v
npm -v
```

## Step 3: Install Process Manager (PM2)
PM2 keeps your app running in the background.
```bash
npm install -g pm2
```

## Step 4: Upload Your Code
You can use `git` or `scp` to transfer files.
**Option A: Git (Recommended)**
1. Push your code to GitHub/GitLab.
2. Clone it on the server:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>
   ```

**Option B: SCP/SFTP**
Upload the `src`, `public`, `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs` files to a folder like `/var/www/shivikai`.

## Step 5: Install Dependencies & Build
Navigate to your project folder:
```bash
cd /path/to/your/project
npm install
```

Create your production environment file:
```bash
nano .env.local
```
Paste your API Key:
```
GROQ_API_KEY=gsk_CIASyklslcdshvDj28A1NhF8hLWGdyb3FYo4cET8rEd6MoQO3YQ
```
Save and exit (Ctrl+X, Y, Enter).

Build the application:
```bash
npm run build
```

## Step 6: Start with PM2
Start the Next.js app on port 3000:
```bash
pm2 start npm --name "shivikai" -- start
pm2 save
pm2 startup
```
(Run the command displayed by `pm2 startup` to ensure it restarts on boot).

## Step 7: Nginx Reverse Proxy (Optional but Recommended)
To access your app via a domain or standard port 80/443:

1. Install Nginx:
   ```bash
   apt install nginx -y
   ```

2. Configure Nginx:
   ```bash
   nano /etc/nginx/sites-available/shivikai
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name <your-domain-or-ip>;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/shivikai /etc/nginx/sites-enabled/
   rm /etc/nginx/sites-enabled/default
   systemctl restart nginx
   ```

## Final Check
Visit `http://<your-linode-ip>` to see your Shivikai AI Assistant running!
