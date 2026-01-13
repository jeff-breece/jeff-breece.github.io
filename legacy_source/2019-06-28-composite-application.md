---
title: "Composite Application"
date: 2019-06-28T12:04:40
slug: composite-application
wayback_timestamp: 20190628120440
original_permalink: https://jeffbreece.com/composite-application/
---
[Home](https://web.archive.org/web/20190628120440/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190628120440/https://jeffbreece.com/category/sharepoint/) › Composite Application

# Composite Application

__Posted on[ January 16, 2011](https://web.archive.org/web/20190628120440/https://jeffbreece.com/composite-application/ "Composite Application") by [![](https://web.archive.org/web/20190628120440im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190628120440/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190628120440/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190628120440/https://jeffbreece.com/composite-application/#respond)

The team of folks I work with got a very cool opportunity to leverage SharePoint 2010 to drive a buisness process near and dear to my heart as a former fine wine sales representative. The composite applications purpose is to create, track and report back to SAP various types of sales incentives across the organization. We’ll be using the following in our build; InfoPath form library(header record), list for results (detail records), sequential workflows (header & detail), BCS connections to a staging DB, Custom timer job to pull info from SAP & to report back to SAP, retention policy, and of course Power Shell admin scripts.

I highly recommend Phil Wicklund’s book “[SharePoint 2010 Workflows in Action](https://web.archive.org/web/20190628120440/http://www.amazon.com/SharePoint-2010-Workflows-Action-Wicklund/dp/1935182714)“. While SPD 2010 has introduced a significant set of improvements it still suffers from some limitations. Namely, oddly enough, looping within a workflow. SPS and Visual Studio 2010 rise to the occasion. Fortunately with Visual Studio we develop the exact workflow our business process requires.

![desk shot](https://web.archive.org/web/20190628120440im_/https://jeffbreece.com/site/assets/images/blog_assets/desk.jpg)

[Experiment](https://web.archive.org/web/20190628120440/https://jeffbreece.com/experiment/) ›

### Leave a Reply [Cancel reply](/web/20190628120440/https://jeffbreece.com/composite-application/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190628120440/https://akismet.com/privacy/).
