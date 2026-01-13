---
title: "Security Scopes"
date: 2019-06-29T01:40:05
slug: security-scopes
wayback_timestamp: 20190629014005
original_permalink: https://jeffbreece.com/security-scopes/
---
[Home](https://web.archive.org/web/20190629014005/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190629014005/https://jeffbreece.com/category/sharepoint/) › Security Scopes

# Security Scopes

__Posted on[ October 13, 2013](https://web.archive.org/web/20190629014005/https://jeffbreece.com/security-scopes/ "Security Scopes") by [![](https://web.archive.org/web/20190629014005im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190629014005/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190629014005/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190629014005/https://jeffbreece.com/security-scopes/#respond)

When you absolutely have to use unique permissions while building SharePoint applications; do it the fastest way possible.

In the case of an application where every item in a list is meant to have broken inheritance and uniquely assigned permissions you see a lot of guys doing this. A case where you passed the [BreakRoleInheritance](https://web.archive.org/web/20190629014005/http://msdn.microsoft.com/en-us/library/microsoft.sharepoint.splistitem.breakroleinheritance.aspx) method a value of true then looped over the ACL collection of SPRoleAssignments to strip everything off.

![](https://web.archive.org/web/20190629014005im_/https://jeffbreece.com/site/assets/images/blog_assets/Roles.png)  
Figure 1.

A much more scalable practice is to pass false to the BreakRoleInheritance method.

![](https://web.archive.org/web/20190629014005im_/https://jeffbreece.com/site/assets/images/blog_assets/Break.png)  
Figure 1.

Here’s a great post on what Unique Permissions really mean in SharePoint; [“Clarify the Security Scope limits in SharePoint lists,”](https://web.archive.org/web/20190629014005/https://www.nothingbutsharepoint.com/sites/itpro/Pages/Clarify-the-Security-Scope-limits-in-SharePoint-lists.aspx) Joel Plaut 2012. Regarding the limit of unique permissions a List can contain be 50k; “The limit is not the unique combinations of ACLs, but instead the number of times permissions has been broken from a parent.”

Of course the moral of this story is to build SharePoint apps that don’t use unique permissions. But when you have to, do it fast.

‹ [Modal windows in SharePoint](https://web.archive.org/web/20190629014005/https://jeffbreece.com/modal-windows-in-sharepoint/)

[Progress on a goal.](https://web.archive.org/web/20190629014005/https://jeffbreece.com/progress-on-a-goal/) ›

### Leave a Reply [Cancel reply](/web/20190629014005/https://jeffbreece.com/security-scopes/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190629014005/https://akismet.com/privacy/).
