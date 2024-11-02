---
layout: post  
title: "Moondock Project Architecture"  
date: 2024-11-02 07:00:00 -0400  
categories: project  
image: /images/dolly-sods.jpg
description: "Every nerd should have a passion project, this is mine."
---

**Summary:** 
A few years back, when I was leaving Nationwide and returning to coding for Insight, I fell into a group of UX'ers who were looking for a design challenge to host. Being a part of that process was truly enlightening. Taking three teams, building a pitch around a central idea, camping systems was the idea I proferred, which is where my little passion project "moondock" came from. It's just an open source thing I've been building in my free time using a collection of technologies to mainly keep my skills sharp and, on a good day, help me to understand new concepts like AI models and new cloud concepts that I had not yet had the chance to work with. Of course, my .Net and Bot Framework body of work helped propel this with momentum after recovering from the burnout of The Pandemic era. The funny thing is, that's actually taking shape now and I even have a pretty robust reserveration checking system that I have integrated with over the weekend as a main service for the build.

<!--more-->

### Solution Overview
This is my current architecture outline for my [Camply](https://github.com/juftin/camply), by Jutfin, powered *Moondock* integration solution. This diagram illustrates how the various components interact and support the campgrounds and campsite search features I am slating for my first release... and given my primary hobby is actually camping and hiking, I plan to use it and possibly integrate with a hiking platform as well.

As of this writing I have the API and middleware layers in place with some unit tests. Next will be to finish this and put the web front end into place. After that comes the bot project and the CI/CD work to move it all to Azure.

[Git Repo](https://github.com/jeff-breece/camply-receiver)


![Moondock Middleware Architecture]({{ site.url }}{{ site.baseurl }}/images/moondock-middleware-architecture.png)

### Explanation

1. **React UI**: 
   - Provides the frontend interface where users can interact with the solution, input search criteria, and view available campgrounds and campsites.
   - Sends requests to `Camply.Receiver` to initiate searches or display results.

2. **Trip-BotSkill**: 
   - A bot service that allows users to interact with the system via natural language. For instance, users can ask the bot to search for specific campsites or check availability. 
   - Bot queries are converted into requests for `Camply.Receiver`.

3. **Camply.Receiver (ASP.NET Core)**:
   - Acts as the main backend API.
   - Exposes endpoints that the UI and BotSkill can call to request data.
   - Manages search requests, parses responses from Camply middleware, and communicates with the external Camply library.

4. **Components of Camply.Receiver**:
   - **/Helpers**: Contains middleware response parsers, responsible for interpreting responses from the Camply library.
   - **/Logic**: Manages command construction, helping to build specific commands (like listing campsites or searching availability) to send to the Camply middleware.
   - **/Models**: Holds domain models such as `Campground`, `Campsite`, `CamplyRequest`, and `CamplyResponse`.
   - **/Scripts**: Contains the Python middleware services that interact directly with the Camply CLI.

5. **Camply Middleware (Python CLI)**:
   - This middleware is the core of the integration. It interfaces with the Camply CLI, sending commands to search for campgrounds, list campsites, and check availability based on the options defined.
   - Responses from Camply are parsed and returned to `Camply.Receiver` for further processing.

6. **Camply Providers**:
   - These are the various campground providers that the Camply library can access. Examples include Recreation.gov, Yellowstone, GoingToCamp, ReserveCalifornia, etc.
   - The `Camply.Receiver` solution, through Camply middleware, connects to these providers to fetch relevant data for user requests.

7. **Future Cognitive Services Integration**:
   - Reserved for additional AI capabilities, such as personalized recommendations or sentiment analysis.
   - Could provide an enriched experience by processing user preferences or adding intelligent insights for the trip planning experience.

### How It Works
- **Step 1**: A user interacts with either the **React UI** or the **Trip-BotSkill** to search for campgrounds or check campsite availability.
- **Step 2**: These interactions send requests to `Camply.Receiver` (ASP.NET Core API).
- **Step 3**: `Camply.Receiver` builds commands (through `/Logic`) and uses `/Scripts` to interact with the **Camply Middleware**.
- **Step 4**: The **Camply Middleware** sends requests to specific **Camply Providers** (like Recreation.gov, GoingToCamp) to retrieve campgrounds, campsites, and availability information.
- **Step 5**: Responses are received by the middleware and passed back to `Camply.Receiver`, where `/Helpers` parse the responses.
- **Step 6**: Parsed data is then provided back to the **React UI** or **Trip-BotSkill** to display to the user.

### **Here's to more camping trips and time under the stars!**
![Moondock Project - Design Challenge]({{ site.url }}{{ site.baseurl }}/images/car-camping.jpg)