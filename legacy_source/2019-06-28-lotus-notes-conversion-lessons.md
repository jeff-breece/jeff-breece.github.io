---
title: "Lotus Notes Conversion Lessons"
date: 2019-06-28T12:05:57
slug: lotus-notes-conversion-lessons
wayback_timestamp: 20190628120557
original_permalink: https://jeffbreece.com/lotus-notes-conversion-lessons/
---
[Home](https://web.archive.org/web/20190628120557/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190628120557/https://jeffbreece.com/category/sharepoint/) › Lotus Notes Conversion Lessons

# Lotus Notes Conversion Lessons

__Posted on[ October 13, 2012](https://web.archive.org/web/20190628120557/https://jeffbreece.com/lotus-notes-conversion-lessons/ "Lotus Notes Conversion Lessons") by [![](https://web.archive.org/web/20190628120557im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190628120557/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190628120557/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190628120557/https://jeffbreece.com/lotus-notes-conversion-lessons/#respond)

The team and I have learned a great deal during the time we’ve been converting Domino databases to SharePoint composite applications. Our first hurdle was met in accessing and deconstructing the Notes data programmatically in .Net. (I wrote about that initially in this post which served as one of our proof of concept builds; [Lotus Notes to SPS Conversions](https://web.archive.org/web/20190628120557/https://jeffbreece.com/site/index.php/blog/get_by_id/2)).

We have been approaching SharePoint development using the pattern of InfoPath user interfaces, workflows, timer jobs, and any required meta info either as columns or linked data from supporting lists. It’s the practice that we learned from both consulting companies we hired when SharePoint was the bright shiny new thing in the Java/IBM shop at the time. Five years on, with the Notes projects nearly complete, I realize now that it’s not a one size fits all SharePoint design pattern.

For instance, I’ve experienced some measure of frustration with the Notes document object and form/view mechanisms. As a SharePoint developer I suspect the intention of the form and view in Notes is to expose elements of the document individually or as a grouped collection. When a Notes developer extends his application they do so by adding elements to the form and views. These elements then become additional properties of the Notes document itself. Keep calm and carry on years later you end up with this enormous object with no clear representation of the information that is most meaningful.

Similarly, when you use InfoPath you are immediately bound to a document library and its intended purpose. This is the problem. Not all applications are suited to document based solutions. And this is where using the strengths of SharePoint make sense. It is not just a document repository. Its strength is seen in how it allows us to treat a piece of information like an instance of a class object in .Net or Java. By defining a content type and then structuring the columns it requires logically from various sources allows you to build well-structured information. This will always be superior to the document paradigm even when you end up using a document based solution. Start with the content type.

Boiling all this down; I’m rolling my final Notes DB project using only content types and lists. Not a hint of InfoPath. Yeah sure I’ll use some workflows and possibly a custom timer job to provide some user required functionality but architecturally I will be using SharePoint the way I think it was meant to be. Presenting organized information structures.

To conclude I have to be fair and state that I don’t think it’s a failure of the Notes platform or any developer’s designs. It’s all about how information is regarded. Not as an undefined document object, but as a logical representation of elements which define a business item. SharePoint has an edge in the latter arena across many other enterprise systems. While many think of SharePoint as merely a document management system, it’s list and column structures allows a developer, of any level, to do so much more.

![](https://web.archive.org/web/20190628120557im_/https://jeffbreece.com/site/assets/images/blog_assets/many.jpg)

‹ [SharePoint & Concurrency](https://web.archive.org/web/20190628120557/https://jeffbreece.com/sharepoint-concurrency/)

[MVC Love](https://web.archive.org/web/20190628120557/https://jeffbreece.com/mvc-love/) ›

### Leave a Reply [Cancel reply](/web/20190628120557/https://jeffbreece.com/lotus-notes-conversion-lessons/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190628120557/https://akismet.com/privacy/).
