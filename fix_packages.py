import re

file_path = "/Users/stalinkumar/Downloads/Wabot_BSP/app/super-admin/dashboard/packages/page.tsx"
with open(file_path, "r") as f:
    text = f.read()

# Make specific text darker
text = text.replace('text-slate-400 text-sm font-medium line-clamp-2', 'text-slate-500 text-sm font-medium line-clamp-2')
text = text.replace('text-[10px] font-black uppercase tracking-widest text-slate-400', 'text-[10px] font-black uppercase tracking-widest text-slate-500')
text = text.replace('text-xs font-bold text-slate-400 uppercase tracking-widest', 'text-xs font-bold text-slate-500 uppercase tracking-widest')
text = text.replace('text-[10px] font-bold text-slate-300 uppercase tracking-widest', 'text-[10px] font-bold text-slate-500 uppercase tracking-widest')
text = text.replace('text-[10px] font-black text-slate-300 uppercase tracking-widest', 'text-[10px] font-black text-slate-500 uppercase tracking-widest')
text = text.replace('text-[9px] font-black text-slate-400 uppercase tracking-widest', 'text-[9px] font-black text-slate-500 uppercase tracking-widest')
text = text.replace("bg-slate-100 text-slate-300", "bg-slate-100 text-slate-400")
text = text.replace("text-slate-300 italic", "text-slate-400 italic")
text = text.replace("text-xs font-black text-slate-400", "text-xs font-black text-slate-500")
text = text.replace("text-[9px] font-bold text-slate-400", "text-[9px] font-bold text-slate-500")
text = text.replace("text-xs font-black text-slate-400 uppercase tracking-wider", "text-xs font-black text-slate-500 uppercase tracking-wider")
text = text.replace('text-[10px] text-slate-400 font-medium pl-2', 'text-[10px] text-slate-500 font-medium pl-2')
text = text.replace('text-[8px] font-black text-slate-400 uppercase tracking-widest', 'text-[8px] font-black text-slate-500 uppercase tracking-widest')

# Save it
with open(file_path, "w") as f:
    f.write(text)

print("Packages CSS updated successfully.")
