# Soundblog

[Soundblog](https://github.com/vicox/soundblog) is a blog based on [Jekyll](http://jekyllrb.com/) and
the [Inspired](https://github.com/vicox/inspired) theme that allows you to easily post [Soundcloud](https://soundcloud.com) tracks.

## Posting

Use the Python script `_post.py` to post a track from Soundcloud. The first parameter ist the Soundcloud track URL.
The second parameter is an optional posting date with the format YYYY-MM-DD. If you provide a date, the time will
be set to 13:00.

### Requirements
You need to have Python and the [Python Soundcloud module](https://github.com/soundcloud/soundcloud-python) installed.
   
    pip install soundcloud
    
Then you need to set the client ID environment variable SOUNDCLOUD_CLIENT_ID. You get a client ID if you create a
Soundcloud application here: http://soundcloud.com/you/apps/new

    export SOUNDCLOUD_CLIENT_ID="<client id>"
    
  
Now make `_post.py` executable.

    chmod +x _post.py

### Example
    ./_post.py https://soundcloud.com/allefarben/alle-farben-45-winterheart
    
or with a specific date

    ./_post.py https://soundcloud.com/allefarben/alle-farben-45-winterheart 2014-08-02
    
    