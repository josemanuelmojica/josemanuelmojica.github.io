source "https://rubygems.org"

# GitHub Pages compatible gems
gem "jekyll", "~> 4.0"
gem "minima", "~> 2.5"

# GitHub Pages supported plugins
group :jekyll_plugins do
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
  gem "jekyll-feed"
  gem "jekyll-paginate"
  gem "jekyll-include-cache"
  gem "jekyll-remote-theme"
end

# Windows and JRuby do not include zoneinfo files
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]