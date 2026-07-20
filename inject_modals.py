import os
import re

filepath = '/Users/mac/Desktop/Nexucon/frontend/app/(client)/client/(dashboard)/design-workspace/components/TeamTab.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Add imports
if 'ProfileModal' not in content:
    content = content.replace(
        'import DeliverablesDrawer from "@/components/dashboard/DeliverablesDrawer";',
        'import DeliverablesDrawer from "@/components/dashboard/DeliverablesDrawer";\nimport ProfileModal from "@/components/dashboard/ProfileModal";\nimport AssignTaskDrawer from "@/components/dashboard/AssignTaskDrawer";'
    )

# Add state and handlers
if 'activeProfile' not in content:
    handlers = """  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [activeTaskAssign, setActiveTaskAssign] = useState<any>(null);

  const handleOpenProfile = (e: React.MouseEvent, name: string, role: string, imgUrl: string) => {
    e.preventDefault(); e.stopPropagation();
    setActiveProfile({ memberName: name, role: role, imageUrl: imgUrl });
  };

  const handleOpenAssignTask = (e: React.MouseEvent, name: string, role: string) => {
    e.preventDefault(); e.stopPropagation();
    setActiveTaskAssign({ memberName: name, role: role });
  };"""
    content = content.replace('  const mockDeliverables', handlers + '\n\n  const mockDeliverables')

# Add Modals at the bottom
if 'ProfileModal isOpen' not in content:
    modals = """
      <ProfileModal 
        isOpen={!!activeProfile} 
        onClose={() => setActiveProfile(null)} 
        {...activeProfile}
      />
      
      <AssignTaskDrawer 
        isOpen={!!activeTaskAssign} 
        onClose={() => setActiveTaskAssign(null)} 
        {...activeTaskAssign}
      />"""
    content = content.replace('    </div>\n  );\n}', modals + '\n    </div>\n  );\n}')

# Manually replace the buttons based on the names.
# Card 1: Michael Adeyemi (Structural Engineer)
img1 = "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444891/Download_free_image_of_Dark_skinned_female_construction_worker_portrait_hardhat_helmet__about_african_construction_worker_african_engineer_black_female_engineer_female_construction_worker_and_african_worker_12921744_1_gk870e.png"
# Card 2: Sarah Okafor (Lead Architect)
img2 = "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444892/Download_free_image_of_Black_female_engineer_with_a_tablet_about_african_engineer_black_female_engineer_nigerian_female_engineers_female_engineer_and_woman_engineer_1236838_1_vydw0s.png"
# Card 3: James Ibrahim (MEP Consultant)
img3 = "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444890/Download_free_image_of_African_American_engineer_at_a_construction_site_about_african_construction_worker_black_male_engineer_construction_worker_worker_and_african_worker_2190011_1_m5f0qf.png"
# Card 4: David Bello (Client Representative)
img4 = "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png"

def replace_view_profile(content, button_text_index, name, role, img):
    pattern = r'(<button onClick=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); window\.dispatchEvent\(new CustomEvent\(\'show-toast\', \{ detail: \{ message: \'View Profile executed successfully!\', type: \'success\' \} \}\)\); \}\} className="[^"]*">View Profile</button>)'
    
    matches = list(re.finditer(pattern, content))
    if len(matches) > button_text_index:
        match = matches[button_text_index]
        old_str = match.group(1)
        new_str = old_str.replace("window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'View Profile executed successfully!', type: 'success' } }));", f"handleOpenProfile(e, '{name}', '{role}', '{img}')")
        content = content.replace(old_str, new_str, 1)
    return content

def replace_assign_task(content, button_text_index, name, role):
    pattern = r'(<button onClick=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); window\.dispatchEvent\(new CustomEvent\(\'show-toast\', \{ detail: \{ message: \'Assign Task executed successfully!\', type: \'success\' \} \}\)\); \}\} className="[^"]*">Assign Task</button>)'
    
    matches = list(re.finditer(pattern, content))
    if len(matches) > button_text_index:
        match = matches[button_text_index]
        old_str = match.group(1)
        new_str = old_str.replace("window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Assign Task executed successfully!', type: 'success' } }));", f"handleOpenAssignTask(e, '{name}', '{role}')")
        content = content.replace(old_str, new_str, 1)
    return content

# Replacing sequentially:
# index 0: Michael, index 1: Sarah, index 2: James, index 3: David
content = replace_view_profile(content, 0, "Michael Adeyemi", "Structural Engineer", img1)
content = replace_view_profile(content, 0, "Sarah Okafor", "Lead Architect", img2)  # after replacing 0, the next one becomes 0
content = replace_view_profile(content, 0, "James Ibrahim", "MEP Consultant", img3)
content = replace_view_profile(content, 0, "David Bello", "Client Representative", img4)

content = replace_assign_task(content, 0, "Sarah Okafor", "Lead Architect")

with open(filepath, 'w') as f:
    f.write(content)
