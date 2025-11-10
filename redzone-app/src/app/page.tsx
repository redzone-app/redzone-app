"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

// Types for structured data used throughout the app
type Achievement = { id: number; text: string };
type Profile = {
  name: string;
  email: string;
  phone: string;
  position: string;
  height: string;
  weight: string;
  gpa: string;
  testScores: string;
  achievements: Achievement[];
};
type School = {
  id: number;
  name: string;
  division: string;
  contact: string;
  fitScore: number;
};
type Outreach = {
  id: number;
  schoolId: number;
  date: string;
  message: string;
};
type BotMessage = {
  id: number;
  from: 'user' | 'bot';
  text: string;
};

// Initial empty profile used when no data exists in storage
const emptyProfile: Profile = {
  name: '',
  email: '',
  phone: '',
  position: '',
  height: '',
  weight: '',
  gpa: '',
  testScores: '',
  achievements: [],
};

// Helper to compute a simple fit score based on GPA and arbitrary scaling
function computeFitScore(gpa: string): number {
  const gpaNum = parseFloat(gpa);
  if (isNaN(gpaNum)) return 50;
  return Math.min(100, Math.max(0, Math.round(gpaNum / 4 * 100)));
}

export default function Page() {
  // Tabs and active tab state
  const tabs = ['Playbook', 'Profile', 'Schools', 'Outreach', 'Media', 'Bot', 'Resources', 'Settings'];
  const [activeTab, setActiveTab] = useState<string>('Playbook');

  // Playbook step completion state
  const playbookSteps = ['Power Profile', 'Highlight Reel', 'School List', 'Outreach', 'Camps', 'Eligibility', 'Social', 'Follow‑ups'];
  const [playbookStatus, setPlaybookStatus] = useState<boolean[]>(playbookSteps.map(() => false));

  // Profile state loaded from localStorage
  const [profile, setProfile] = useState<Profile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rz_profile');
        if (stored) return JSON.parse(stored) as Profile;
      } catch (err) {
        console.error('Failed to parse stored profile', err);
      }
    }
    return emptyProfile;
  });

  // Schools list state
  const [schools, setSchools] = useState<School[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rz_schools');
        if (stored) return JSON.parse(stored) as School[];
      } catch (err) {
        console.error('Failed to parse stored schools', err);
      }
    }
    return [];
  });

  // Outreach log state
  const [outreach, setOutreach] = useState<Outreach[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rz_outreach');
        if (stored) return JSON.parse(stored) as Outreach[];
      } catch (err) {
        console.error('Failed to parse stored outreach', err);
      }
    }
    return [];
  });

  // Bot conversation state
  const [botMessages, setBotMessages] = useState<BotMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rz_bot');
        if (stored) return JSON.parse(stored) as BotMessage[];
      } catch (err) {
        console.error('Failed to parse stored bot messages', err);
      }
    }
    return [];
  });

  // Media plan state
  const [reelPlan, setReelPlan] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rz_reelPlan') || '';
    }
    return '';
  });

  // Branding (bot and site names)
  const [brandName, setBrandName] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('rz_brandName') || 'Redzone Recruiting';
    return 'Redzone Recruiting';
  });
  const [botName, setBotName] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('rz_botName') || 'Recruiting Bot';
    return 'Recruiting Bot';
  });

  // Persist profile, schools, outreach, botMessages, reelPlan, brandName, botName when changed
  useEffect(() => {
    localStorage.setItem('rz_profile', JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    localStorage.setItem('rz_schools', JSON.stringify(schools));
  }, [schools]);
  useEffect(() => {
    localStorage.setItem('rz_outreach', JSON.stringify(outreach));
  }, [outreach]);
  useEffect(() => {
    localStorage.setItem('rz_bot', JSON.stringify(botMessages));
  }, [botMessages]);
  useEffect(() => {
    localStorage.setItem('rz_reelPlan', reelPlan);
  }, [reelPlan]);
  useEffect(() => {
    localStorage.setItem('rz_brandName', brandName);
  }, [brandName]);
  useEffect(() => {
    localStorage.setItem('rz_botName', botName);
  }, [botName]);

  // Generic change handler for profile fields
  function handleProfileChange<K extends keyof Profile>(field: K, value: Profile[K]) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  // Add an achievement to the profile
  function addAchievement(text: string) {
    if (!text.trim()) return;
    const newAch: Achievement = {
      id: Date.now(),
      text,
    };
    setProfile(prev => ({ ...prev, achievements: [...prev.achievements, newAch] }));
  }

  // Remove an achievement by id
  function removeAchievement(id: number) {
    setProfile(prev => ({ ...prev, achievements: prev.achievements.filter(a => a.id !== id) }));
  }

  // Export profile to JSON (download link)
  function downloadProfile() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', 'profile.json');
    anchor.click();
  }

  // Import profile from JSON file
  function importProfile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const obj = JSON.parse(event.target?.result as string);
        setProfile(obj as Profile);
      } catch (err) {
        alert('Invalid profile JSON');
      }
    };
    reader.readAsText(file);
  }

  // Add a new school to the list
  function addSchool(name: string, division: string, contact: string) {
    if (!name.trim()) return;
    const newSchool: School = {
      id: Date.now(),
      name,
      division,
      contact,
      fitScore: computeFitScore(profile.gpa),
    };
    setSchools(prev => [...prev, newSchool]);
  }

  // Remove a school by id
  function removeSchool(id: number) {
    setSchools(prev => prev.filter(s => s.id !== id));
    // Also remove outreach logs associated with that school
    setOutreach(prev => prev.filter(o => o.schoolId !== id));
  }

  // Log an outreach message
  function logOutreach(schoolId: number, message: string) {
    const school = schools.find(s => s.id === schoolId);
    if (!school || !message.trim()) return;
    const newEntry: Outreach = {
      id: Date.now(),
      schoolId: school.id,
      date: new Date().toISOString().split('T')[0],
      message,
    };
    setOutreach(prev => [...prev, newEntry]);
  }

  // Compute profile completion percentage
  const completedFields = [profile.name, profile.email, profile.phone, profile.position, profile.height, profile.weight, profile.gpa, profile.testScores].filter(Boolean).length;
  const profileCompletion = Math.round(((completedFields + profile.achievements.length) / (8 + 1)) * 100);

  // Handle bot chat submission
  function sendToBot(userText: string) {
    if (!userText.trim()) return;
    const userMsg: BotMessage = { id: Date.now(), from: 'user', text: userText };
    setBotMessages(prev => [...prev, userMsg]);
    // Generate a basic bot response with some helpful guidance
    const lower = userText.toLowerCase();
    let reply = '';
    if (lower.includes('hello') || lower.includes('hi')) {
      reply = `Hello! I'm ${botName}. How can I assist with your recruiting journey today?`;
    } else if (lower.includes('profile')) {
      reply = 'Make sure your profile includes your position, height, weight, GPA, and test scores. College coaches look for complete information!';
    } else if (lower.includes('school') || lower.includes('list')) {
      reply = 'When building your target school list, consider a mix of reach, match, and safety schools across divisions.';
    } else if (lower.includes('outreach')) {
      reply = 'Consistent outreach is key: send introductory emails, follow up every couple weeks, and personalize each message for the coach.';
    } else if (lower.includes('highlight') || lower.includes('reel')) {
      reply = 'Your highlight reel should showcase 20–25 of your best plays in the first 90 seconds. Use hudl or YouTube for hosting.';
    } else {
      reply = "I'm sorry, I don't have an answer for that just yet. Try asking about your profile, school list, outreach, or highlight reel.";
    }
    const botMsg: BotMessage = { id: Date.now() + 1, from: 'bot', text: reply };
    setBotMessages(prev => [...prev, botMsg]);
  }

  // Simple input states for forms
  const [achInput, setAchInput] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolDivision, setSchoolDivision] = useState('NCAA DI');
  const [schoolContact, setSchoolContact] = useState('');
  const [outreachSchoolId, setOutreachSchoolId] = useState<number | undefined>(undefined);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [botInput, setBotInput] = useState('');

  // JSX for each tab panel
  const renderPlaybook = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">Use this checklist to track your recruiting journey.</p>
      <ul className="space-y-2">
        {playbookSteps.map((step, index) => (
          <li key={index} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={playbookStatus[index]}
              onChange={() => {
                setPlaybookStatus(prev => prev.map((v, i) => (i === index ? !v : v)));
              }}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Athlete Profile</h2>
        <div className="flex items-center space-x-2 text-sm">
          <span>Completion: {profileCompletion}%</span>
          <div className="relative w-40 h-2 bg-gray-200 rounded">
            <div className="absolute h-2 bg-blue-500 rounded" style={{ width: `${profileCompletion}%` }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={e => handleProfileChange('name', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={e => handleProfileChange('email', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={e => handleProfileChange('phone', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Position</label>
          <input
            type="text"
            value={profile.position}
            onChange={e => handleProfileChange('position', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Height (e.g. 6'2")</label>
          <input
            type="text"
            value={profile.height}
            onChange={e => handleProfileChange('height', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Weight (lbs)</label>
          <input
            type="text"
            value={profile.weight}
            onChange={e => handleProfileChange('weight', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">GPA</label>
          <input
            type="text"
            value={profile.gpa}
            onChange={e => handleProfileChange('gpa', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Test Scores (SAT/ACT)</label>
          <input
            type="text"
            value={profile.testScores}
            onChange={e => handleProfileChange('testScores', e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Achievements</label>
        <div className="flex mt-1 space-x-2">
          <input
            type="text"
            value={achInput}
            onChange={e => setAchInput(e.target.value)}
            placeholder="Add an achievement"
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
          <button
            type="button"
            onClick={() => {
              addAchievement(achInput);
              setAchInput('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add
          </button>
        </div>
        {profile.achievements.length > 0 && (
          <ul className="mt-2 space-y-1">
            {profile.achievements.map(a => (
              <li key={a.id} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded">
                <span className="text-sm">{a.text}</span>
                <button
                  type="button"
                  onClick={() => removeAchievement(a.id)}
                  className="text-red-500 text-xs"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={downloadProfile}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Export JSON
        </button>
        <label className="inline-flex items-center space-x-2 cursor-pointer">
          <span className="px-4 py-2 bg-purple-600 text-white rounded">Import JSON</span>
          <input type="file" accept="application/json" onChange={importProfile} className="hidden" />
        </label>
      </div>
    </div>
  );

  const renderSchools = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Target School List</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">School Name</label>
          <input
            type="text"
            value={schoolName}
            onChange={e => setSchoolName(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Division</label>
          <select
            value={schoolDivision}
            onChange={e => setSchoolDivision(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="NCAA DI">NCAA DI</option>
            <option value="NCAA DII">NCAA DII</option>
            <option value="NCAA DIII">NCAA DIII</option>
            <option value="NAIA">NAIA</option>
            <option value="Junior College">Junior College</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Coach Contact (Email)</label>
          <input
            type="email"
            value={schoolContact}
            onChange={e => setSchoolContact(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          addSchool(schoolName, schoolDivision, schoolContact);
          setSchoolName('');
          setSchoolDivision('NCAA DI');
          setSchoolContact('');
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add School
      </button>
      {schools.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Name</th>
                <th className="px-2 py-1 text-left">Division</th>
                <th className="px-2 py-1 text-left">Contact</th>
                <th className="px-2 py-1 text-left">Fit Score</th>
                <th className="px-2 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map(school => (
                <tr key={school.id} className="border-t">
                  <td className="px-2 py-1">{school.name}</td>
                  <td className="px-2 py-1">{school.division}</td>
                  <td className="px-2 py-1">{school.contact}</td>
                  <td className="px-2 py-1">{school.fitScore}</td>
                  <td className="px-2 py-1">
                    <button
                      type="button"
                      onClick={() => removeSchool(school.id)}
                      className="text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOutreach = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Outreach Log</h2>
      {schools.length === 0 ? (
        <p className="text-sm">Add some schools first to log outreach.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Select School</label>
              <select
                value={outreachSchoolId ?? ''}
                onChange={e => setOutreachSchoolId(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="" disabled>
                  Choose...
                </option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Message</label>
              <textarea
                value={outreachMessage}
                onChange={e => setOutreachMessage(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded h-24"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (outreachSchoolId != null && outreachMessage.trim()) {
                logOutreach(outreachSchoolId, outreachMessage);
                setOutreachMessage('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Outreach
          </button>
        </>
      )}
      {outreach.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-left">School</th>
                <th className="px-2 py-1 text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              {outreach.map(entry => {
                const school = schools.find(s => s.id === entry.schoolId);
                return (
                  <tr key={entry.id} className="border-t">
                    <td className="px-2 py-1">{entry.date}</td>
                    <td className="px-2 py-1">{school ? school.name : '-'}</td>
                    <td className="px-2 py-1">{entry.message}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderMedia = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Highlight Reel Planner</h2>
      <textarea
        value={reelPlan}
        onChange={e => setReelPlan(e.target.value)}
        placeholder="Plan out your highlight reel here (e.g. key plays, timestamps, video link)"
        className="w-full h-32 px-3 py-2 border border-gray-300 rounded"
      />
      <p className="text-sm text-gray-700">
        A strong highlight reel should feature your best 20–25 plays within the first 90 seconds. Make sure to include
        explosive moments, technical skills, and plays that showcase your athleticism. Host your video on a reliable
        platform like Hudl or YouTube and ensure your contact information is easy to find.
      </p>
    </div>
  );

  const renderBot = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{botName}</h2>
      <div className="h-64 overflow-y-auto border border-gray-300 p-3 rounded">
        {botMessages.length === 0 ? (
          <p className="text-sm text-gray-500">Start the conversation by asking a question about recruiting.</p>
        ) : (
          botMessages.map(msg => (
            <div key={msg.id} className={`mb-2 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`px-3 py-2 rounded max-w-xs text-sm ${msg.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={botInput}
          onChange={e => setBotInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              sendToBot(botInput);
              setBotInput('');
            }
          }}
          placeholder="Ask the bot a question..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded"
        />
        <button
          type="button"
          onClick={() => {
            sendToBot(botInput);
            setBotInput('');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Useful Resources</h2>
      <ul className="list-disc list-inside space-y-2 text-blue-700 underline">
        <li>
          <a href="https://www.ncaa.org" target="_blank" rel="noopener noreferrer">
            NCAA Eligibility Center
          </a>
        </li>
        <li>
          <a href="https://www.naia.org" target="_blank" rel="noopener noreferrer">
            NAIA Eligibility
          </a>
        </li>
        <li>
          <a href="https://www.collegeboard.org" target="_blank" rel="noopener noreferrer">
            SAT/ACT Information
          </a>
        </li>
        <li>
          <a href="https://www.hudl.com" target="_blank" rel="noopener noreferrer">
            Hudl Highlight Hosting
          </a>
        </li>
      </ul>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Bot Name</label>
          <input
            type="text"
            value={botName}
            onChange={e => setBotName(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      <p className="text-sm text-gray-600">Changes are saved automatically. Your settings are stored locally in your browser.</p>
    </div>
  );

  // Main component render
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{brandName}</h1>
      </header>
      <nav className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-t ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </nav>
      <section>
        {activeTab === 'Playbook' && renderPlaybook()}
        {activeTab === 'Profile' && renderProfile()}
        {activeTab === 'Schools' && renderSchools()}
        {activeTab === 'Outreach' && renderOutreach()}
        {activeTab === 'Media' && renderMedia()}
        {activeTab === 'Bot' && renderBot()}
        {activeTab === 'Resources' && renderResources()}
        {activeTab === 'Settings' && renderSettings()}
      </section>
    </main>
  );
}