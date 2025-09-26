---
title: "Timeline"
permalink: /timeline/
layout: single
author_profile: true
---

A chronological view of significant moments, milestones, and entries from across all sections of this journal. This timeline provides a way to see how thoughts and experiences have evolved over time.

<div class="timeline-container">
  <h2>Recent Entries</h2>
  
  {% assign all_posts = site.posts | concat: site.essays | concat: site.daybook | concat: site.letters %}
  {% assign sorted_posts = all_posts | sort: 'date' | reverse %}
  
  <div class="timeline-entries">
    {% for post in sorted_posts limit: 20 %}
    <div class="timeline-entry">
      <div class="timeline-date">{{ post.date | date: "%B %d, %Y" }}</div>
      <div class="timeline-content">
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p class="timeline-type">{{ post.collection | capitalize | default: "Post" }}</p>
        {% if post.excerpt %}
        <p class="timeline-excerpt">{{ post.excerpt | strip_html | truncate: 150 }}</p>
        {% endif %}
      </div>
    </div>
    {% endfor %}
  </div>
</div>

<style>
.timeline-container {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-entry {
  display: flex;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.timeline-date {
  flex: 0 0 140px;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.timeline-content {
  flex: 1;
  padding-left: 2rem;
}

.timeline-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.timeline-content h3 a {
  text-decoration: none;
  color: #333;
}

.timeline-content h3 a:hover {
  color: #007acc;
}

.timeline-type {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.5rem 0;
}

.timeline-excerpt {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

@media (max-width: 600px) {
  .timeline-entry {
    flex-direction: column;
  }
  
  .timeline-content {
    padding-left: 0;
    padding-top: 0.5rem;
  }
}
</style>