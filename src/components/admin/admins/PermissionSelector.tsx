"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AVAILABLE_PERMISSIONS } from "@/lib/services/adminManagementService";

interface PermissionSelectorProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

export default function PermissionSelector({ selectedPermissions, onChange }: PermissionSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Dashboard: true,
    Users: true,
    Communities: true,
    Events: true,
    Notices: true,
    Admins: true,
    Activity: true,
    Settings: true,
  });

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      onChange(selectedPermissions.filter(p => p !== permissionId));
    } else {
      onChange([...selectedPermissions, permissionId]);
    }
  };

  const selectAllInCategory = (category: string, permissions: typeof AVAILABLE_PERMISSIONS) => {
    const allIds = permissions.map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      onChange(selectedPermissions.filter(p => !allIds.includes(p)));
    } else {
      const newPermissions = [...selectedPermissions];
      allIds.forEach(id => {
        if (!newPermissions.includes(id)) newPermissions.push(id);
      });
      onChange(newPermissions);
    }
  };

  return (
    <div className="rounded-xl border-2 border-[#E7D7E8] bg-[#FFF9F2]/50 p-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-[#2A1636]">Custom Permissions</label>
        <span className="text-xs text-[#6B5E5A]">Select specific permissions</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
        {Object.entries(groupedPermissions).map(([category, permissions]) => (
          <div key={category} className="rounded-lg border border-[#E7D7E8] overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-2 text-left text-xs font-medium transition-all duration-200 cursor-pointer hover:bg-[#6B1E5B]/5 bg-[#FFF9F2]"
            >
              <span className="text-[#2A1636]">{category}</span>
              {expandedCategories[category] ? (
                <ChevronUp className="w-3 h-3 text-[#6B5E5A]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#6B5E5A]" />
              )}
            </button>
            
            {expandedCategories[category] && (
              <div className="p-2 pt-1 space-y-1 bg-white/50">
                <button
                  type="button"
                  onClick={() => selectAllInCategory(category, permissions)}
                  className="text-[10px] mb-1 inline-block transition-colors cursor-pointer text-[#6B1E5B] hover:text-[#531547]"
                >
                  {permissions.every(p => selectedPermissions.includes(p.id)) ? "Deselect All" : "Select All"}
                </button>
                {permissions.map(permission => (
                  <label key={permission.id} className="flex items-center gap-1.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="w-3.5 h-3.5 rounded border-[#D4C8C0] text-[#6B1E5B] focus:ring-[#6B1E5B]/20 cursor-pointer"
                    />
                    <span className={`text-[11px] transition-colors ${
                      selectedPermissions.includes(permission.id) 
                        ? 'text-[#2A1636]' 
                        : 'text-[#6B5E5A] group-hover:text-[#2A1636]'
                    }`}>
                      {permission.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}