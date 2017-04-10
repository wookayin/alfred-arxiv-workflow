# -*- coding: utf-8 -*-

# arXiv
# Copyright (c) 2016 Jongwook Choi (@wookayin)

"""
Usage:
    papers3.py <search_query>
"""

from __future__ import print_function
import sys
import workflow
import arxiv
import urllib
import re

RE_ARXIV = 'https?://arxiv.org/(abs|pdf)/(.*?)(v\d+)?(.pdf)?\)?$'

def parse_arxiv_url(text):
    m = re.match(RE_ARXIV, text)
    _, identifier, v, _ = m.groups()
    return identifier, v


def main(wf):
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('query', default=None, type=str)
    args = parser.parse_args()
    log.debug('args : {}'.format(args))

    query = args.query
    # FUCK arxiv.py is too stupid why it is not quoting
    ret = arxiv.query(urllib.quote(query),
                      max_results=25)

    if not ret:
        wf.add_item('No matchings', icon=workflow.ICON_WARNING)

    for entry in ret:
        title = entry['title']
        authors = ', '.join(entry['authors'])
        bundle = ', '.join(t['term'] for t in entry['tags'])
        url = entry['id']

        identifier, version = parse_arxiv_url(url)     # 1704.12345

        wf.add_item(
            title="[%s] %s" % (identifier, title),
            subtitle="%s [%s]" % (authors, bundle),
            modifier_subtitles={
                'shift' : ('Copy the identifier %s' % identifier),
                'alt' : ('http://arxiv.org/pdf/%s' % identifier),
            },
            valid=True,
            arg=identifier,
            uid=identifier,
            type='file',
            #icon='icon.png',
        )

    wf.send_feedback()
    return 0


if __name__ == '__main__':
    wf = workflow.Workflow()
    log = wf.logger
    sys.exit(wf.run(main))
