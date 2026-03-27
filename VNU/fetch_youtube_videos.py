"""
Script tu dong tim video YouTube phu hop voi tung bai hoc va cap nhat vao database.

Cach chay:
    python fetch_youtube_videos.py --api-key YOUR_API_KEY

Hoac dat API key vao bien moi truong:
    set YOUTUBE_API_KEY=YOUR_API_KEY
    python fetch_youtube_videos.py
"""
import os
import sys
import time
import argparse
import json
import re

import requests

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from courses.models import Lesson, Course


def search_youtube(api_key, query, max_results=1):
    """Tim video YouTube bang query, tra ve (video_url, title)."""
    try:
        resp = requests.get(
            'https://www.googleapis.com/youtube/v3/search',
            params={
                'part': 'snippet',
                'q': query,
                'type': 'video',
                'maxResults': max_results,
                'key': api_key,
                'videoEmbeddable': 'true',
                'safeSearch': 'strict',
            },
            timeout=10
        )
        if resp.status_code != 200:
            print(f'  [ERROR] HTTP {resp.status_code}: {resp.text[:200]}')
            return None, None
        data = resp.json()
        items = data.get('items', [])
        if items:
            vid_id = items[0]['id']['videoId']
            title = items[0]['snippet']['title']
            return f'https://www.youtube.com/watch?v={vid_id}', title
    except Exception as e:
        print(f'  [ERROR] {e}')
    return None, None


def build_query(course_title, lesson_title):
    """Tao query tim kiem YouTube - dung tieng Anh de tranh loi encoding."""
    # Loai bo so thu tu bai hoc (1., 2., etc.)
    clean_lesson = re.sub(r'^\d+\.\s*', '', lesson_title).strip()
    # Loai bo tieng Viet co dau (giu lai tieng Anh)
    # Neu ten bai hoc la tieng Viet, dung ten khoa hoc lam query chinh
    has_vietnamese = any(c in clean_lesson for c in 'àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ')
    if has_vietnamese:
        # Dung ten khoa hoc (tieng Anh) + keyword chung
        keywords = ['introduction', 'tutorial', 'course', 'lecture', 'lesson']
        order = lesson_title.split('.')[0].strip() if '.' in lesson_title else '1'
        try:
            num = int(order)
            keyword = keywords[min(num-1, len(keywords)-1)]
        except:
            keyword = 'tutorial'
        query = f'{course_title} {keyword}'
    else:
        query = f'{clean_lesson} {course_title} tutorial'
    # Gioi han 100 ky tu
    return query[:100]


def main():
    parser = argparse.ArgumentParser(description='Fetch YouTube videos for lessons')
    parser.add_argument('--api-key', type=str, default=os.environ.get('YOUTUBE_API_KEY', ''),
                        help='YouTube Data API v3 key')
    parser.add_argument('--course-id', type=int, default=None,
                        help='Chi update lessons cua 1 course cu the (optional)')
    parser.add_argument('--limit', type=int, default=50,
                        help='So luong lessons toi da can update (default: 50)')
    parser.add_argument('--overwrite', action='store_true',
                        help='Ghi de ca nhung lesson da co video_url')
    parser.add_argument('--dry-run', action='store_true',
                        help='Chi hien thi ket qua, khong luu vao database')
    args = parser.parse_args()

    if not args.api_key:
        print('ERROR: Can YouTube API key.')
        print('  Chay: python fetch_youtube_videos.py --api-key YOUR_KEY')
        print('  Hoac: set YOUTUBE_API_KEY=YOUR_KEY')
        sys.exit(1)

    # Lay danh sach lessons can update
    qs = Lesson.objects.select_related('course').filter(is_active=True)
    if args.course_id:
        qs = qs.filter(course_id=args.course_id)
    if not args.overwrite:
        # Lay ca NULL va empty string
        from django.db.models import Q
        qs = qs.filter(Q(video_url__isnull=True) | Q(video_url=''))
    qs = qs.order_by('course_id', 'order_number')[:args.limit]

    lessons = list(qs)
    total = len(lessons)
    print(f'\nBat dau tim video cho {total} bai hoc...')
    print(f'Dry run: {args.dry_run}\n')

    updated = 0
    failed = 0

    for i, lesson in enumerate(lessons, 1):
        query = build_query(lesson.course.title, lesson.title)
        print(f'[{i}/{total}] {lesson.course.title[:30]} > {lesson.title[:40]}')
        print(f'  Query: {query}')

        video_url, yt_title = search_youtube(args.api_key, query)

        if video_url:
            print(f'  Found: {yt_title[:60]}')
            print(f'  URL: {video_url}')
            if not args.dry_run:
                lesson.video_url = video_url
                lesson.save(update_fields=['video_url'])
            updated += 1
        else:
            print(f'  [SKIP] Khong tim thay video phu hop')
            failed += 1

        # Tranh bi rate limit (YouTube API: 100 requests/second)
        time.sleep(0.5)

    print(f'\n=== KET QUA ===')
    print(f'  Da cap nhat: {updated} bai hoc')
    print(f'  That bai:    {failed} bai hoc')
    if args.dry_run:
        print('  (Dry run - khong luu vao database)')


if __name__ == '__main__':
    main()
