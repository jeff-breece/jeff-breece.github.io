---
title: "InfoPath Team Development"
date: 2019-06-29T02:00:04
slug: infopath-team-development
wayback_timestamp: 20190629020004
original_permalink: https://jeffbreece.com/infopath-team-development/
---
[Home](https://web.archive.org/web/20190629020004/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190629020004/https://jeffbreece.com/category/sharepoint/) › InfoPath Team Development

# InfoPath Team Development

__Posted on[ November 15, 2012](https://web.archive.org/web/20190629020004/https://jeffbreece.com/infopath-team-development/ "InfoPath Team Development") by [![](https://web.archive.org/web/20190629020004im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190629020004/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190629020004/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190629020004/https://jeffbreece.com/infopath-team-development/#respond)

Update 12-09-2012

An InfoPath developer provided me with some feedback that makes the PowerShell script in conjunction with the makecab process unnecessary. All that needs to be done is to build the template, extract the files using the built in InfoPath ‘Export Source File’ process under File->Publish. Check those into SVN. To make changes you just check out the project from SVN and right click on the manifest.xsf make your changes and save over the extracted assets in the checked out project folder. If there are changes that create new files remember to add them to source control as well.

* * *

As any department expands from novelty to serious working on the same assemblies at the same time groups; managing versions becomes crucial to maximizing productivity. When working on SharePoint projects a lot of that is just business as usual. Visual Studio workflows, site templates, event receivers and so on.

What do you do with an InfoPath Designer XSN when you have more than one developer to manage? Well, just break it down and use the same tools you are already employing. In my case we use Subversion and TortioseSVN. Add Power Shell, Code Compare (or NotePad++) and MakeCab.exe and you can roll a solution on the back of developer cooperation.

This document “[InfoPath Team Development](https://web.archive.org/web/20190629020004/https://jeffbreece.com/site/files/InfoPathTeamDevelopment.docx)” explains how I introduced parallel development into our shop. The methodology I pulled from existing web examples which I turned into a PowerShell script is viewable as a text download as “[MakeDirectiveFile](https://web.archive.org/web/20190629020004/https://jeffbreece.com/site/files/MakeDirectiveFile.txt).”

The Word Document explains how to roll XSN’s like marbles.

![](https://web.archive.org/web/20190629020004im_/https://jeffbreece.com/site/files/vc-concepts.png)

‹ [MVC Love](https://web.archive.org/web/20190629020004/https://jeffbreece.com/mvc-love/)

[InfoPath & jQuery backed forms](https://web.archive.org/web/20190629020004/https://jeffbreece.com/goodbye-info-path-hello-jquery/) ›

### Leave a Reply [Cancel reply](/web/20190629020004/https://jeffbreece.com/infopath-team-development/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190629020004/https://akismet.com/privacy/).
