---
title: "SPS document attributes"
date: "2019-08-28T15:09:28"
categories:
  - archive
  - sharepoint
tags:
  - outdoors
  - sharepoint
  - technology
archived: true
original_permalink: "https://jeffbreece.com/sps-document-attributes/"
image:
  path: /images/unsplash/sps-document-attributes.jpg
  alt: "SPS document attributes. Photo by Nik Shuliahin 💛💙 on Unsplash"
---

This is part of a small stress testing project I wrote to test a user interface I built using a Content Query Web Part, a little jQuery and some XSL. The idea was to generate a couple 1000 documents that have workflows on item creation. The content rollup displays documents that have custom meta data flags for a collection of subsites that represent a team. 

Anyway, this Power Point slide shows how I pass a String List, that contains the location of the generated documents, to the method that streams them into SharePoint. This could easily be a recursive method that scans entire network drives, cleans up the file names, and then zaps them into SharePoint as part of a data migration initiative. In the real world you’d probably deal with situations like checkout required and some item columns being list lookups which I cover in the slide below.

[Link to the single slide powerPoint](https://jeffbreece.com/site/files/Adding%20items%20&%20Setting%20Attributes.pptx)
