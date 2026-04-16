import os
import django
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.apps import apps
import json
from datetime import date, datetime

def escape_sql_string(val):
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return '1' if val else '0'
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (date, datetime)):
        return f"'{val.isoformat()}'"
    if isinstance(val, (dict, list)):
        val = json.dumps(val, ensure_ascii=False)
    
    val_str = str(val).replace("'", "''")
    return f"N'{val_str}'"

def generate_inserts():
    output_file = 'database_inserts_ssms.sql'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- DỮ LIỆU MẪU DÀNH CHO SQL SERVER (SSMS)\n")
        f.write("-- DỰ ÁN: EDUVNU\n\n")
        
        for app_config in apps.get_app_configs():
            if app_config.name.startswith('django.') or app_config.name in ('rest_framework', 'corsheaders'):
                continue
                
            for model in app_config.get_models():
                if not model._meta.managed or model._meta.proxy:
                    continue
                
                table_name = model._meta.db_table
                fields = model._meta.fields
                
                try:
                    objects = list(model.objects.all())
                except Exception:
                    continue
                    
                if not objects:
                    continue
                
                f.write(f"-- Bảng: [{table_name}]\n")
                f.write(f"SET IDENTITY_INSERT [{table_name}] ON;\n")
                
                for obj in objects:
                    col_names = []
                    col_vals = []
                    for field in fields:
                        # THÊM NGOẶC VUÔNG CHO CỘT ĐỂ CHỐNG LỖI TỪ KHÓA
                        col_names.append(f"[{field.column}]")
                        val = getattr(obj, field.attname)
                        col_vals.append(escape_sql_string(val))
                        
                    cols_str = ', '.join(col_names)
                    vals_str = ', '.join(col_vals)
                    f.write(f"INSERT INTO [{table_name}] ({cols_str}) VALUES ({vals_str});\n")
                
                f.write(f"SET IDENTITY_INSERT [{table_name}] OFF;\nGO\n\n")

if __name__ == '__main__':
    generate_inserts()
