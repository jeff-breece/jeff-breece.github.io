---
layout: post
title: "Power Apps: So, About That 'Expand' Function with Dataverse Offline First Mode..."
date: 2024-08-05 07:00:00 -0400
categories: powerapps
---

**Summary:** In Power Apps, the `expand` function is used to retrieve related data from other tables or entities within the same data source when you query data. This is particularly useful when working with data models that have relationships between entities, such as in a Common Data Service (now called Dataverse) or SharePoint lists. The magic trick that our client, my team, Microsoft, and I faced? Why were these things being randomly fired in a canvas app which caused a nightmare scenario of generic "network errors" seen by our UAT users. This post is the background on the function and a warning to those who adopt the offline first capability with Dataverse with the Power Apps stack.

***Citations out, with thanks, to my partner on the project, Mr. Robert Martin, our client for the sheer mountain of patience they exerted in the face of a looming deployment date and, of course, Microsoft for the indirect breadcrumbs that led our team toward the solution.***

<!--more-->

### Usage

The `expand` function is typically used with the `Lookup` or `Filter` functions to include related records in the result set. This can help to bring together data from multiple related entities in a single operation, simplifying the data retrieval process and improving performance by reducing the number of separate queries needed.

### Syntax

```powerapps
Lookup(DataSource, Condition, { ColumnName: RelatedEntity.ColumnName })
```

### Example

Suppose you have two entities: `Orders` and `Customers`, where each order is related to a customer. You want to retrieve a list of orders along with the name of the customer for each order.

1. **Orders Entity**: Contains fields like `OrderID`, `OrderDate`, and `CustomerID`.
2. **Customers Entity**: Contains fields like `CustomerID`, `CustomerName`, and `ContactInfo`.

To retrieve the orders along with the customer names, you would use the `expand` functionality as follows:

```powerapps
ClearCollect(
    OrdersWithCustomerNames,
    AddColumns(
        Orders,
        "CustomerName",
        Lookup(Customers, CustomerID = Orders[@CustomerID]).CustomerName
    )
)
```

In this example:
- `Orders` is the data source for orders.
- `Customers` is the data source for customers.
- `AddColumns` is used to add a new column `CustomerName` to the `Orders` data source.
- `Lookup` is used within `AddColumns` to find the corresponding `CustomerName` from the `Customers` entity based on the `CustomerID`.

This creates a collection `OrdersWithCustomerNames` that contains all the orders along with their corresponding customer names.

### Benefits

- **Efficiency**: Reduces the need for multiple separate data queries.
- **Clarity**: Simplifies the app logic by keeping related data together.
- **Performance**: Can improve performance by retrieving related data in a single query.

### Considerations

- **Complexity**: Overuse of `expand` in complex scenarios can lead to performance issues, so it should be used judiciously.
- **Data Model**: Ensure that your data model relationships are correctly set up to fully leverage the `expand` functionality.

### Lesson Learned

> In offline mode, only one level of lookup expand is supported.

That little line item? Well, it cost us 3 weeks of multi-person effort and an official ticket to MSFT itself. What was difficult to swallow was being told to "not trust Microsoft Learn" and then to simply do the blind "trial and error" path as a developer and data architect with the new capability. I mean, yeah, I lived through SharePoint from 2007 onward, .Net, and many other product platforms. I get the concept of the "undocumented feature." Which is why I am leaving this post for some poor person who runs into this in the future. Beware the linked entities limitation in Dataverse offline, but really watch for the tripwire of the unsupported more than one, `LookUp` relationships in normalized data models.

![Tripwire]({{ site.url }}{{ site.baseurl }}/images/tripwire.jpg)

### Closing

Understanding and using the `expand` function effectively can significantly enhance the data handling capabilities in Power Apps, enabling more sophisticated and responsive applications. But be careful where you use it in the event you are in an offline first context.

### Reference
[Debugging canvas apps with Monitor](https://learn.microsoft.com/en-us/power-apps/maker/monitor-canvasapps)