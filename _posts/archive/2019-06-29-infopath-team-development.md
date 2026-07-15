---
title: "InfoPath Team Development"
date: "2019-06-29T02:00:04"
categories:
  - archive
  - sharepoint
tags:
  - sharepoint
  - technology
archived: true
original_permalink: "https://jeffbreece.com/infopath-team-development/"
image:
  path: /images/unsplash/infopath-team-development.jpg
  alt: "InfoPath Team Development. Photo by Bernd 📷 Dittrich on Unsplash"
---

Update 12-09-2012

An InfoPath developer provided me with some feedback that makes the PowerShell script in conjunction with the makecab process unnecessary. All that needs to be done is to build the template, extract the files using the built in InfoPath ‘Export Source File’ process under File->Publish. Check those into SVN. To make changes you just check out the project from SVN and right click on the manifest.xsf make your changes and save over the extracted assets in the checked out project folder. If there are changes that create new files remember to add them to source control as well.

* * *

As any department expands from novelty to serious working on the same assemblies at the same time groups; managing versions becomes crucial to maximizing productivity. When working on SharePoint projects a lot of that is just business as usual. Visual Studio workflows, site templates, event receivers and so on.

What do you do with an InfoPath Designer XSN when you have more than one developer to manage? Well, just break it down and use the same tools you are already employing. In my case we use Subversion and TortioseSVN. Add Power Shell, Code Compare (or NotePad++) and MakeCab.exe and you can roll a solution on the back of developer cooperation.

This document “[InfoPath Team Development](https://jeffbreece.com/site/files/InfoPathTeamDevelopment.docx)” explains how I introduced parallel development into our shop. The methodology I pulled from existing web examples which I turned into a PowerShell script is viewable as a text download as “[MakeDirectiveFile](https://jeffbreece.com/site/files/MakeDirectiveFile.txt).”

The Word Document explains how to roll XSN’s like marbles.
