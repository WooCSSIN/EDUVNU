import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import DegreeProgram

for d in DegreeProgram.objects.all():
    print(f"\n{'='*60}")
    print(f"ID={d.id} | {d.title}")
    print(f"{'='*60}")
    for mi, mod in enumerate(d.curriculum or []):
        print(f"  [Module {mi+1}] {mod.get('title','')}")
        for li, ls in enumerate(mod.get('lessons', [])):
            vid = (d.videos or [])[mi*100+li] if d.videos and (mi*100+li) < len(d.videos) else 'MISSING'
            print(f"      Lesson {li+1}: {ls}")
