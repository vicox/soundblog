#!/usr/bin/python

"""
  Creates a new post from a given Soundcloud URL.

  Arguments:
    1: Soundcloud track URL (required). Example:
        https://soundcloud.com/allefarben/alle-farben-45-winterheart
    2: Post date with format YYYY-MM-DD. Example: 2014-08-02
        If a date is provided, the time will be set to 13:00

  Note: The environment variable SOUNDCLOUD_CLIENT_ID must be set with your Soundcloud
  client ID, i.e.: export SOUNDCLOUD_CLIENT_ID="<client id>"
  You can create an application here to get a client ID: http://soundcloud.com/you/apps/new

"""

import sys
import os
import time
import datetime
import soundcloud

client = soundcloud.Client(client_id=os.environ['SOUNDCLOUD_CLIENT_ID'])
track = client.get('/resolve', url=sys.argv[1])

if len(sys.argv) > 2:
    yearMonthDay = map(lambda x: int(x), sys.argv[2].split('-'))
    date = datetime.datetime(yearMonthDay[0], yearMonthDay[1], yearMonthDay[2], 13)
    today = time.localtime(time.mktime(date.timetuple()))
else:
    today = time.localtime()

f = open(os.path.join('_posts/', time.strftime('%Y-%m-%d', today) + '-' + track.permalink + '.markdown'), 'w')

f.write('---' + '\n')
f.write('layout: post' + '\n')
f.write('title: "' + track.title.encode('utf-8').replace('"', '\\"') + '"' + '\n')
f.write('date: ' + time.strftime('%Y-%m-%d %H:%M:%S %z', today) + '\n')
f.write('track_id: ' + str(track.id) + '\n')
f.write('---')

f.close()