---
title: "Upward Boundaries"
date: 2019-08-28T15:09:43
slug: upward-boundaries
wayback_timestamp: 20190828150943
original_permalink: https://jeffbreece.com/upward-boundaries/
---
[Home](https://web.archive.org/web/20190828150943/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190828150943/https://jeffbreece.com/category/sharepoint/) › Upward Boundaries

# Upward Boundaries

__Posted on[ November 15, 2012](https://web.archive.org/web/20190828150943/https://jeffbreece.com/upward-boundaries/ "Upward Boundaries") by [![](https://web.archive.org/web/20190828150943im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190828150943/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190828150943/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190828150943/https://jeffbreece.com/upward-boundaries/#respond)

The largest SharePoint application that I’ve designed so far, which I have yet to blog on architecture, began with the desire to roll a no code solution.

12 months later from the time that it hit the meeting rooms and white boards my team has accomplished a great deal. Some of it was bending the platform to do the complex things our business folks required. During a scheduled refactor we are finding opportunities to dramatically improve performance … and leaving behind certain no code paradigm structures.

Since this is mostly an Info Path and SPList solution we’ve been fishing through IP Controls that are data bound to Lists and controlled by declarative rules in favor of SQL and CAML based code behind DAL style methods. In addition to this we are working on dramatically reducing the amount of data being pulled into the business object at run-time. Another thing we are finally taking steps toward is using JavaScript seriously. My thought on that has been to be ever cautious when introducing client side code into SPS apps. Controlled and in a standard fashion is how I determine when it’s time to use it.

We ended up with a full blown, well documented SharePoint 2010 solution after all. Several Visual Studio sequential workflows, an event receiver, a couple application pages, a robust InfoPath template leveraging the declarative rules engine along with a fully featured VSTO code behind. All this supporting a large number of transactions, which in the end, puts money in peoples pockets.

There is always a time and a place for various strategies. As our application supported larger and larger numbers of people, refactoring out the no code paradigm aspects has definitely proved worth the effort. Both to improve performance and scale to larger use thresholds.

‹ [MVC Love](https://web.archive.org/web/20190828150943/https://jeffbreece.com/mvc-love/)

[InfoPath & jQuery backed forms](https://web.archive.org/web/20190828150943/https://jeffbreece.com/goodbye-info-path-hello-jquery/) ›

### Leave a Reply [Cancel reply](/web/20190828150943/https://jeffbreece.com/upward-boundaries/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190828150943/https://akismet.com/privacy/).
