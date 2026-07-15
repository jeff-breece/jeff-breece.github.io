---
title: "Composite Application"
date: "2019-06-28T12:04:40"
categories:
  - archive
  - sharepoint
tags:
  - outdoors
  - sharepoint
  - technology
archived: true
original_permalink: "https://jeffbreece.com/composite-application/"
---

The team of folks I work with got a very cool opportunity to leverage SharePoint 2010 to drive a buisness process near and dear to my heart as a former fine wine sales representative. The composite applications purpose is to create, track and report back to SAP various types of sales incentives across the organization. We’ll be using the following in our build; InfoPath form library(header record), list for results (detail records), sequential workflows (header & detail), BCS connections to a staging DB, Custom timer job to pull info from SAP & to report back to SAP, retention policy, and of course Power Shell admin scripts.

I highly recommend Phil Wicklund’s book “[SharePoint 2010 Workflows in Action](http://www.amazon.com/SharePoint-2010-Workflows-Action-Wicklund/dp/1935182714)“. While SPD 2010 has introduced a significant set of improvements it still suffers from some limitations. Namely, oddly enough, looping within a workflow. SPS and Visual Studio 2010 rise to the occasion. Fortunately with Visual Studio we develop the exact workflow our business process requires.

![desk shot](https://jeffbreece.com/site/assets/images/blog_assets/desk.jpg)

[Experiment](https://jeffbreece.com/experiment/) ›
