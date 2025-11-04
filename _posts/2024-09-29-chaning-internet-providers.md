---
layout: post
title:  "Changing Internet Service- with a bit of data to back it up"
date:   2024-09-29 07:00:00 -0400
image: /images/att-speeds.png 
description: "Speed analytics of AT&T vs Spectrum Internet"
categories: howto
tags:
  - networking
  - python
  - automation
  - data-analysis
  - linux
---
I finally pulled the plug now that AT&T Internet Air came out. I threw together a Python script and some visuals on a Cron schedule to get some comparison speeds over time. All I have to say is, I apologize to anyone who had to sit through a meeting with me over Teams on my old network connection.
 <!--more-->

### Overview
I have been struggling with Spectrum Internet, formerly Time Warner now for around 9 years. There were simply no other alternatives, and I check about every so often for other providers, never getting anywhere. Also, my goals are to reduce spend and improve both speed and reliability since I am still partly a remote worker and, well, Netflix. So basically, that rules out Starlink right out the gate from the cost angle.

But back to the motivation for this little home project. I've had building cabling issues that are partly out of my control, numerous arguments about my own (I now have two) vs company provided cable modems, upwards of 8 service visits to remediate the cable problem all to no avail. Well, AT&T came out with 5G+ service (as did T Mobile and a few other providers) recently and I decided to give that a trial run. I cooked up a Python script that uses the speedtest-cli on my Ubuntu development machine in my home office and am letting it collect logs for a couple weeks both on the new access device and the old one for comparison.

***[Git Repo](https://github.com/jeff-breece/speed-analysis/tree/main)***

### Results
**Spectrum**
![Spectrum Speeds]({{ site.url }}{{ site.baseurl }}/images/spectrum-speeds.png)
**AT&T Internet Air**
![AT&T Internet Air Speeds]({{ site.url }}{{ site.baseurl }}/images/att-speeds.png)
### Requirements

- Install the `speedtest-cli` package:

```bash
sudo apt update
sudo apt install python3-pip
pip install speedtest-cli
```

### Python Script
- See the speedtest.py file in the repo

### Make the Script Executable

```bash
chmod +x speedtest.py
```

### Set Up the Cron Job

To set up a cron job that runs this script every 30 minutes, follow these steps:

1. Open the crontab editor:

   ```bash
   crontab -e
   ```

2. Add the following line to the crontab file:

   ```bash
   */30 * * * * /usr/bin/python3 /path/to/the/script/speedtest.py
   ```

*Replace `/path/to/the/script/` with the actual path where you saved the script.*

### Notes:
- The log file is saved at `/path/to/the/script/log/wifi_speed.log`. You might need to adjust the path depending on the permissions or preferences.
- Ensure that the script path is correct in the crontab entry.
- You can check the log file with `cat /path/to/the/script/log/wifi_speed.log` or one of the report scripts in the repo.
- This script will now run every 30 minutes, measuring and logging the WiFi connection speeds on the Ubuntu machine.

### Error Handling
- The log file indicates that the script is successfully logging the speed test results but occasionally encounters an error when trying to connect to servers to test latency.
- Modify the script to handle intermittent connectivity issues more gracefully. For example, you can retry the speed test after a short delay if it fails initially.

### Explanation:
- **Retry Mechanism:** The script now attempts the speed test up to 3 times with a 10-second delay between attempts if an error occurs. This can help mitigate temporary connectivity issues.
- **Break After Success:** The loop will break after a successful speed test, preventing unnecessary retries.
- **Final Error Log:** If the script still fails after the maximum retries, it logs the error and stops.

### 2. **Monitor the Logs**
- Continue to monitor the log file (`wifi_speed.log`) to see if this retry mechanism reduces the occurrence of errors. 
- The goal is to have more successful test results logged.

### 3. **Check Network Stability**
- If errors persist frequently, it might be worth investigating the stability of the network connection. 
- Regularly encountering "Unable to connect to servers" might indicate an issue with the local network or ISP.

### 4. **Optional: Increase Timeout**
- If the connection is sometimes slow to establish, consider increasing the timeout for the speed test command by adjusting the command used in `subprocess.run()` to include the `--timeout` option (e.g., `--timeout=30`).

### CRON Job Troubleshooting
- If the cron job isn't running as expected, here are some steps to troubleshoot and resolve the issue:

### 1. **Check the Crontab Entry**
   Ensure that the cron job is correctly entered in the crontab. You should have something like this:

   ```bash
   */30 * * * * /usr/bin/python3 /path/to/the/script/speedtest.py
   ```

   Common mistakes include:
   - Incorrect path to the Python interpreter (`/usr/bin/python3`).
   - Incorrect path to the script (`/path/to/the/script/speedtest.py`).
   - Missing shebang (`#!/usr/bin/env python3`) at the top of the script (although this is optional if you specify the Python interpreter in the cron job).

### 2. **Ensure the Script is Executable**
   Make sure the script has the appropriate executable permissions:

   ```bash
   chmod +x /path/to/the/script/speedtest.py
   ```

### 3. **Check Cron Logs**
   You can check the system logs to see if the cron job is being executed or if it’s running into any errors. View the cron log with:

   ```bash
   grep CRON /var/log/syslog
   ```

   Look for entries that correspond to the cron job. If there’s an issue, the logs might give you a clue.

### 4. **Output Errors to a Log File**
   Redirect errors from the cron job to a log file for easier debugging. Modify the crontab entry like this:

   ```bash
   */30 * * * * /usr/bin/python3 /path/to/the/script/speedtest.py >> /path/to/the/script/cron.log 2>&1
   ```

   This will redirect both standard output and errors to `cron.log`, where you can check for issues.

### 5. **Check the Environment Variables**
   Cron jobs run in a very minimal environment. If the script depends on certain environment variables (like `PATH`), they might not be set correctly in the cron job environment. You can specify the full path to any commands you’re running, or manually set environment variables in the crontab file.

   You can add something like this at the top of the crontab to set the `PATH`:

   ```bash
   PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
   ```

### 6. **Test the Script Manually**
   Run the script manually from the command line using the exact command in the cron job to ensure it works:

   ```bash
   /usr/bin/python3 /path/to/the/script/speedtest.py
   ```

   If it works manually but not in cron, the issue is likely related to environment variables, permissions, or path settings.

### 7. **Restart the Cron Service**
   If you made changes to the crontab or installed new cron jobs, you might need to restart the cron service:

   ```bash
   sudo service cron restart
   ```

### 8. **Confirm Cron Daemon is Running**
   Ensure the cron daemon is running. You can check its status with:

   ```bash
   sudo service cron status
   ```