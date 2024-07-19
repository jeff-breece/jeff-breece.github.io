---
layout: post
title:  "Custom Forms: Where Low Code Meets Engineering Practices in Canvas Applications"
date:   2024-07-18 07:00:00 -0400
categories: powerapps
---
 Summary: Building a container-based form in Power Apps has several advantages over using the out-of-the-box card-based form control. This post breaks down some of the advantages for these while identifying scenarios where the simpler out of the box form control is a decent tool for those jobs as well.
 <!--more-->


I'm a "right tool for the job" kind of thinker. Perhaps as a result of over a decade of working with both managed and unmanaged code paradigms along with a handful of products that offer low code application development to organizations. This post is about how to assess the complexity of a front end business entity form, it's purpose, how it will be consumed, analysis of the complexity of the user journey who uses these products and then, ultimately, when to got full blown custom form vs an OOTB, which are usually opinionated, form.

## 1. Enhanced Customization and Flexibility
### Layout Control
Container-based forms offer more control over the layout and arrangement of form elements. You can nest containers to create complex, responsive designs that adapt to different screen sizes and orientations.
### Styling Options
Containers allow for more advanced styling, enabling you to apply custom themes, colors, and fonts to match your brand or application's design guidelines.

## 2. Better Performance
### Optimized Rendering
Container-based forms can be optimized for performance by minimizing the number of controls and reducing the complexity of the form. This can lead to faster loading times and smoother interactions.
Lazy Loading: Containers can be used to implement lazy loading, where only the visible parts of the form are rendered initially, improving performance for larger forms.

## 3. Improved Maintainability and Reusability
### Component-Based Design
Using containers supports a more modular approach, allowing you to create reusable components. This aligns well with the atomic design principles, making it easier to maintain and update individual components without affecting the entire form.
### Separation of Concerns
By organizing the form into containers, you can separate different parts of the form based on their functionality, making it easier to manage and troubleshoot.

## 4. Enhanced User Experience
### Responsive Design 
Containers can be used to create responsive forms that adjust to different screen sizes and devices, providing a consistent user experience across platforms.
### Conditional Visibility
Containers can simplify the implementation of conditional visibility rules, making it easier to show or hide form elements based on user input or other conditions.

## 5. Data Management and Validation
### Granular Control
With containers, you can implement more granular control over data management and validation. This allows for more sophisticated validation rules and error handling mechanisms, improving data integrity.
### Dataverse Integration
This could really mean any data source, but our post is specifically about this form of integration. Containers can be more easily integrated with Dataverse, enabling you to leverage its capabilities for storing and managing visibility and validation rules. These rules include who sees what based upon whatevfer parameter that might be for your business model, which fields are required, and even the height of the Template based upon which fileds are Visible == true, thus providing a more dynamic experience.

## 6. Scalability
### Future-Proofing
Container-based forms are more scalable and can be easily expanded as the application grows. This is particularly beneficial for applications that require frequent updates and additions.

## Comparison with Card-Based Form Control
### Card-Based Forms
These are quick to set up and are great for simple forms with straightforward requirements. They come with pre-defined templates and are easier to use for those who need to create forms quickly without extensive customization.

### Container-Based Forms
These require more effort to set up initially but offer greater flexibility and control, making them suitable for complex forms with advanced customization and performance needs.

### A Note About Memory Scope
If you do your form as a Power Apps Canvas Component (yes, you could got he route of a PCF for this as well but that is outside the scope of this post), memory scope is a key concept. For a component, you will need to isntantiate some global variables and data collections at the first screen load, not app start please. If your form template lives in just one screen, however, prefer Context Variables over Global variables to ruduce the memory load across the entire application. Word to the wise there.

In summary, while card-based form controls are useful for rapid development and simpler scenarios, container-based forms provide the flexibility, performance, and advanced capabilities needed for more complex and dynamic applications.