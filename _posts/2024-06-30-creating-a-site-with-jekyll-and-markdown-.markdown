---
layout: post
title:  "Creating a Blog Using Jekyll on an Ubuntu Machine"
date:   2024-06-30 07:00:00 -0400
categories: howto
---
## Creating a Blog Using Jekyll on an Ubuntu Machine

Blogging has become a popular way to share knowledge, experiences, and ideas with the world. One of the simplest and most efficient ways to start a blog is by using Jekyll, a static site generator that takes Markdown files and converts them into a complete static website. In this guide, we’ll walk through the process of creating a blog using Jekyll on an Ubuntu machine.

### Prerequisites

Before we get started, make sure you have the following installed on your Ubuntu machine:

- **Git**: Version control system.
- **Ruby**: Programming language Jekyll is built with.
- **RubyGems**: Package manager for Ruby.
- **Jekyll**: Static site generator.

### Step 1: Install Ruby and RubyGems

First, we need to install Ruby and RubyGems. Open your terminal and run the following commands:

{% highlight sh %}
sudo apt update
sudo apt install -y build-essential libssl-dev libreadline-dev zlib1g-dev
{% endhighlight %}

Next, install Ruby using `rbenv` and `ruby-build`:

{% highlight sh %}
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
exec $SHELL

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bashrc
exec $SHELL

rbenv install 3.1.2
rbenv global 3.1.2
{% endhighlight %}

Verify the installation:

{% highlight sh %}
ruby -v
gem -v
{% endhighlight %}

### Step 2: Install Jekyll and Bundler

Now, install Jekyll and Bundler:

{% highlight sh %}
gem install jekyll bundler
{% endhighlight %}

### Step 3: Create a New Jekyll Site

Navigate to the directory where you want to create your blog and create a new Jekyll site:

{% highlight sh %}
cd /path/to/your/directory
jekyll new your-blog-name
{% endhighlight %}

Navigate to your new site directory and install the dependencies:

{% highlight sh %}
cd your-blog-name
bundle install
{% endhighlight %}

### Step 4: Build and Serve Your Site

To build and serve your site locally, run:

{% highlight sh %}
bundle exec jekyll serve
{% endhighlight %}

Open your browser and navigate to `http://localhost:4000` to see your new Jekyll blog in action.

### Step 5: Adding Content with Markdown

Jekyll uses Markdown for writing posts. To create a new blog post, add a new Markdown file in the `_posts` directory. The file should follow the naming convention `YYYY-MM-DD-title.md`.

Here’s an example of a simple blog post:


markdown
---
layout: post
title: "My First Blog Post"
date: 2024-06-28
---

# My First Blog Post

Welcome to my first blog post using Jekyll on an Ubuntu machine. This is a great way to share your ideas with the world!

### Step 6: Deploying Your Site to GitHub Pages

1. **Create a GitHub Repository**: Go to GitHub and create a new repository named `your-username.github.io`.

2. **Initialize Git**: In your Jekyll site directory, initialize Git and add your remote repository:

   {% highlight sh %}
   git init
   git remote add origin https://github.com/your-username/your-username.github.io.git
   {% endhighlight %}

3. **Commit and Push Your Site**:

   {% highlight sh %}
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   {% endhighlight %}

4. **Enable GitHub Pages**: Go to your repository settings on GitHub, scroll down to the "GitHub Pages" section, and select the branch `main`. Your site will be available at `https://your-username.github.io`.

### Conclusion

Congratulations! You’ve successfully created a blog using Jekyll on an Ubuntu machine. By leveraging the power of Jekyll and Markdown, you can easily manage and publish your content.