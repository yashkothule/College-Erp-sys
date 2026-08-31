import os
import re
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Configuration
INPUT_FILE = r"C:\Users\prath\.gemini\antigravity\brain\27f45975-7fa2-4f3a-91a6-fc1a88dbad88\artifacts\table_specifications.md"
OUTPUT_DIR = r"c:\Users\prath\Desktop\College Erp sys\docs\pdf_tables"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def parse_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by titles to find tables
    tables = []
    # Find patterns like ### `table_name` followed by a markdown table
    pattern = r"### `(\w+)`.*?\n(.*?)(?=\n###|\Z)"
    matches = re.finditer(pattern, content, re.DOTALL)

    for match in matches:
        table_name = match.group(1)
        table_content = match.group(2).strip()
        
        # Extract table rows
        rows = []
        for line in table_content.split('\n'):
            if '|' in line and '---' not in line:
                # Split by | and strip
                cols = [c.strip() for c in line.split('|')]
                # Remove empty first/last cols if they exist
                if not cols[0]: cols = cols[1:]
                if not cols[-1]: cols = cols[:-1]
                if cols:
                    rows.append(cols)
        
        if rows:
            tables.append({'name': table_name, 'data': rows})
    
    return tables

def generate_pdf(table_info):
    name = table_info['name']
    data = table_info['data']
    file_path = os.path.join(OUTPUT_DIR, f"{name}.pdf")
    
    # Use landscape for wide tables
    doc = SimpleDocTemplate(file_path, pagesize=landscape(A4), leftMargin=30, rightMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TableTitle',
        parent=styles['Heading2'],
        fontSize=18,
        spaceAfter=20,
        textColor=colors.HexColor("#0a84ff")
    )
    
    elements.append(Paragraph(f"Table Specification: {name}", title_style))
    elements.append(Spacer(1, 10))
    
    # Format table data to handle long text
    formatted_data = []
    for row in data:
        formatted_row = []
        for cell in row:
            # Wrap long text in Paragraph for auto-wrapping
            p = Paragraph(cell, styles['Normal'])
            formatted_row.append(p)
        formatted_data.append(formatted_row)

    # Create table
    col_widths = [120, 100, 120, 300] # Adjust according to landscape
    t = Table(formatted_data, colWidths=col_widths)
    
    # Add styling
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e1e1e")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f9f9f9")),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f2f2")]),
    ])
    t.setStyle(style)
    
    elements.append(t)
    doc.build(elements)
    print(f"Generated: {file_path}")

def main():
    print(f"Reading from: {INPUT_FILE}")
    tables = parse_markdown(INPUT_FILE)
    print(f"Found {len(tables)} tables.")
    
    for table_info in tables:
        generate_pdf(table_info)
    
    print("\nAll PDF files generated successfully in: docs/pdf_tables")

if __name__ == "__main__":
    main()
