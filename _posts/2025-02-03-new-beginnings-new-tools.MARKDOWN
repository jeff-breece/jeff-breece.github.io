---
layout: post
title:  "New job, new laptop, new solutions to build!"
date:   2025-02-03 07:00:00 -0400
categories: howto
image: /images/new-machine.png
description: "This post is the comparison of my machines and a quick bash script I threw together to setup just the tooling I needed to do both my day job, and all of the other nerdy stuff I work with to, well, chase data rabbits and continue my lifelong path as a learner."
---
**Summary:** I'm about five months into my new job and loving every bit of it. It's putting the strengths I honed both at Nationwide and between Cardinal-Insight. This post is a bit of nostalgia for my old "frankenputer," as my mom used to say about the machines I would strap together from scrap parts. This last one? An aging AMD 5 core that got me through my last year at Nationwide and then the much tech heavier years at Insight through the Pandmic and afterwards. What follows in this blog is the comparison of my machines and a quick bash script I threw together to setup just the tooling I needed to do both my day job, and all of the other nerdy stuff I work with to, well, chase data rabbits and continue my lifelong path as a learner.

>Our mission is to liberate the computer entirely. The hardware, firmware, and operating system. --System76

 <!--more-->
### But first, the before and after specs:
```markdown
| Specification    | Asus TP410U (Old Laptop)                                | System76 Pangolin (New Laptop)            |
|------------------|---------------------------------------------------------|-------------------------------------------|
| Brand            | Asus                                                    | System76                                  |
| Model            | TP410U (Refurbed from trash)                            | Pangolin                                  |
| Processor        | Intel Core i5-8250U                                     | AMD Ryzen                                 |
| RAM              | 8 GB DDR4                                               | 32 GB DDR4                                |
| Storage          | 1 TB HDD (or SSD in some models)                        | 1 TB NVMe SSD                             |
| Graphics         | Intel UHD 620 (Integrated)                              | AMD Integrated Graphics                   |
| Display          | 14” FHD (1920x1080) Touchscreen                         | 15.6” FHD (1920x1080)                     |
| Form Factor      | 2-in-1 Convertible (Touchscreen, Flip 360°)             | Traditional Laptop                        |
| OS               | Ubuntu Linux                                            | Ubuntu Linux                              |
| Battery Life     | ~6-8 hours                                              | Varies (~8-10 hours depending on usage)   |
| Ports            | USB 3.0, USB 2.0, USB-C, HDMI, SD card slot             | USB-C, USB 3.2, HDMI, more ports          |
| Weight           | ~1.6 kg (3.5 lbs)                                       | ~1.9 kg (4.2 lbs)                         |
| RAID Support     | No native support                                       | 18 TB WD Red Pro Dual RAID                |
| Performance      | Mid-range (older CPU, 8GB RAM)                          | High-performance (Ryzen CPU, 32GB RAM)    |
```

This script:
- Installs **Git, Node.js (via NVM), and .NET SDK**.
- Configures **Git** with your name and email.
- Installs **Jekyll** if needed for GitHub Pages.
- Provides instructions for setting up a GitHub Pages repo.

---

### **Bash Script: `setup_dev_environment.sh`**
```bash
#!/bin/bash

# Exit script on error
set -e

echo "Starting setup for Git, Node.js, .NET, and GitHub Pages on Ubuntu..."

# --- 1. Update System ---
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# --- 2. Install Git ---
echo "Installing Git..."
sudo apt install -y git

echo "Checking Git version..."
git --version

# Configure Git (Ask for user input)
echo "Configuring Git..."
read -p "Enter your Git username: " GIT_USER
read -p "Enter your Git email: " GIT_EMAIL
git config --global user.name "$GIT_USER"
git config --global user.email "$GIT_EMAIL"

# --- 3. Install Node.js (via NVM) ---
echo "Installing NVM for Node.js management..."
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Installing latest LTS Node.js..."
nvm install --lts
nvm use --lts

echo "Checking Node.js and npm versions..."
node -v
npm -v

# --- 4. Install .NET SDK ---
echo "Installing .NET SDK..."
wget https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-8.0  # Change version if needed

echo "Checking .NET version..."
dotnet --version

# --- 5. Install Jekyll for GitHub Pages ---
echo "Installing Jekyll for GitHub Pages support..."
sudo apt install -y ruby-full build-essential zlib1g-dev

echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

echo "Installing Jekyll and Bundler..."
gem install jekyll bundler

echo "Checking Jekyll version..."
jekyll -v

# --- 6. GitHub Pages Setup ---
echo "Setting up GitHub Pages workflow..."

read -p "Enter your GitHub repository URL: " GITHUB_REPO
git clone "$GITHUB_REPO"
REPO_NAME=$(basename "$GITHUB_REPO" .git)
cd "$REPO_NAME"

echo "To start Jekyll for local preview, run: 'bundle exec jekyll serve'"
echo "To start a simple Markdown site, run: 'python3 -m http.server 8000'"

echo "Setup completed! Your environment is ready for development."
```

---

### **Usage**
1. **Save the script** as `setup_dev_environment.sh`.
2. **Make it executable**:
   ```bash
   chmod +x setup_dev_environment.sh
   ```
3. **Run the script**:
   ```bash
   ./setup_dev_environment.sh
   ```

---

### **What This Script Does**
✔ Installs **Git, Node.js (via NVM), .NET SDK, and Jekyll**  
✔ Configures **Git username and email**  
✔ Clones your **GitHub Pages repository**  
✔ Sets up **local preview options** for Jekyll and simple Markdown sites

### **Closing**
I'm working on a datalake project finally now that I have the power to roll one up along with a few bot projects. I guess that sort of stuck after my time working on the voice assistant for DTE while at Insight. Some writing projects and so on. I suppose, on that note, I want to take a moment and express my grattitude for all the years I have enjoyed in working with tech projects to solve buiness problems. I don't see any job as better than another in this space. What I feel instead is something I picked up at Cardinal, and carried with me ever since.

>People, Ideas and Solutions --Cardinal Solutions

That is the entire point of my work in tech and why I am excited to continue down this path.