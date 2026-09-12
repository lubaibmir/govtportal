import React, { useState } from 'react';
import { searchDeduplication, DeduplicationResponse } from '../services/beneficiaryService';
import { Beneficiary360Modal } from './Beneficiary360Modal';

interface MdmDeduplicationPanelProps {
  token: string;
}

export const MdmDeduplicationPanel: React.FC<MdmDeduplicationPanelProps> = ({ token }) => {
  const [queryName, setQueryName] = useState('');
  const [queryPhone, setQueryPhone] = useState('');
  const [queryAadhaar, setQueryAadhaar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DeduplicationResponse | null>(null);
  
  // 360 modal state
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryName && !queryPhone && !queryAadhaar) {
      setError('Please provide at least one search parameter (Name, Phone, or Aadhaar Hash).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await searchDeduplication(token, {
        query_name: queryName.trim() || undefined,
        phone: queryPhone.trim() || undefined,
        national_id_hash: queryAadhaar.trim() || undefined
      });
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Error searching master beneficiary records.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSearch = (name: string, phone?: string) => {
    setQueryName(name);
    setQueryPhone(phone || '');
    setQueryAadhaar('');
    setLoading(true);
    setError(null);
    searchDeduplication(token, {
      query_name: name,
      phone: phone || undefined
    }).then((data) => {
      setResults(data);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-lg">
              🔍
            </span>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Master Data Management (MDM) & Beneficiary Deduplication
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Detect fraudulent multiple applications, ghost beneficiaries, and cross-departmental duplicate identities using federated fuzzy matching.
          </p>
        </div>

        {/* Quick Demo Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Quick Test:</span>
          <button
            type="button"
            onClick={() => handleQuickDemoSearch('Rahul Sharrma', '9876543210')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-medium transition"
          >
            Fuzzy Name: "Rahul Sharrma"
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoSearch('Priya Patil')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-medium transition"
          >
            "Priya Patil"
          </button>
        </div>
      </div>

      {/* Search Filter Form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Full Name (Fuzzy Match)
          </label>
          <input
            type="text"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            type="text"
            value={queryPhone}
            onChange={(e) => setQueryPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Aadhaar SHA-256 Hash
          </label>
          <input
            type="text"
            value={queryAadhaar}
            onChange={(e) => setQueryAadhaar(e.target.value)}
            placeholder="e.g. e3b0c44298fc..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Scanning Registries...
              </>
            ) : (
              <>
                <span>🚀</span> Run Deduplication
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Results Table */}
      {results && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Matches Found: <span className="text-slate-800">{results.matches_found} candidate(s)</span>
            </span>
            <span className="text-xs text-slate-400">
              Evaluated across Revenue, MSME, Education & MSBTE Registries
            </span>
          </div>

          {results.candidates.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <span className="text-3xl">🛡️</span>
              <p className="text-sm font-semibold text-slate-700 mt-2">No duplicate or matching records found</p>
              <p className="text-xs text-slate-400 mt-1">This citizen profile is unique with zero redundancy flags.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Beneficiary Candidate</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Confidence Score</th>
                    <th className="py-3 px-4">Match Reasons</th>
                    <th className="py-3 px-4">Registries Linked</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.candidates.map((cand) => (
                    <tr key={cand.citizen_id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {cand.full_name.charAt(0)}
                          </div>
                          <div>
                            <div>{cand.full_name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ID: {cand.citizen_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div>{cand.phone}</div>
                        <div className="text-slate-400">{cand.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-black ${
                              cand.risk_level === 'HIGH'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : cand.risk_level === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-green-100 text-green-700 border border-green-200'
                            }`}
                          >
                            {cand.match_score}% Match
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {cand.risk_level} Risk
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {cand.match_reasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold">
                          {cand.federated_count} Connected
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCitizenId(cand.citizen_id)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-lg transition"
                        >
                          👁️ View 360° Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 360 Degree Profile Modal */}
      {selectedCitizenId && (
        <Beneficiary360Modal
          token={token}
          citizenId={selectedCitizenId}
          onClose={() => setSelectedCitizenId(null)}
        />
      )}
    </div>
  );
};
