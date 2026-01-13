---
title: "SPS document attributes"
date: 2019-08-28T15:09:28
slug: sps-document-attributes
wayback_timestamp: 20190828150928
original_permalink: https://jeffbreece.com/sps-document-attributes/
---
[Home](https://web.archive.org/web/20190828150928/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190828150928/https://jeffbreece.com/category/sharepoint/) › SPS document attributes

# SPS document attributes

__Posted on[ October 21, 2011](https://web.archive.org/web/20190828150928/https://jeffbreece.com/sps-document-attributes/ "SPS document attributes") by [![](https://web.archive.org/web/20190828150928im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190828150928/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190828150928/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190828150928/https://jeffbreece.com/sps-document-attributes/#respond)

This is part of a small stress testing project I wrote to test a user interface I built using a Content Query Web Part, a little jQuery and some XSL. The idea was to generate a couple 1000 documents that have workflows on item creation. The content rollup displays documents that have custom meta data flags for a collection of subsites that represent a team. 

Anyway, this Power Point slide shows how I pass a String List, that contains the location of the generated documents, to the method that streams them into SharePoint. This could easily be a recursive method that scans entire network drives, cleans up the file names, and then zaps them into SharePoint as part of a data migration initiative. In the real world you’d probably deal with situations like checkout required and some item columns being list lookups which I cover in the slide below.

[Link to the single slide powerPoint](https://web.archive.org/web/20190828150928/https://jeffbreece.com/site/files/Adding%20items%20&%20Setting%20Attributes.pptx)

![](https://web.archive.org/web/20190828150928im_/https://jeffbreece.com/site/files/stresstest_sm.jpg)

‹ [Lotus Notes to SPS Conversion](https://web.archive.org/web/20190828150928/https://jeffbreece.com/lotus-notes-to-sps-conversion/)

[Taxonomy](https://web.archive.org/web/20190828150928/https://jeffbreece.com/taxonomy/) ›

### Leave a Reply [Cancel reply](/web/20190828150928/https://jeffbreece.com/sps-document-attributes/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190828150928/https://akismet.com/privacy/).
