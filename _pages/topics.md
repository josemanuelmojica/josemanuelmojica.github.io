---
title: "Topics"
permalink: /topics/
layout: single
author_profile: true
---

Content organized by themes and subjects. This provides an alternative way to explore the journal beyond the chronological timeline or section-based navigation.

<div class="topics-container">
  {% assign all_posts = site.posts | concat: site.essays | concat: site.daybook | concat: site.letters %}
  {% assign all_tags = all_posts | map: 'tags' | flatten | uniq | sort %}
  
  {% if all_tags.size > 0 %}
  <h2>Browse by Topic</h2>
  
  <div class="topics-grid">
    {% for tag in all_tags %}
      {% assign tagged_posts = all_posts | where_exp: "post", "post.tags contains tag" %}
      <div class="topic-card">
        <h3><a href="#{{ tag | slugify }}">{{ tag }}</a></h3>
        <p class="topic-count">{{ tagged_posts.size }} 
          {% if tagged_posts.size == 1 %}entry{% else %}entries{% endif %}
        </p>
      </div>
    {% endfor %}
  </div>
  
  <div class="topics-content">
    {% for tag in all_tags %}
      {% assign tagged_posts = all_posts | where_exp: "post", "post.tags contains tag" %}
      <div id="{{ tag | slugify }}" class="topic-section">
        <h2>{{ tag }}</h2>
        <div class="topic-posts">
          {% for post in tagged_posts %}
          <div class="topic-post">
            <h4><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h4>
            <p class="post-meta">
              {{ post.date | date: "%B %d, %Y" }} • 
              {{ post.collection | capitalize | default: "Post" }}
            </p>
            {% if post.excerpt %}
            <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 120 }}</p>
            {% endif %}
          </div>
          {% endfor %}
        </div>
      </div>
    {% endfor %}
  </div>
  
  {% else %}
  <div class="no-topics">
    <h2>Topics Coming Soon</h2>
    <p>Content will be organized by topics as more posts are added to the journal.</p>
  </div>
  {% endif %}
</div>

<style>
.topics-container {
  max-width: 900px;
  margin: 0 auto;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.topic-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  text-align: center;
}

.topic-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.topic-card h3 a {
  text-decoration: none;
  color: #333;
}

.topic-card h3 a:hover {
  color: #007acc;
}

.topic-count {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.topic-section {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #eee;
}

.topic-section:last-child {
  border-bottom: none;
}

.topic-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.topic-posts {
  display: grid;
  gap: 1.5rem;
}

.topic-post {
  padding: 1rem;
  background: #fafafa;
  border-radius: 6px;
  border-left: 4px solid #007acc;
}

.topic-post h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.topic-post h4 a {
  text-decoration: none;
  color: #333;
}

.topic-post h4 a:hover {
  color: #007acc;
}

.post-meta {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.5rem 0;
}

.post-excerpt {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.no-topics {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

@media (max-width: 600px) {
  .topics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .topic-card {
    padding: 1rem;
  }
}
</style>