---
title: "Lotus Notes Conversion Lessons"
date: "2019-06-28T12:05:57"
categories:
  - archive
  - sharepoint
tags:
  - cooking
  - outdoors
  - sharepoint
  - technology
archived: true
original_permalink: "https://jeffbreece.com/lotus-notes-conversion-lessons/"
---

The team and I have learned a great deal during the time we’ve been converting Domino databases to SharePoint composite applications. Our first hurdle was met in accessing and deconstructing the Notes data programmatically in .Net. (I wrote about that initially in this post which served as one of our proof of concept builds; [Lotus Notes to SPS Conversions](https://jeffbreece.com/site/index.php/blog/get_by_id/2)).

We have been approaching SharePoint development using the pattern of InfoPath user interfaces, workflows, timer jobs, and any required meta info either as columns or linked data from supporting lists. It’s the practice that we learned from both consulting companies we hired when SharePoint was the bright shiny new thing in the Java/IBM shop at the time. Five years on, with the Notes projects nearly complete, I realize now that it’s not a one size fits all SharePoint design pattern.

For instance, I’ve experienced some measure of frustration with the Notes document object and form/view mechanisms. As a SharePoint developer I suspect the intention of the form and view in Notes is to expose elements of the document individually or as a grouped collection. When a Notes developer extends his application they do so by adding elements to the form and views. These elements then become additional properties of the Notes document itself. Keep calm and carry on years later you end up with this enormous object with no clear representation of the information that is most meaningful.

Similarly, when you use InfoPath you are immediately bound to a document library and its intended purpose. This is the problem. Not all applications are suited to document based solutions. And this is where using the strengths of SharePoint make sense. It is not just a document repository. Its strength is seen in how it allows us to treat a piece of information like an instance of a class object in .Net or Java. By defining a content type and then structuring the columns it requires logically from various sources allows you to build well-structured information. This will always be superior to the document paradigm even when you end up using a document based solution. Start with the content type.

Boiling all this down; I’m rolling my final Notes DB project using only content types and lists. Not a hint of InfoPath. Yeah sure I’ll use some workflows and possibly a custom timer job to provide some user required functionality but architecturally I will be using SharePoint the way I think it was meant to be. Presenting organized information structures.

To conclude I have to be fair and state that I don’t think it’s a failure of the Notes platform or any developer’s designs. It’s all about how information is regarded. Not as an undefined document object, but as a logical representation of elements which define a business item. SharePoint has an edge in the latter arena across many other enterprise systems. While many think of SharePoint as merely a document management system, it’s list and column structures allows a developer, of any level, to do so much more.
