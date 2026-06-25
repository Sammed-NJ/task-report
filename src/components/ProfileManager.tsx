import React, { useState } from "react";
import { User, Plus, Trash2, Check, Users, Settings } from "lucide-react";
import { EmployeeProfile } from "../types";

interface ProfileManagerProps {
  profiles: EmployeeProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onAddProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;
  onSetDefaultProfile: (id: string) => void;
  addToast: (text: string, type: "success" | "error" | "info") => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
  onSetDefaultProfile,
  addToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    if (profiles.some((p) => p.name.toLowerCase() === newProfileName.trim().toLowerCase())) {
      addToast("Profile with this name already exists", "error");
      return;
    }

    onAddProfile(newProfileName.trim());
    setNewProfileName("");
    addToast("Profile added successfully", "success");
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <div className="relative">
      <button
        id="profile-manager-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm cursor-pointer"
      >
        <Users className="h-3.5 w-3.5 text-blue-600" />
        <span>Profile: {activeProfile ? activeProfile.name : "Select Profile"}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded-lg shadow-xl z-50 p-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-gray-700 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Settings className="h-4 w-4 text-blue-600" />
                Employee Profiles
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            {/* Profile Selection list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4 pr-1">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`group flex items-center justify-between p-2 rounded transition-all ${
                    profile.id === activeProfileId
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                      : "hover:bg-slate-50 dark:hover:bg-gray-700/50 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectProfile(profile.id);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 flex-grow text-left text-xs font-medium"
                  >
                    <User className={`h-4 w-4 ${profile.id === activeProfileId ? "text-blue-500" : "text-slate-400"}`} />
                    <span className="truncate">{profile.name}</span>
                    {profile.isDefault && (
                      <span className="text-[9px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                        Default
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {!profile.isDefault && (
                      <button
                        onClick={() => {
                          onSetDefaultProfile(profile.id);
                          addToast(`"${profile.name}" is now default`, "success");
                        }}
                        title="Set as Default"
                        className="p-1 hover:bg-slate-100 dark:hover:bg-gray-750 text-slate-400 hover:text-blue-600 rounded transition-all"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {profiles.length > 1 && (
                      <button
                        onClick={() => {
                          onDeleteProfile(profile.id);
                          addToast(`Profile deleted`, "info");
                        }}
                        title="Delete Profile"
                        className="p-1 hover:bg-slate-100 dark:hover:bg-gray-750 text-slate-400 hover:text-rose-500 rounded transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Profile form */}
            <form onSubmit={handleSubmit} className="border-t border-[#e2e8f0] dark:border-gray-700 pt-3">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="New employee name..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="flex-grow text-xs px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!newProfileName.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-gray-700 text-white disabled:text-slate-400 rounded transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
