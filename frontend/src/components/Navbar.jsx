import React, { useState } from 'react';
import { 
  BookOpen, 
  PlusCircle, 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  UserCircle, 
  LogOut, 
  ChevronDown,
  Sparkles,
  Award
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onOpenUpload, 
  onOpenAuth, 
  onSwitchUser, 
  allUsers = [],
  onLogout 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-ocean-primary border-b border-ocean-secondary/30 shadow-lg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img 
                src="/peerlib-icon.jpg" 
                alt="PeerLib Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain bg-white/10 p-1 border border-ocean-accent/40 shadow-ocean-glow transition-transform group-hover:scale-105"
              />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-ocean-accent rounded-full border-2 border-ocean-primary animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Peer<span className="text-ocean-accent">Lib</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ocean-secondary/80 text-ocean-support border border-ocean-accent/30 uppercase tracking-wider">
                  NBKRIST
                </span>
              </div>
              <p className="text-xs text-ocean-support/70 hidden sm:block">
                Academic Knowledge Network
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-ocean-secondary text-white shadow-md border border-ocean-accent/30'
                  : 'text-ocean-support/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-ocean-accent" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('students')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'students'
                  ? 'bg-ocean-secondary text-white shadow-md border border-ocean-accent/30'
                  : 'text-ocean-support/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-ocean-accent" />
              <span>Students</span>
            </button>

            <button
              onClick={() => setCurrentTab('faculty')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'faculty'
                  ? 'bg-ocean-secondary text-white shadow-md border border-ocean-accent/30'
                  : 'text-ocean-support/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-ocean-accent" />
              <span>Faculty</span>
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'profile'
                  ? 'bg-ocean-secondary text-white shadow-md border border-ocean-accent/30'
                  : 'text-ocean-support/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCircle className="w-4 h-4 text-ocean-accent" />
              <span>My Profile</span>
            </button>
          </nav>

          {/* Actions: Upload Button & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Upload Material Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-ocean-secondary to-ocean-secondary/90 hover:from-ocean-secondary hover:to-ocean-accent text-white font-bold text-xs sm:text-sm shadow-ocean-glow transition-all duration-300 hover:scale-[1.02] border border-ocean-accent/40"
            >
              <img 
                src="/peerlib-icon.jpg" 
                alt="Upload Icon" 
                className="w-4 h-4 rounded-sm object-contain"
              />
              <span className="hidden xs:inline">Upload Material</span>
              <span className="xs:hidden">Upload</span>
            </button>

            {/* Current User Status / Switcher */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-ocean-accent/20 transition-all text-left"
                >
                  <img
                    src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=PeerLib'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-ocean-accent/50"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-ocean-support/80 font-medium capitalize flex items-center gap-1">
                      {currentUser.role === 'faculty' ? (
                        <span className="text-ocean-accent font-semibold flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5" /> Faculty
                        </span>
                      ) : (
                        <span>Yr {currentUser.year} • {currentUser.branch_code || 'Student'}</span>
                      )}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-ocean-support/70" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-ocean-primary border border-ocean-secondary rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-white/10 bg-ocean-secondary/30">
                      <p className="text-xs text-ocean-support/70 uppercase tracking-wider font-semibold">Signed In As</p>
                      <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-ocean-accent truncate">{currentUser.email}</p>
                      {currentUser.role === 'student' && (
                        <div className="mt-1 flex items-center justify-between text-xs text-ocean-support">
                          <span>Roll: <strong className="text-white">{currentUser.roll_no}</strong></span>
                          <span>Points: <strong className="text-ocean-accent">{currentUser.points} pts</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentTab('profile');
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ocean-support hover:text-white hover:bg-ocean-secondary/50 transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-ocean-accent" />
                        <span>View My Full Profile</span>
                      </button>

                      <div className="px-4 py-1.5 text-[11px] font-bold text-ocean-support/60 uppercase tracking-wider">
                        Switch Demo Account
                      </div>

                      {allUsers.slice(0, 5).map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-1.5 text-xs text-left transition-colors ${
                            u.id === currentUser.id 
                              ? 'bg-ocean-secondary/60 text-ocean-accent font-bold' 
                              : 'text-ocean-support/90 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="truncate max-w-[170px]">
                            {u.name} ({u.role === 'faculty' ? 'Faculty' : `Yr ${u.year} ${u.branch_code}`})
                          </span>
                          {u.id === currentUser.id && <span className="text-[10px] text-ocean-accent">Active</span>}
                        </button>
                      ))}

                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => {
                            onOpenAuth();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ocean-accent hover:bg-white/5 transition-colors font-medium"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Register New Account</span>
                        </button>

                        <button
                          onClick={() => {
                            onLogout();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-ocean-secondary hover:bg-ocean-accent text-white hover:text-ocean-primary font-bold text-sm transition-all"
              >
                Sign In / Register
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-white/10 py-2 justify-around">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              currentTab === 'dashboard' ? 'text-ocean-accent font-bold' : 'text-ocean-support/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentTab('students')}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              currentTab === 'students' ? 'text-ocean-accent font-bold' : 'text-ocean-support/70'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students</span>
          </button>
          <button
            onClick={() => setCurrentTab('faculty')}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              currentTab === 'faculty' ? 'text-ocean-accent font-bold' : 'text-ocean-support/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Faculty</span>
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              currentTab === 'profile' ? 'text-ocean-accent font-bold' : 'text-ocean-support/70'
            }`}
          >
            <UserCircle className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
}
