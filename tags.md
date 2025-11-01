---
layout: default
title: Tags
permalink: /tags/
---

<h1>Tags</h1>

<ul class="tag-cloud">
  {% assign sorted = site.tags | sort %}
  {% for tag in sorted %}
    {% assign tag_name = tag[0] %}
    <li>
      <a href="#{{ tag_name | slugify }}">
        #{{ tag_name }} ({{ tag[1].size }})
      </a>
    </li>
  {% endfor %}
</ul>

<hr>

{% for tag in sorted %}
  {% assign tag_name = tag[0] %}
  <section id="{{ tag_name | slugify }}">
    <h2>#{{ tag_name }}</h2>
    <ul>
      {% for post in tag[1] %}
        <li>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          <small>{{ post.date | date: "%Y-%m-%d" }}</small>
        </li>
      {% endfor %}
    </ul>
  </section>
{% endfor %}