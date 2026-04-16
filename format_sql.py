import re

def format_sql_file():
    input_file = 'database_schema_ssms.sql'
    output_file = 'database_schema_ssms_formatted.sql'
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    def format_create_table(match):
        table_name = match.group(1)
        columns_str = match.group(2)
        
        # Split các cột để xuống dòng. Regex tìm dấu phẩy theo sau bởi dấu ngoặc vuông
        columns_str = re.sub(r',\s*\[', ',\n    [', columns_str)
        
        # Căn lề dòng đầu tiên
        columns_str = '    ' + columns_str
        
        return f'CREATE TABLE {table_name}\n(\n{columns_str}\n)'

    # Thay thế và format lại CREATE TABLE (Lần này GIỮ LẠI dấu [ ])
    formatted_content = re.sub(r'CREATE TABLE (\[.*?\]) \((.*?)\);', format_create_table, content)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(formatted_content)

if __name__ == '__main__':
    format_sql_file()
