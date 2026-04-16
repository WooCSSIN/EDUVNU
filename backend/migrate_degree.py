import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def migrate():
    with connection.cursor() as cursor:
        print("Starting migration...")
        
        # 1. Gỡ bỏ Unique Constraint cũ (nếu có)
        try:
            # Tìm chính xác tên Constraint trong SQL Server
            cursor.execute("""
                SELECT name FROM sys.objects 
                WHERE type = 'UQ' AND parent_object_id = OBJECT_ID('courses_enrollment')
            """)
            constraints = cursor.fetchall()
            for row in constraints:
                name = row[0]
                cursor.execute(f"ALTER TABLE courses_enrollment DROP CONSTRAINT {name}")
                print(f"Dropped constraint: {name}")
                
            # Gỡ bỏ Index (thường Django tạo index thay vì constraint thực thụ)
            cursor.execute("""
                SELECT name FROM sys.indexes 
                WHERE object_id = OBJECT_ID('courses_enrollment') AND name LIKE '%uniq%'
            """)
            indexes = cursor.fetchall()
            for row in indexes:
                name = row[0]
                cursor.execute(f"DROP INDEX {name} ON courses_enrollment")
                print(f"Dropped index: {name}")
        except Exception as e:
            print(f"Note: Could not drop constraint/index (might not exist): {e}")

        # 2. Thay đổi course_id thành NULL
        try:
            cursor.execute("ALTER TABLE courses_enrollment ALTER COLUMN course_id bigint NULL")
            print("Altered course_id to NULL")
        except Exception as e:
            print(f"Error altering course_id: {e}")

        # 3. Thêm degree_program_id
        try:
            cursor.execute("ALTER TABLE courses_enrollment ADD degree_program_id bigint NULL")
            print("Added degree_program_id column")
        except Exception as e:
            print(f"Note: degree_program_id might already exist: {e}")

        print("Migration finished successfully!")

if __name__ == '__main__':
    migrate()
