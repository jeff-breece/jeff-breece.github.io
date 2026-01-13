---
title: "Lotus Notes to SPS Conversion"
date: 2019-06-28T15:30:21
slug: lotus-notes-to-sps-conversion
wayback_timestamp: 20190628153021
original_permalink: https://jeffbreece.com/lotus-notes-to-sps-conversion/
---
[Home](https://web.archive.org/web/20190628153021/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190628153021/https://jeffbreece.com/category/sharepoint/) › Lotus Notes to SPS Conversion

# Lotus Notes to SPS Conversion

__Posted on[ October 16, 2011](https://web.archive.org/web/20190628153021/https://jeffbreece.com/lotus-notes-to-sps-conversion/ "Lotus Notes to SPS Conversion") by [![](https://web.archive.org/web/20190628153021im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190628153021/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190628153021/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190628153021/https://jeffbreece.com/lotus-notes-to-sps-conversion/#respond)

I recently had an opportunity to convert old Lotus Notes database applications to SPS. Granted, I had a little bit of a time understanding the whole form/view document collection thing in Notes but Visual Studio came to the rescue.

After analyzing the Notes db through a SQL lens I got a feel for the data set. I then set up a Visual Studio 32 bit project and then added a reference to Interop.Domino.dll. With that I created the extract process seen in the [NotesExtract](https://web.archive.org/web/20190628153021/https://jeffbreece.com/site/files/NotesExtract.txt) class (links to a text file). This little standalone connects to a Domino server, database and view then iterates over all the items. It writes these items to a delimited text file. If the item has file attachments it records it in the item record (for later streaming into SPS) and then physically extracts the attachment.

The second project is the 64 bit SharePoint Object model piece that uses the text data file and instantiates new Policy objects which are stored in a List collection. It then connects to SPS where we get a SPWeb and then create a SPListItemCollection which we use to create new List items from the data stored in the Policy collection. You can see this in the [SPImport](https://web.archive.org/web/20190628153021/https://jeffbreece.com/site/files/SPSImport.txt) class excerpt (links to a text file).

The code was just a utility which we used several times over on different databases through the Summer during our conversion process from Notes to SharePoint versus buying a product we’d used for a time and then archive.

‹ [Experiment](https://web.archive.org/web/20190628153021/https://jeffbreece.com/experiment/)

[SPS document attributes](https://web.archive.org/web/20190628153021/https://jeffbreece.com/sps-document-attributes/) ›

### Leave a Reply [Cancel reply](/web/20190628153021/https://jeffbreece.com/lotus-notes-to-sps-conversion/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190628153021/https://akismet.com/privacy/).
