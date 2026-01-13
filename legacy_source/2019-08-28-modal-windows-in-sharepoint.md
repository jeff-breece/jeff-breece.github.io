---
title: "Modal windows in SharePoint"
date: 2019-08-28T16:25:40
slug: modal-windows-in-sharepoint
wayback_timestamp: 20190828162540
original_permalink: https://jeffbreece.com/modal-windows-in-sharepoint/
---
[Home](https://web.archive.org/web/20190828162540/https://jeffbreece.com/) › [sharepoint](https://web.archive.org/web/20190828162540/https://jeffbreece.com/category/sharepoint/) › Modal windows in SharePoint

# Modal windows in SharePoint

__Posted on[ October 12, 2013](https://web.archive.org/web/20190828162540/https://jeffbreece.com/modal-windows-in-sharepoint/ "Modal windows in SharePoint") by [![](https://web.archive.org/web/20190828162540im_/https://secure.gravatar.com/avatar/e0ec49ea47c3c9e70f0f0098fd1a4d12?s=32&d=mm&r=g)Jeff Breece](https://web.archive.org/web/20190828162540/https://jeffbreece.com/author/jeff/ "View all posts by Jeff Breece") Posted in [sharepoint](https://web.archive.org/web/20190828162540/https://jeffbreece.com/category/sharepoint/) — [No Comments ↓](https://web.archive.org/web/20190828162540/https://jeffbreece.com/modal-windows-in-sharepoint/#respond)

I had a chance to work with jQuery in SharePoint 2010 recently which was fun and easy.

The task was to show a select set of users a modal window with text that comes from the legal department. Already having a settings list with key value pairs stored as list columns in SharePoint. It was just a matter of selecting the legal statement from this list and displaying it in a pop up.

Flow of events

Get Current User  
Check to see if the user is a member of the special people SharePoint security group.  
Check to see if the user had already logged a click event for that day.  
If no, then proceed to query the list for the disclaimer text.  
Fire off a jQuery append to the hidden div on the page.  
Fire off a call to the SP.UI.ModalDialog with handlers for the yes/no actions. (Figure 1).  
On yes, write a record to a List that records the user click for tracking purposes.  
Dismiss the modal and write out a thank you to the user via the SP.UI.Notify.addNotification method. (Figure 2).  
On no, kindly remind the user the site won’t be available until they agree. (Figure 3).

Using a Visual Studio empty SharePoint project and adding a Script module to it; I was able to package up the custom JavaScript functions, the CSS required for the Moda UI and the required jQuery libraries. I used this in order to make deployment across the environments consistent and easier for our administrator. All that remained was using SPD, yeah I know, to add the hidden modal div to the master page and use the script manager to add in the script references as well as the css link.

The whole thing took under 4 hours to roll. It’s definitely stuff that spikes my interest in SharePoint 2013 and it’s heavier reliance on JavaScript for user interface actions. Looking forward to the next project where I get to work with jQuery again. That balance between server and client side processing seems rife with great opportunities to make the user experince surrounding SharePoint better.

![](https://web.archive.org/web/20190828162540im_/https://jeffbreece.com/site/assets/images/blog_assets/Modal_1.png)  
Figure 1.

![](https://web.archive.org/web/20190828162540im_/https://jeffbreece.com/site/assets/images/blog_assets/Modal_2.png)  
Figure 2.

![](https://web.archive.org/web/20190828162540im_/https://jeffbreece.com/site/assets/images/blog_assets/Modal_3.png)  
Figure 3.

‹ [Then & Now](https://web.archive.org/web/20190828162540/https://jeffbreece.com/then-now/)

[Security Scopes](https://web.archive.org/web/20190828162540/https://jeffbreece.com/security-scopes/) ›

### Leave a Reply [Cancel reply](/web/20190828162540/https://jeffbreece.com/modal-windows-in-sharepoint/#respond)

Your email address will not be published. Required fields are marked *

Comment

Name *

E-mail *

Website

This site uses Akismet to reduce spam. [Learn how your comment data is processed](https://web.archive.org/web/20190828162540/https://akismet.com/privacy/).
