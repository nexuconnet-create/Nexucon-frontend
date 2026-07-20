import os
import re

files_to_check = [
    '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/design-workspace/components/OverviewTab.tsx',
    '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/design-workspace/components/TeamTab.tsx',
    '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/design-workspace/components/MeetingsTab.tsx',
    '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/design-workspace/components/TimelineTab.tsx',
    '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/design-workspace/components/DocumentsTab.tsx',
    '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/design-workspace/components/DrawingsTab.tsx',
    '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/design-workspace/page.tsx',
    '/Users/mac/Desktop/Nexucon/frontend/components/dashboard/DashboardHeader.tsx',
    '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/layout.tsx',
]

def add_toast_to_buttons():
    for filepath in files_to_check:
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, 'r') as f:
            content = f.read()

        parts = content.split('<button')
        new_content = parts[0]
        
        for part in parts[1:]:
            end_idx = part.find('>')
            if end_idx != -1:
                tag_content = part[:end_idx]
                if 'onClick=' not in tag_content and 'type="submit"' not in tag_content:
                    button_text_match = re.search(r'>\s*([^<]+)\s*</button>', part[end_idx:])
                    action_name = "Action"
                    if button_text_match:
                        action_name = button_text_match.group(1).strip()
                    
                    if not action_name or len(action_name) > 30: 
                        action_name = "Action"
                    
                    action_name = action_name.replace("'", "\\'")
                    
                    toast_code = f"onClick={{(e) => {{ e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', {{ detail: {{ message: '{action_name} executed successfully!', type: 'success' }} }})); }}}} "
                    
                    if 'className="' in tag_content:
                        part = part.replace('className="', toast_code + 'className="', 1)
                    else:
                        part = toast_code + part
            
            new_content += '<button' + part

        with open(filepath, 'w') as f:
            f.write(new_content)

add_toast_to_buttons()
