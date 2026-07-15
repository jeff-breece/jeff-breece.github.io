---
title: "Security Scopes"
date: "2019-06-29T01:40:05"
categories:
  - archive
  - sharepoint
tags:
  - sharepoint
  - technology
archived: true
original_permalink: "https://jeffbreece.com/security-scopes/"
image:
  path: /images/unsplash/security-scopes.jpg
  alt: "Security Scopes. Photo by Soliman Cifuentes on Unsplash"
---

When you absolutely have to use unique permissions while building SharePoint applications; do it the fastest way possible.

In the case of an application where every item in a list is meant to have broken inheritance and uniquely assigned permissions you see a lot of guys doing this. A case where you passed the [BreakRoleInheritance](http://msdn.microsoft.com/en-us/library/microsoft.sharepoint.splistitem.breakroleinheritance.aspx) method a value of true then looped over the ACL collection of SPRoleAssignments to strip everything off.

![](/images/archive/site/assets/images/blog_assets/Roles.png)  
Figure 1.

A much more scalable practice is to pass false to the BreakRoleInheritance method.

  
Figure 1.

Here’s a great post on what Unique Permissions really mean in SharePoint; [“Clarify the Security Scope limits in SharePoint lists,”](https://www.nothingbutsharepoint.com/sites/itpro/Pages/Clarify-the-Security-Scope-limits-in-SharePoint-lists.aspx) Joel Plaut 2012. Regarding the limit of unique permissions a List can contain be 50k; “The limit is not the unique combinations of ACLs, but instead the number of times permissions has been broken from a parent.”

Of course the moral of this story is to build SharePoint apps that don’t use unique permissions. But when you have to, do it fast.
