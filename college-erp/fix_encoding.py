import os
import glob

html_files = glob.glob('**/*.html', recursive=True)

for file in html_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # If the file contains the dark mode script, we'll keep it but fix the rest
        # The content was decoded as windows-1252 initially and saved as utf-8
        
        # We take the string, encode it back to cp1252 (ignoring errors for characters that don't fit),
        # which yields the original utf-8 bytes that were in the file.
        # Then we decode those bytes as utf-8 to get the real string.
        raw_bytes = content.encode('cp1252', errors='ignore')
        
        try:
            fixed_content = raw_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If it fails to decode as utf-8, it was probably already fine or messed up differently.
            continue
            
        if "🎓" in fixed_content or "—" in fixed_content or fixed_content != content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"Fixed {file}")
            
    except Exception as e:
        pass
