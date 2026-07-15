---
title: "InfoPath & jQuery backed forms"
date: "2019-08-28T15:17:51"
categories:
  - archive
  - sharepoint
tags:
  - cooking
  - outdoors
  - running
  - sharepoint
  - technology
archived: true
original_permalink: "https://jeffbreece.com/goodbye-info-path-hello-jquery/"
image:
  path: /images/unsplash/infopath-jquery-backed-forms.jpg
  alt: "InfoPath & jQuery backed forms. Photo by Peter Robbins on Unsplash"
---

SharePoint 2010 is an enterprise application development framework.

I’ve had the opportunity to work on a couple large scale projects with two different Dallas based consulting firms over the past 6 years. Both used the pattern of Info Path browser based UI’s, a Form Library and custom Work Flows. Both applications had user bases that scaled up and beyond 1000+ users. The latter was built for a potential scale of 5000 users.

As I continue to work with jQuery, my sights are increasingly focused on applications based with higher performance within the confines of a small on premise farm. The old paradigm of Info Path and Work Flow development is great for small to midsized projects on modest hardware. However, under increasing load, it tends to cause all sorts of rubber bands to fly off of the SharePoint platform. There are numerous articles that speak to this, that and the other happening when resources become stressed.

For example “We believe this issue is caused by a race condition and is therefore, intermittent. However, this is exaggerated when the servers that are running workflow are under load.” This is from a [blog post](http://connect.nintex.com/forums/ShowThread.aspx?PostID=27890#27890) I was reminded of last week by our admin. I remember encountering similar info pointing to a CU a couple years ago related to delay activity issues and rehydration failures by the timer service.

Using the old paradigm you get something like the design in figure 1.

  
Figure 1 – Click to enlarge.

Choosing to use a more modern strategy, you may look at something like the design in figure 2.

  
Figure 2 – Click to enlarge.

The net gain would be to leverage jQuery within a web part to dramatically improve the user experience using few post backs, removing server side delays that go through multiple layers before finally executing spocs, as SharePoint API calls, on the backend execute returning to the browser, throttling and Role Assignment trimming from the WF & engine Timer Service.

SharePoint is an enterprise platform… but as developers on very small SharePoint farms, we have to be very creative to maintain application performance. Bells & whistles are great for very small business and team site applications. However, by choosing to forego some of those bells and whistles, real gains can be realized while still leveraging SharePoint within the enterprise.
