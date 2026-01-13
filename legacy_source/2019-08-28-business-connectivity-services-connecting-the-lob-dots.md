---
title: "Business Connectivity Services; Connecting the LOB Dots"
date: 2019-08-28T16:42:26
slug: business-connectivity-services-connecting-the-lob-dots
wayback_timestamp: 20190828164226
original_permalink: https://jeffbreece.com/business-connectivity-services-connecting-the-lob-dots/
---
[Home](https://web.archive.org/web/20190828164226/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190828164226/https://jeffbreece.com/category/sharepoint/) › Business Connectivity Services; Connecting the LOB Dots

# Business Connectivity Services; Connecting the LOB Dots

__Posted on[ October 9, 2015](https://web.archive.org/web/20190828164226/https://jeffbreece.com/business-connectivity-services-connecting-the-lob-dots/ "Business Connectivity Services; Connecting the LOB Dots") by [![](https://web.archive.org/web/20190828164226im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190828164226/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190828164226/https://jeffbreece.com/category/sharepoint/) — [2 Comments ↓](https://web.archive.org/web/20190828164226/https://jeffbreece.com/business-connectivity-services-connecting-the-lob-dots/#comments)

This post will address two specific tools that SharePoint has offered since MOSS. Business Data Catalogue (BDC) in conjunction with the Secure Store Service. On the release of SharePoint 2013 a new service layer called Business Connectivity Services (BCS) was added on top of BDC. This provided a richer client service model upon which external data could be utilized via the SharePoint framework.

My intent is to provide more context than you normally find when speaking from a developer’s standpoint. The goal is to give the reader a solid context by the use of some of my failures and successes when working with BDC and BCS. Experience is good for that at least.

“A Rootin’ Tootin’ Texas Story”

I once worked for a company in Texas. We were an IBM shop working with an iron horse of a custom RPG software package built upon an AS400. The director of application development noticed my past work with document management systems in Ohio and made an investment in me. When she decided to buy SharePoint 2007 for the enterprise my name was dropped in the hat to help steward it through its initial roll out. Coming from a LAMP and recent Java Spring background .Net felt… a _little_ different. SharePoint seemed more like the scene from Harry Potter when the new students go shopping for “bits & bobs” in Diagon Alley. It was all magic and wonder.

One of the first prototyping initiatives at hand was to build an External Content Type using BDC to access data from DB2. It was the perfect choice of technology however the table structures were such that the designs harkened back to the days of file IO. It bears mention that one of the women whom architected this system worked at NASA. She wrote part of the original telemetry system for the Apollo rockets… in assembler. These folks were brilliant. IBM came along with a fantastic product… the indestructible AS400 and it’s ever evolving RPG language.

Decades later when I came along with SharePoint and a handshake I discovered that things like keys and indexes did not exist in the DB2 tables we were supposed to expose. I sort of knew I was in trouble when all I heard from the RPG team was this and that about “files.” And they meant actual file designs with file IO operations which were later retooled to live inside DB2 as “tables” … only with the same old file designs in place. The proof of concept flopped as we discovered that BDC requires at least a _basic_ key from which to surface a data model within SharePoint.

It’s a tough job to be the developer who has to tell the former hard living ex-cop turned director of software for a large mid-sized company that “it can’t be done.” Fortunately, nobody died that day. Though I dare speculate it may have crossed her mind given the color of her neck and face.

Lessons learned include look under the hood first before even specking out any system integration initiative.

History

BDC was first introduced with Microsoft Office SharePoint Server (MOSS). Therefore it was only available in the 2007 enterprise edition of SharePoint. In this release only read, not write, actions were available and the definition files were difficult to construct XML files … unless you used tools like BDC MetaMan which we discuss later in this post. BDC became available in SharePoint Foundation 2010 as a Shared Service Provider Model (figure 1). With the introduction of BCS this has changed to a true multi-tenant using a service application architecture (figure 2). As developers, we can use this to talk with any flavor of database, WCF web service, .NET assembly as a data source (or classic DAL component) or even OData feed. It expose this information inside SharePoint as either an external list or through it’s built in REST API to things like SharePoint hosted apps that need LOB connection.

[![BDC Framework](https://web.archive.org/web/20190828164226im_/https://jeffbreece.com/wp-content/uploads/2015/10/1-300x268.gif)](https://web.archive.org/web/20190828164226/https://jeffbreece.com/wp-content/uploads/2015/10/1.gif)

Figure 1

[![BCS Framework](https://web.archive.org/web/20190828164226im_/https://jeffbreece.com/wp-content/uploads/2015/10/2-300x151.gif)](https://web.archive.org/web/20190828164226/https://jeffbreece.com/wp-content/uploads/2015/10/2.gif)

Figure 2

Double Hop

This is a well-documented issue, see figure 3, but it bears a little conversation for folks who are new to using BDC/BCS in SharePoint. We have a service application called the Secure Store Service that an administrator can provision for his/her users. This service provides a way to create a credential set for use with building things like connection strings. These are used in instances where managed code has a user context and then needs to access the credential set to pass a connection string to an external system like an RDBMS. This is a great MSDN post on how to “[Configure the Secure Store Service in SharePoint 2013](https://web.archive.org/web/20190828164226/https://technet.microsoft.com/en-us/library/ee806866.aspx).”

[![Double Hop Issue](https://web.archive.org/web/20190828164226im_/https://jeffbreece.com/wp-content/uploads/2015/10/3-300x237.png)](https://web.archive.org/web/20190828164226/https://jeffbreece.com/wp-content/uploads/2015/10/3.png)

Figure 3

Visual Studio

An individual named Fabian Williams already took the time to put together an excellent guide on how to do this: “[How To: Create, Configure, Consume SharePoint 2010 Secure Store in Business Connectivity Services](https://web.archive.org/web/20190828164226/http://www.fabiangwilliams.com/2010/04/16/how-to-create-configure-consume-sharepoint-2010-secure-store-in-business-connectivity-services/).” His post is one of the very best ways to go through the motions of creating your first BDC Visual Studio project. When you go through this example you’ll see the author is showing you how to create the project, build the entity and configure it to work with a DAL through its methods.

It is only made better by two things. One being a post titled “[SharePoint: Retrieving Credentials from the Secure Store Application using C#](https://web.archive.org/web/20190828164226/http://social.technet.microsoft.com/wiki/contents/articles/20110.sharepoint-retrieving-credentials-from-the-secure-store-application-using-c.aspx)” by Matthew Yarlett. He shows you how to access the credentials in a given Secure Store Application via managed code. The case for this would be located within your DAL class where you need to construct a connection string using information stored in the Secure Store Service Application. You will find an example in my functional demo code within my public GIT repo here: [BuckeyeSpugBdc](https://web.archive.org/web/20190828164226/https://github.com/jeffbreece/demos/tree/master/BuckeyeSpugBdc).

The second way Mr. William’s tutorial is made more useful is to think of the place where he, and I, use a LINQ data source in the Service Class where our finder methods exist. This could easily be a set of calls to an all-out fully decoupled DAL to any data source. Let me repeat that. Any Data Source. Oracle, SAP, MySQL, MS SQL Server, JDE, Kronos… you name it. If you can code it and project objects from it into a collection object… the sky’s the limit.

These last two points make BDC one of my first choices within the context of a SharePoint application where you need to get data from another system either within the browser or through a web service call returning JSON back. This functionality is already baked into SharePoint. The trick is knowing it’s there and then how and when to use it.

“A Public Sector Story”

I once had a job where a company wanted to build a highly custom paid time off system with a SQL backend for reporting purposes. On an exceptionally small budget. How we solved this problem was to create a database design in conjunction with some stored procedures and a Nintex workflow. With Nintex you have the “Call Web Service” action making BDC with an External List and the built in REST API a match made in heaven… on a dime. We were able to proceed iteratively through the project using this kind of template:

  1. Create SQL database.
  2. Create stored procs.
  3. Create External Content Types and External Lists from a BDC definition in SharePoint Designer.
  4. Create custom time off request list.
  5. Create Nintex Workflow. 
     1. On item create fire workflow.
     2. Get remaining vacation hours for the requestor via a Web Service Call to the External List.
     3. Validate that the current user has enough remaining vacation time to process the request.
     4. If true then proceed if false then inform the user to revise the request.



With this kind of process in place we easily extended the design iteratively through the remaining features.

SharePoint Designer

As with the Visual Studio portion of this post, another gentleman named Mohamed Sithik posted “[Creating Business Data Connectivity Service and External Content Type using SharePoint Designer 2010](https://web.archive.org/web/20190828164226/http://www.sharepointpals.com/post/Creating-Business-Data-Connectivity-Service-and-External-Content-Type-using-SharePoint-Designer-2010),” on SharePoint Pals. This post adeptly walks you through the steps involved in creating an external content type using SharePoint Designer. The things to remember here; you are much more limited in the types of data connections you can make out of the box without building out a WCF or a .Net assembly. And if you are doing the later then why not just build the BDC in Visual Studio in the first place and go for a more simple solution. This leaves MS SQL Server as the type of data source you can connect to with this type of project.

My only recommendation here would be to avoid using a database that is part of the SharePoint Farm. So a healthy standalone application server would be the first thing I’d check to make sure is part of the project requirements out of the gate. My caution here comes with load as your application ages and the data grows. Do your planning up front.

The second caution would be to at least set a limit filter so your ULS logs don’t become heavier than needed and, more importantly, your server performance does not feel a negative impact from the amount of data being both queried and returned through SharePoint.

“An Industrial Story”

Another client of mine had a completely brilliant mind on the ready with a fully relational design prototype implemented. The thing was that it was in SharePoint using connected lists. Now I should say this was a highly normalized representation of a design from a project management system. The guy was brilliant but sadly, SharePoint is _not_ a relational system. The other part of the project included a web interface that populated a custom list per site once the 2013 Azure workflow had finished completing it from a MS Project Server action. The kicker? We were only to use SharePoint Designer for this project.

No problem. First we built out a SQL database using the engineers connected list design relational model. We then created stored procedures to represent the data model required for the list population. After that we created the External Content Type. For the user interface we built a page with a script editor web part containing our view and controller code. The view controller listened to on change events in the view and then got data from the model using a REST API call to the External SharePoint list, and thus SQL server. We used this process to populate the custom SharePoint list. The project was a success and easily extendable as the year continued. The lesson learned here is seen in using the available tools SharePoint provides to accomplish a job in a very straightforward fashion to improve a well-intended design.

Lightening Tools BCS Meta Man

The last tool I highly recommend for clients who have a need to build External Content Types on a regular basis is Lightning Tools BCS Meta Man. It’s very well documented in the product [link](https://web.archive.org/web/20190828164226/http://lightningtools.com/products/bcs-meta-man-2010-and-2013/) and beyond easy to use to both build and deploy. This is quite simply the easiest tool I have ever used to create BDC/BCS projects. It’s much less limited than SPD in that it can connect to any system much like Visual Studio. It also automatically builds your BDC model and deploys it for you. The cases where I have seen this succeed were places that have a lot of disparate data sets, a non-technical staff, and a goal to combine different data objects in SharePoint. Users get a 5 use trial license for the demo version so it’s easy to check out and see if it fits a given need.

Closing

While there are other features including [External Data Columns](https://web.archive.org/web/20190828164226/https://msdn.microsoft.com/en-us/library/office/ee559346\(v=office.14\).aspx) and [Search](https://web.archive.org/web/20190828164226/http://blog.metrostarsystems.com/2014/03/17/sharepoint-2013-business-connectivity-services-search-and-profile-page-demo-part-3-of-3/) which can definitely come in handy for a given task I have focused this post on the basics. How to do it… and through telling stories, when to use it.

It’s only fitting to close this post by telling one last story of the old company back in Texas. You guessed it. The AS400 shop. It was a year or so later and we wanted to accomplish the task of using JDE to get personnel data by employee id. Using these records we were to hit Active Directory to update specific fields both there and custom fields in the SharePoint User Profile Store. Unlike our first failure with the AS400, this time we wrote a special view in DB2 with the help of our RPG team and easily wrote a Visual Studio BDC project in conjunction with a Timer Job. The Timer Job used the name space of the BDC assembly, the secure store service for credentials and then performed the required actions in parallel. It was the perfect end to a long year.

In conclusion, BDC is a fantastic feature of SharePoint which continues to be a part of the upcoming 2016 release and thus a good candidate to help all of us solve various business problems out in the wild.

SharePoint on!

‹ [Eggplant Involtini](https://web.archive.org/web/20190828164226/https://jeffbreece.com/eggplant-involtini/)

[Carrot ginger soup](https://web.archive.org/web/20190828164226/https://jeffbreece.com/carrot-ginger-soup/) ›

######  2 comments on “Business Connectivity Services; Connecting the LOB Dots” 

  1. ![](https://web.archive.org/web/20190828164226im_/https://secure.gravatar.com/avatar/ac396e1982cb792e46bc04a0af47b178?s=60&d=mm&r=g) Scott Jarvis says:

[ January 19, 2017 at 7:40 pm](https://web.archive.org/web/20190828164226/https://jeffbreece.com/business-connectivity-services-connecting-the-lob-dots/#comment-680)

Nice… We were pushing PDF report to a :shared drive thru the QNTC. Does SharePoint 2013 support a “share” like a windows server? Not getting any help from Professor Google.

[Reply](https://web.archive.org/web/20190828164226/https://jeffbreece.com/business-connectivity-services-connecting-the-lob-dots/?replytocom=680#respond)

     * ![](https://web.archive.org/web/20190828164226im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=60&d=mm&r=g) [Jeff Breece](https://web.archive.org/web/20190828164226/https://jeffbreece.com/) says:

[ January 19, 2017 at 8:48 pm](https://web.archive.org/web/20190828164226/https://jeffbreece.com/business-connectivity-services-connecting-the-lob-dots/#comment-681)

Thanks! Try this to provide the functionality you are looking for: [http://support.sherweb.com/Faqs/Show/how-to-connect-to-a-sharepoint-site-using-webdav-sharepoint-2013](https://web.archive.org/web/20190828164226/http://support.sherweb.com/Faqs/Show/how-to-connect-to-a-sharepoint-site-using-webdav-sharepoint-2013)

[Reply](https://web.archive.org/web/20190828164226/https://jeffbreece.com/business-connectivity-services-connecting-the-lob-dots/?replytocom=681#respond)




### Leave a Reply [Cancel reply](/web/20190828164226/https://jeffbreece.com/business-connectivity-services-connecting-the-lob-dots/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190828164226/https://akismet.com/privacy/).
