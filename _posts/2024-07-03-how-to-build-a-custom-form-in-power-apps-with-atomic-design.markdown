---
layout: post
title:  "How to build a custom form in a Canvas App using prinicpals from Atomic Design"
date:   2024-06-30 07:00:00 -0400
categories: howto
tags:
  - powerapps
  - atomic-design
  - dataverse
  - canvas-apps
  - architecture
---
 Summary: I have been on a project where the client needed an extremely complex custom form with a matrix of visibility and validation rules by organizational division. Atomic design came in handy, and here's how.
 <!--more-->

## Implementing Atomic Design in Power Apps Canvas Apps: A Modern Approach to Form Design with Dataverse Integration

### Introduction

As application development evolved through the first decade of 2000, the need for scalable and maintainable design systems becomes increasingly crucial. Atomic design, a methodology introduced by Brad Frost, breaking down user interfaces into fundamental building blocks, were fundamental ideas in organizing UI componets in a more OOP format. This approach is especially beneficial in Power Apps Canvas applications, where creating dynamic and reusable forms can significantly enhance development efficiency. This blog explores how to implement atomic design in a Canvas app using containers and control-based forms, deviating from traditional form controls, and integrates Dataverse for managing visibility and validation rules.

### Understanding Atomic Design

Atomic design divides interfaces into five levels of hierarchy:

1. **Atoms**: Basic building blocks (e.g., buttons, input fields).
2. **Molecules**: Groups of atoms working together (e.g., a label and input field combo).
3. **Organisms**: Complex UI components composed of molecules (e.g., a form section).
4. **Templates**: Page-level objects that place components into a layout.
5. **Pages**: Final UI, combining templates with real content.

### Form Structure

For our implementation, the form is defined as a 'Template,' groups within the form are 'Organisms,' Molecules within these groups are 'Molecules,' and the controls within the Molecules are 'Atoms.' Note this is not the actual product I built, but an overview of the methodology behind it.

#### Form Template Components

- **Product Form (Template)**
  - **Header Group (Organism)**
  - **Add Edit Duplicate Product Buttons Group (Organism)**
  - **Primary Filters Group (Division / Product Type) (Organism)**
  - **Product Details Group (Organism)**
    - **Quantity (Molecule)**
    - **Price (Molecule)**
    - **Tax (Molecule)**
    - **Units of Measure (Molecule)**
    - **Country of Origin (Molecule)**
  - **Point To Point Group (Organism)**
    - **Origin (Organism)**
      - **Origin Name Molecule (Molecule)**
      - **Origin Street Address Molecule (Molecule)**
      - **Origin City (Molecule)**
      - **Origin State (Molecule)**
      - **Origin Zip (Molecule)**
      - **Origin Phone (Molecule)**
    - **Destination (Organism)**
      - **Destination Name Molecule (Molecule)**
      - **Destination Street Address Molecule (Molecule)**
      - **Destination City (Molecule)**
      - **Destination State (Molecule)**
      - **Destination Zip (Molecule)**
      - **Destination Phone (Molecule)**

#### Molecule Inputs

Each Molecule within an organism consists of a container with the following components:

- **Molecule Container**
  - **(Atom) Label (descriptor for the user)**
  - **(Atom) Datum (drop down, text input, radio button, or combo box types)**

### Architectural Diagram

Below is a simplified diagram representing the hierarchy:

```plaintext
Product Form (Template)
│
├── Header Group (Organism)
├── Add Edit Duplicate Product Buttons Group (Organism)
├── Primary Filters Group (Organism)
│
├── Product Details Group (Organism)
│   ├── Quantity (Molecule)
│   │   ├── (Atom) Label
│   │   └── (Atom) Datum
│   ├── Price (Molecule)
│   │   ├── (Atom) Label
│   │   └── (Atom) Datum
│   ├── Tax (Molecule)
│   │   ├── (Atom) Label
│   │   └── (Atom) Datum
│   ├── Units of Measure (Molecule)
│   │   ├── (Atom) Label
│   │   └── (Atom) Datum
│   └── Country of Origin (Molecule)
│       ├── (Atom) Label
│       └── (Atom) Datum
│
└── Point To Point Group (Organism)
    ├── Origin (Organism)
    │   ├── Origin Name Molecule (Molecule)
    │   │   ├── (Atom) Label
    │   │   └── (Atom) Datum
    │   ├── Origin Street Address Molecule (Molecule)
    │   │   ├── (Atom) Label
    │   │   └── (Atom) Datum
    │   ├── Origin City (Molecule)
    │   │   ├── (Atom) Label
    │   │   └── (Atom) Datum
    │   ├── Origin State (Molecule)
    │   │   ├── (Atom) Label
    │   │   └── (Atom) Datum
    │   ├── Origin Zip (Molecule)
    │   │   ├── (Atom) Label
    │   │   └── (Atom) Datum
    │   └── Origin Phone (Molecule)
    │       ├── (Atom) Label
    │       └── (Atom) Datum
    │
    └── Destination (Organism)
        ├── Destination Name Molecule (Molecule)
        │   ├── (Atom) Label
        │   └── (Atom) Datum
        ├── Destination Street Address Molecule (Molecule)
        │   ├── (Atom) Label
        │   └── (Atom) Datum
        ├── Destination City (Molecule)
        │   ├── (Atom) Label
        │   └── (Atom) Datum
        ├── Destination State (Molecule)
        │   ├── (Atom) Label
        │   └── (Atom) Datum
        ├── Destination Zip (Molecule)
        │   ├── (Atom) Label
        │   └── (Atom) Datum
        └── Destination Phone (Molecule)
            ├── (Atom) Label
            └── (Atom) Datum
```

With the visibility rules loaded, to set the height of the Organism, I basically just execute an If statement for the Organism for each of its Molecules based on the Molecule's visibility. So, if visible, add the Organism's height to the total height of all the Molecules inside the Organism.

### Storing and Loading Rules with Dataverse
As a bonus round, and I see this all over the place not just in the low/no-code ecosystem but in full-blown compiled and JavaScript framework products, where the developer essentially hard-codes the rules into the product. A better pattern, however, is to store these rules for retrieval at runtime and then re-use them in memory as collections. Benefits include a single source of truth for the actual business logic while also allowing the organization you are building this for to change them dynamically outside of a deployment cycle.

#### Dataverse Table Setup

1. **Create a Dataverse Table**: Create a new table in Dataverse called `FormRules`.
   - **Columns**:
     - `Division`: Text
     - `Organism`: Text
     - `Molecule`: Text
     - `IsVisible`: Boolean
     - `IsRequired`: Boolean

#### Populating the Dataverse Table

Populate the `FormRules` table with rules for visibility and validation based on the product's division.

#### Loading Rules in Power Apps

1. **On App Start**: Load the rules into a collection.
   ```PowerApps
   ClearCollect(
       colFormRules,
       Filter(FormRules, Division = [YourDivisionVariable])
   );
   ```

2. **Visibility**: Set the `Visible` property of each organism and molecule based on the collection.
   ```PowerApps
   LookUp(colFormRules, Organism = "ProductDetails" && Molecule = "ProductName").IsVisible
   ```

3. **Validation**: Use the `IsRequired` property to enforce validation.
   ```PowerApps
   If(
       LookUp(colFormRules, Organism = "ProductDetails" && Molecule = "ProductName").IsRequired && IsBlank(txtProductName.Text),
       Notify("Product Name is required", NotificationType.Error)
   )
   ```

### Example Implementation

#### OnStart Code
```PowerApps
// Load the division rules into a collection
ClearCollect(
    colFormRules,
    Filter(FormRules, Division = [YourDivisionVariable])
);
```

#### Control Properties

- **Product Name Input Visibility**:
  ```PowerApps
  LookUp(colFormRules, Organism = "ProductDetails" && Molecule = "ProductName").IsVisible
  ```

- **Category Dropdown Visibility**:
  ```PowerApps
  LookUp(colFormRules, Organism = "ProductDetails" && Molecule = "Category").IsVisible
  ```

- **Price Input Visibility**:
  ```PowerApps
  LookUp(colFormRules, Organism = "ProductDetails" && Molecule = "Price").IsVisible
  ```

- **Submit Button OnSelect**:

While we used a different approach for this, the folowing is the idea. Note, I also added a column to the Product Table to represent, and maintain,the validation state of the product until it became a posted record. Stateless apps department. Had to have a way to track this.

  ```PowerApps
  If(
      LookUp(colFormRules, Organism = "ProductDetails" && Molecule = "ProductName").IsRequired && IsBlank(txtProductName.Text),
      Notify("Product Name is required", NotificationType.Error)
  )
  ```

### Words of Caution
Canvas Apps have a recommended limit of 300 controls that should be placed on a screen. To make this a very nice design, I strongly suggest building these form Templates as custom components in the Power Apps Design Studio and then simply dropping one component onto your screen. This also has the benefit of reuse across multiple screens, so it's a win-win.

### Conclusion

Implementing atomic design in Power Apps Canvas apps transforms how we build and manage forms. By breaking down forms into reusable components—atoms, molecules, and organisms—we create scalable, maintainable, and dynamic user interfaces. Integrating Dataverse for managing visibility and validation rules further enhances the flexibility and robustness of your applications. Adopting atomic design and Dataverse integration in your Canvas apps will lead to more organized, robust, and user-friendly forms, ultimately improving the overall development experience.