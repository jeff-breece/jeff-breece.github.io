---
title: "Upward Boundaries"
date: "2019-08-28T15:09:43"
categories:
  - archive
  - sharepoint
tags:
  - sharepoint
  - technology
archived: true
original_permalink: "https://jeffbreece.com/upward-boundaries/"
---

The largest SharePoint application that I’ve designed so far, which I have yet to blog on architecture, began with the desire to roll a no code solution.

12 months later from the time that it hit the meeting rooms and white boards my team has accomplished a great deal. Some of it was bending the platform to do the complex things our business folks required. During a scheduled refactor we are finding opportunities to dramatically improve performance … and leaving behind certain no code paradigm structures.

Since this is mostly an Info Path and SPList solution we’ve been fishing through IP Controls that are data bound to Lists and controlled by declarative rules in favor of SQL and CAML based code behind DAL style methods. In addition to this we are working on dramatically reducing the amount of data being pulled into the business object at run-time. Another thing we are finally taking steps toward is using JavaScript seriously. My thought on that has been to be ever cautious when introducing client side code into SPS apps. Controlled and in a standard fashion is how I determine when it’s time to use it.

We ended up with a full blown, well documented SharePoint 2010 solution after all. Several Visual Studio sequential workflows, an event receiver, a couple application pages, a robust InfoPath template leveraging the declarative rules engine along with a fully featured VSTO code behind. All this supporting a large number of transactions, which in the end, puts money in peoples pockets.

There is always a time and a place for various strategies. As our application supported larger and larger numbers of people, refactoring out the no code paradigm aspects has definitely proved worth the effort. Both to improve performance and scale to larger use thresholds.
