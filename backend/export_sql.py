import os, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.apps import apps
from django.db import connection

def export_all_sql():
    sql_statements = []
    
    with connection.schema_editor(collect_sql=True) as schema_editor:
        # Lặp qua tất cả các app của bạn
        for app_config in apps.get_app_configs():
            # Bỏ qua các app mặc định của django và thư viện ngoài
            if app_config.name.startswith('django.') or app_config.name in ('rest_framework', 'corsheaders'):
                continue
                
            for model in app_config.get_models():
                # Chỉ xử lý các bảng do chúng ta quản lý
                if not model._meta.managed or model._meta.proxy:
                    continue
                try:
                    schema_editor.create_model(model)
                except Exception as e:
                    pass
                    
    # Format lại SQL và lưu
    with open('database_schema_ssms.sql', 'w', encoding='utf-8') as f:
        f.write("-- TẬP LỆNH TẠO BẢNG CƠ SỞ DỮ LIỆU DÀNH CHO SQL SERVER (SSMS)\n")
        f.write("-- DỰ ÁN: EDUVNU\n\n")
        for sql in schema_editor.collected_sql:
            if isinstance(sql, tuple):
                 sql_str = sql[0] % sql[1]
            else:
                 sql_str = str(sql)
            # Thêm dấu chấm phẩy và lệnh GO đặc trưng của SSMS
            f.write(sql_str + ';\nGO\n\n')
            
    print("✅ Đã xuất thành công toàn bộ mã tạo bảng SQL ra file 'database_schema_ssms.sql'!")

if __name__ == '__main__':
    export_all_sql()
