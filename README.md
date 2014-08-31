# Soundblog [![Build Status](https://travis-ci.org/vicox/soundblog.svg)](https://travis-ci.org/vicox/soundblog)

[Soundblog](https://github.com/vicox/soundblog) is a blog based on [Jekyll](http://jekyllrb.com/) and
the [Inspired](https://github.com/vicox/inspired) theme that allows you to easily post [Soundcloud](https://soundcloud.com) tracks.

## Posting

To add posts you can do it manually, use the Python script, or use the admin page.

### The Admin Page

If your soundblog is hosted on [Github](https://github.com/) you can use the admin page if you add `/admin`
to your URL. Just sign in with your Github credentials. From there you can add, edit and delete posts.

Your github username (or organization) and repository must be configured in `_config.yml`.

    admin:
      github_username: vicox
      github_repo: soundblog
      soundcloud_client_id: 0686300807bd25cd798c519f70192c31
  
You can use the provided Soundcloud client ID, or you can create your own here: http://soundcloud.com/you/apps/new

### The Python Script

Use the Python script `_post.py` to post a track from Soundcloud. The first parameter ist the Soundcloud track URL.
The second parameter is an optional posting date with the format YYYY-MM-DD. If you provide a date, the time will
be set to 13:00.

#### Requirements
You need to have Python and the [Python Soundcloud module](https://github.com/soundcloud/soundcloud-python) installed.
   
    pip install soundcloud
  
Make `_post.py` executable.

    chmod +x _post.py

####Example

    ./_post.py https://soundcloud.com/allefarben/alle-farben-45-winterheart
    
or with a specific date

    ./_post.py https://soundcloud.com/allefarben/alle-farben-45-winterheart 2014-08-02
    
    