---
layout: default
title: Olympics Gallery
---

{% assign base_path = 'gallery-site/Olympics/' %}

{% assign bank_folders = "Bank-1,Bank-2,Bank-3,Bank-4,Bank-5,Bank-6" | split: "," %}

{% for folder in bank_folders %}
  <h2>{{ folder }}</h2>
  <div class="gallery">
    {% for file in site.static_files %}
      {% assign file_path = base_path | append: folder %}
      {% if file.path contains file_path %}
        <img src="{{ site.baseurl }}{{ file.path }}" alt="{{ folder }} image">
      {% endif %}
    {% endfor %}
  </div>
{% endfor %}