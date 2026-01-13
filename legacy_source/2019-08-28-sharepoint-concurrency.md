---
title: "SharePoint & Concurrency"
date: 2019-08-28T14:42:01
slug: sharepoint-concurrency
wayback_timestamp: 20190828144201
original_permalink: https://jeffbreece.com/sharepoint-concurrency/
---
[Home](https://web.archive.org/web/20190828144201/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190828144201/https://jeffbreece.com/category/sharepoint/) › SharePoint & Concurrency

# SharePoint & Concurrency

__Posted on[ August 26, 2012](https://web.archive.org/web/20190828144201/https://jeffbreece.com/sharepoint-concurrency/ "SharePoint & Concurrency") by [![](https://web.archive.org/web/20190828144201im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190828144201/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190828144201/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190828144201/https://jeffbreece.com/sharepoint-concurrency/#respond)

Working with SPS for five years now continues to be a fun and rewarding path. Our shop just went to production with an employee incentive system that we’d been working on since November of 2011. I re used the composite pattern that both [Pariveda Solutions](https://web.archive.org/web/20190828144201/http://www.parivedasolutions.com/Pages/Home.aspx) and [Slalom Consulting](https://web.archive.org/web/20190828144201/http://www.slalom.com/) employed while designing a couple enterprise wide PMP systems for us in the past. Namely, we chose InfoPath, lists and SPS workflows.

Of course, as we discovered late in the game, InfoPath comes with some limitations. Fundamentally it’s a document not a user interface. For example, when the document is open by a user and happens to have update methods to other lists; parent child functionality concurrency issues are like a mine field. While our InfoPath designer dealt with that using a hat trick try/catch. The issue still remains.  
This is more of an enterprise design question than a limitation of SPS. I’d like SPS to be aware of record locks consistently across the SPFile & SPItem object types. Perhaps even dealing with accidentally unreleased locks through a background process like a Timer Job scoped to the Farm not just a local workflow solution. I work with a group of IBM folks who dealt with this by setting “In Use” flags. Of course not a small number of the help desk calls are to clear the locks while processing orders.

SPS offers version control for SPFile not SPItem objects. Even so, you would either expose the user with a choice to lock it or do a lazy automatic lock for the first user in the SPFile if you build a UI inside a SPFile object. Here, you at least get a method to execute checking if an object is locked before registering an on change event that will require an .Update().

The first thing I think we should do as designers is to only use InfoPath where it’s appropriate. Things that are truly meant to be electronic forms, not full blown UI’s that pull in parent child relationships that may behave differently within a complex rule set. Instead we should be using linked Web Parts where acceptable, custom built Web Parts or straight up HTML and JavaScript. In this way you are working with as many related lists and libraries that are required for your application without being inside a document that gets locked automatically leaving the children unlocked.

Secondly, since SPS does not offer a locking mechanism for SPItems, the task is on the designer to build columns that represent an “In Use” flag like my IBM counter parts employ. When an item, or set of items, is exposed to a user in a view of some sort they should be checked first if they are already in use. If not then they should be “locked” with a setter method. That way if other users pull in the same items in some other task the records will show as locked and remove the concurrency issue altogether. Well, mostly. Never say never when you are making something perform beyond its boundaries.

It’s not sexy but to extend SPS into a transactional arena you have to plan for these situations. That is, if you continue to design an application that uses SPS lists to record transactional information.

Andreas Grabner wrote an excellent post on the site About:Performance titled [“How to avoid the top 5 SPS Performance Mistakes.”](https://web.archive.org/web/20190828144201/http://blog.dynatrace.com/2010/03/18/how-to-avoid-the-top-5-sharepoint-performance-mistakes/) Point 5 is exactly what I am talking about here. Therefore a better way to roll an enterprise application using SPS as the development platform would be to build the UI and business process inside of SPS. The real fix is to use an actual relational database engine that supports traditional transaction management and concurrency handling. Since SPS has the BCS and Secure Store Service for credential passing, this is not only easy but it makes SPS compatible with all major DBM platforms.

In the end, Grabner is right. “Before starting a SharePoint project really think about what data you have – how frequently you need it and how many different users modify it” That is not to say don’t use SPS as the platform, just be cognizant of the boundaries of its various features. In my case, it was record locking differences between SPFiles and SPItems. Were it not for our excellent InfoPath developer, we would have been in some hot water while a deadline faced us square in the chops. In the future I will always opt for a solution that uses technology which was built specifically for a given purpose. Be it MSSQL, Oracle or even MySQL … this is where I will look for enterprise support within larger scale builds while using SPS as a delivery platform.

It’s all about the right tool for the job.

‹ [Cleanliness is next to…](https://web.archive.org/web/20190828144201/https://jeffbreece.com/cleanliness-is-next-to/)

[Lotus Notes Conversion Lessons](https://web.archive.org/web/20190828144201/https://jeffbreece.com/lotus-notes-conversion-lessons/) ›

### Leave a Reply [Cancel reply](/web/20190828144201/https://jeffbreece.com/sharepoint-concurrency/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190828144201/https://akismet.com/privacy/).
