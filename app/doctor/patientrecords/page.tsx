'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  Phone,
  Mail,
  Search,
  Plus,
  MoreVertical,
  Clock,
  AlertTriangle,
  BarChart2,
} from 'lucide-react';

type Patient = {
  id: string;
  name: string;
  avatar?: string;
  status?: string;
  meta: string;
  tags?: string[];
  lastSeen?: string;
  diagnosis?: string;
  heartRate?: number;
  bloodPressure?: string;
  weight?: number;
  weightDelta?: string;
  medications?: string;
  allergies?: string;
  labs?: { name: string; lab?: string; status: 'Normal' | 'Borderline' | 'Abnormal' }[];
  upcoming?: { month: string; day: string; title: string; time: string; mode: string } | null;
  bloodType?: string;
};

const PATIENTS: Patient[] = [
  {
    id: 'P-2938',
    name: 'Emma Wilson',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB2jbB8JdD-wcip6r4FHscyu19Ht4k7CCHWY53ws3DGWTkZn5MCXA0rU7gQ20JcK8wcLAPihfNEiMfzKFUyMKdy_wz6DkIxIW3fGn3uKQrhIxxE0nOez-GqEHTzKlZQek3_Zv0gZUeM2z_5CgA93gf9BC8ReqPEPkx3fHH79XECtqIq7WnabOQAhjd9IHM2LtRF2ndQdphJuIy6LgGmz6Zu0ygNzllGvK8CrehFuxONC4nyi5zRCzt2is-SnhjtNYPTALfC2z68QHc',
    status: 'Active',
    meta: 'ID: #P-2938 • 28 yrs • Female',
    tags: ['Heart Condition'],
    lastSeen: 'Oct 12, 2023',
    diagnosis: 'Arrhythmia',
    heartRate: 72,
    bloodPressure: '118/78',
    weight: 64,
    weightDelta: '-0.5kg',
    medications: 'Metoprolol 50mg (1x Daily), Vitamin D3',
    allergies: 'Penicillin (Severe), Peanuts (Mild)',
    labs: [
      { name: 'Complete Blood Count (CBC)', lab: 'City Central Hospital', status: 'Normal' },
      { name: 'Lipid Panel', lab: 'City Central Hospital', status: 'Borderline' },
    ],
    upcoming: {
      month: 'NOV',
      day: '14',
      title: 'Routine Cardiac Follow-up',
      time: '10:30 AM - 11:00 AM • In-Clinic',
      mode: 'In-Clinic',
    },
    bloodType: 'O+',
  },
  {
    id: 'P-1129',
    name: 'Robert Brown',
    meta: 'ID: #P-1129 • 62 yrs • Male',
    tags: ['Diabetes T2'],
    lastSeen: 'Oct 20',
    diagnosis: 'Type 2 Diabetes',
    heartRate: 78,
    bloodPressure: '126/80',
    weight: 88,
    weightDelta: '-0.2kg',
    medications: 'Metformin 500mg',
    allergies: 'Sulfa (Mild)',
    labs: [{ name: 'HbA1c', lab: 'City Central Hospital', status: 'Borderline' }],
    upcoming: null,
    bloodType: 'B+',
  },
  {
    id: 'P-4451',
    name: 'Sarah Miller',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC9cuJp8JNMfkau_Va0QNEJoECeopS1y0fuupp0QMHgWQxA6r2h_i6PXLYyVodlAZ8Z-zCTq3push5t8JLPlLSue-YM9ktrTZsCWPfz3xfNBE8kcreALD9LUKTa9fu_AxyXUNBU55Bt5qH4A2YD5YFx3EMdWRVcowiqSPf7D5oAGRAnH3JmzHv1Z-j94v9AKMNhV46UHXKR2zRBNSVsWRq4GhJWFZcWFlCN4i_VW4XLC8_BfI3oxaYnaAq6hTrCFR5wzBENzo2eWWE',
    meta: 'ID: #P-4451 • 34 yrs • Female',
    tags: ['Routine'],
    lastSeen: 'Sep 15',
    heartRate: 68,
    bloodPressure: '110/70',
    weight: 59,
    weightDelta: '+0.1kg',
    medications: 'None',
    allergies: 'None',
    labs: [{ name: 'CMP', lab: 'City Central Hospital', status: 'Normal' }],
    upcoming: null,
    bloodType: 'AB+',
  },
  {
    id: 'P-3321',
    name: 'Alice Lee',
    meta: 'ID: #P-3321 • 29 yrs • Female',
    tags: ['Migraine'],
    lastSeen: 'Sep 10',
    heartRate: 70,
    bloodPressure: '120/76',
    weight: 56,
    weightDelta: '-0.3kg',
    medications: 'Sumatriptan PRN',
    allergies: 'NSAIDs (Mild)',
    labs: [{ name: 'Thyroid Panel', lab: 'City Central Hospital', status: 'Normal' }],
    upcoming: null,
    bloodType: 'O-',
  },
];

export default function DoctorPatientRecord() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PATIENTS;

    return PATIENTS.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.meta.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query]);

  const safeSelected = Math.min(selected, Math.max(filtered.length - 1, 0));
  const patient = filtered[safeSelected] ?? PATIENTS[0];

  return (
    <div className="flex h-screen overflow-hidden">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .sidebar-link { display:flex; align-items:center; gap:0.75rem; padding:.75rem 1rem; border-radius:1rem; color:#64748b; font-weight:500; transition: all .2s; }
        .sidebar-link:hover { background-color: rgba(0,128,129,0.05); color: #008081; }
        .sidebar-link.active { background-color: rgba(0,128,129,0.1); color:#008081; font-weight:700; }
        .glass-panel { background: rgba(255,255,255,0.8); backdrop-filter: blur(8px); border-radius:1rem; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 8px 20px rgba(2,6,23,0.08); }
        .patient-item { display:flex; align-items:center; gap:1rem; padding:1rem; border-radius:1rem; cursor:pointer; border:1px solid transparent; transition: all .15s }
        .patient-item:hover { background:#ffffff; box-shadow: 0 6px 18px rgba(2,6,23,0.06); border-color:#f1f5f9; }
        .patient-item.active { background:#ffffff; border-color: rgba(0,128,129,0.12); box-shadow: 0 8px 24px rgba(2,6,23,0.08); }
        .info-pill { padding:.25rem .75rem; border-radius:999px; font-size:.75rem; font-weight:600; background:#f1f5f9; color:#475569; }
        .custom-scrollbar::-webkit-scrollbar { width:6px; height:6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}</style>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              eco
            </span>
            <span className="text-lg font-bold">
              Appoint<span className="text-secondary">Care</span>
            </span>
          </div>
          <button className="text-slate-500" aria-label="Open menu">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-6 h-full">
          <div className="w-full md:w-[40%] flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Patient Records
                </h1>
                <button className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                  <Plus size={16} />
                </button>
              </div>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelected(0);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:border-primary focus:ring-primary shadow-sm"
                  placeholder="Search by name, ID, or condition..."
                  type="text"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <button className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium whitespace-nowrap">
                  All Patients
                </button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium whitespace-nowrap">
                  Chronic
                </button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium whitespace-nowrap">
                  Recent
                </button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium whitespace-nowrap">
                  Archived
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-20">
              {(filtered.length ? filtered : PATIENTS).map((p, i) => {
                const isActive = i === safeSelected;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelected(i)}
                    className={`patient-item group ${isActive ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                  >
                    {p.avatar ? (
                      <img
                        alt={p.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary ring-offset-2"
                        src={p.avatar}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg border-2 border-white shadow-sm shrink-0">
                        {p.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 truncate">
                          {p.name}
                        </h3>
                        <span
                          className={`text-xs font-semibold ${
                            p.status === 'Active'
                              ? 'text-primary bg-primary/10 px-2 py-0.5 rounded-full'
                              : 'text-slate-400'
                          }`}
                        >
                          {p.status ?? p.lastSeen}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{p.meta}</p>
                      <div className="flex gap-2 mt-1.5">
                        {(p.tags || []).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-md font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <MoreVertical className="text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex md:w-[60%] flex-col h-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 z-0" />

            <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
              <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex gap-5">
                    <div className="relative">
                      {patient.avatar ? (
                        <img
                          alt={patient.name}
                          className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-slate-800"
                          src={patient.avatar}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold shadow-lg border-4 border-white dark:border-slate-800">
                          {patient.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                      )}
                      {patient.status && (
                        <div className="absolute -bottom-2 -right-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                          {patient.status}
                        </div>
                      )}
                    </div>

                    <div className="pt-1">
                      <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                        {patient.name}
                      </h2>
                      <div className="flex items-center gap-3 text-slate-500 mt-1 mb-3">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-lg">
                            cake
                          </span>
                          {patient.meta?.split('•')[1]?.trim() ?? ''}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-lg">
                            female
                          </span>
                          {patient.meta?.split('•')[2]?.trim() ?? ''}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="flex items-center gap-1">
                          Blood Type: <strong>{patient.bloodType ?? '—'}</strong>
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                          <Phone size={16} /> Call
                        </button>
                        <button className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                          <Mail size={16} /> Email
                        </button>
                        <button className="ml-2 px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                          Start Visit
                        </button>
                      </div>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                      Heart Rate
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-800 dark:text-white">
                        {patient.heartRate ?? '—'}
                      </span>
                      <span className="text-xs text-slate-500 mb-1">bpm</span>
                      <span className="text-xs font-medium text-green-500 bg-green-100 px-1.5 py-0.5 rounded ml-auto">
                        Normal
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                      Blood Pressure
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-800 dark:text-white">
                        {patient.bloodPressure ?? '—'}
                      </span>
                      <span className="text-xs text-slate-500 mb-1">mmHg</span>
                      <span className="text-xs font-medium text-green-500 bg-green-100 px-1.5 py-0.5 rounded ml-auto">
                        Normal
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                      Weight
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-800 dark:text-white">
                        {patient.weight ?? '—'}
                      </span>
                      <span className="text-xs text-slate-500 mb-1">kg</span>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-auto">
                        {patient.weightDelta ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Clock className="text-primary" /> Medical History
                    </h3>
                    <a className="text-sm text-primary font-semibold hover:underline" href="#">
                      View Full History
                    </a>
                  </div>

                  {patient.diagnosis && (
                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 mb-4">
                      <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm mb-2">
                        Primary Diagnosis: {patient.diagnosis}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Diagnosed in 2021. Patient experiences occasional palpitations triggered
                        by stress or caffeine. Currently managed with medication.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">pill</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          Current Medications
                        </p>
                        <p className="text-xs text-slate-500">
                          {patient.medications ?? '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                          Allergies
                        </p>
                        <p className="text-xs text-slate-500">{patient.allergies ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <BarChart2 className="text-secondary" /> Recent Lab Results
                    </h3>
                    <span className="text-xs text-slate-400">Last updated: 2 days ago</span>
                  </div>

                  <div className="space-y-3">
                    {(patient.labs || []).map((lab) => (
                      <div
                        key={lab.name}
                        className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined">science</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{lab.name}</p>
                            <p className="text-xs text-slate-500">
                              Lab: {lab.lab ?? '—'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`block px-2.5 py-1 rounded-full text-xs font-bold ${
                              lab.status === 'Normal'
                                ? 'bg-green-100 text-green-700'
                                : lab.status === 'Borderline'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {lab.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Calendar className="text-purple-500" /> Upcoming Appointment
                    </h3>
                  </div>

                  {patient.upcoming ? (
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-5 flex items-center gap-4">
                      <div className="flex flex-col items-center bg-white rounded-xl p-2 min-w-[4rem] shadow-sm border border-slate-100">
                        <span className="text-xs text-slate-500 font-bold uppercase">
                          {patient.upcoming.month}
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {patient.upcoming.day}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">{patient.upcoming.title}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {patient.upcoming.time}
                        </p>
                      </div>
                      <button className="px-3 py-2 text-sm text-primary font-bold hover:bg-white rounded-lg transition-colors">
                        Reschedule
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 text-slate-500">
                      No upcoming appointment.
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex justify-between items-center relative z-20">
              <span className="text-xs text-slate-400">
                Last visit: {patient.lastSeen ?? '—'}
              </span>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Add Note
                </button>
                <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-lg">
                  Prescribe
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}