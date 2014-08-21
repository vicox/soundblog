#!/usr/bin/python

"""
  Creates a new post from a given Soundcloud URL.

  Arguments:
    1: Soundcloud track URL (required). Example:
        https://soundcloud.com/allefarben/alle-farben-45-winterheart
    2: Post date with format YYYY-MM-DD. Example: 2014-08-02
        If a date is provided, the time will be set to 13:00

"""

SOUNDCLOUD_CLIENT_ID = '0686300807bd25cd798c519f70192c31'

import sys
import os
import time
import datetime
import soundcloud

client = soundcloud.Client(client_id=SOUNDCLOUD_CLIENT_ID)
track = client.get('/resolve', url=sys.argv[1])

if len(sys.argv) > 2:
    yearMonthDay = map(lambda x: int(x), sys.argv[2].split('-'))
    date = datetime.datetime(yearMonthDay[0], yearMonthDay[1], yearMonthDay[2], 13)
    today = time.localtime(time.mktime(date.timetuple()))
else:
    today = time.localtime()

f = open(os.path.join('_posts/', time.strftime('%Y-%m-%d', today) + '-' + track.user['permalink'] + '-' + track.permalink + '.md'), 'w')

f.write('---' + '\n')
f.write('layout: post' + '\n')
f.write('title: "' + track.title.encode('utf-8').replace('"', '\\"') + '"' + '\n')
f.write('date: ' + time.strftime('%Y-%m-%d %H:%M:%S %z', today) + '\n')
f.write('track_id: ' + str(track.id) + '\n')
if 'track' != track.kind:
    f.write('track_kind: ' + track.kind + '\n')
f.write('track_url: ' + track.permalink_url + '\n')
f.write('---')

f.close()