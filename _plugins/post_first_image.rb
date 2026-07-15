# frozen_string_literal: true

# Extracts the first image from a post's content and uses it as the card
# thumbnail on the home page, replacing the default wireframe SVG.
#
# Logic:
#   1. If the post already has an explicit image: set in its own front matter
#      (i.e. NOT the site-wide default), leave it alone.
#   2. Otherwise scan the raw markdown/HTML content for the first usable image:
#        - Markdown: ![alt](url)
#        - HTML: <img src="url" ...>
#   3. If found, override post.data['image'] with that URL so Chirpy's home
#      layout renders it as the card thumbnail.

DEFAULT_IMAGE_PATH = '/assets/img/default-post.svg'

Jekyll::Hooks.register :posts, :pre_render do |post|
  img = post.data['image']

  current_path = case img
                 when Hash   then img['path'].to_s
                 when String then img
                 else ''
                 end

  # Skip posts that already have a real explicit image
  next unless current_path.empty? || current_path == DEFAULT_IMAGE_PATH

  content = post.content.to_s

  # 1. Markdown image: ![alt text](url)
  md_match = content.match(/!\[([^\]]*)\]\(([^)\s"']+)/)
  if md_match
    url = md_match[2]
    alt = md_match[1]
    unless url.start_with?('data:') || url.length > 1024
      post.data['image'] = {
        'path' => url,
        'alt'  => alt.empty? ? post.data['title'].to_s : alt
      }
      next
    end
  end

  # 2. HTML image: <img src="url" ...> (handles archive posts with inline HTML)
  html_match = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  next unless html_match

  url = html_match[1]
  next if url.start_with?('data:') || url.length > 1024
  next if url == DEFAULT_IMAGE_PATH

  post.data['image'] = {
    'path' => url,
    'alt'  => post.data['title'].to_s
  }
end
