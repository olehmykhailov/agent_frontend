"use client";

import { useEffect, useState, useCallback } from "react";
import { useChat } from "./ChatProvider";
import { getVacancies } from "@/src/services/vacanciesService";
import { VacanciesGetResponse } from "@/src/types/vacancies/VacanciesGetResponseType";
import { subscribeToVacancies } from "@/src/lib/socket";

export default function VacanciesSidebar() {
  const { selectedChatId, isVacanciesOpen, toggleVacancies, isSocketConnected } = useChat();
  const [vacancies, setVacancies] = useState<VacanciesGetResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<VacanciesGetResponse | null>(null);

  const fetchVacancies = useCallback(() => {
    if (!selectedChatId) return;
    setLoading(true);
    getVacancies(selectedChatId)
      .then((res) => setVacancies(res.content))
      .catch((err) => console.error("Failed to load vacancies", err))
      .finally(() => setLoading(false));
  }, [selectedChatId]);

  useEffect(() => {
    if (selectedChatId && isVacanciesOpen) {
      fetchVacancies();
    }
  }, [selectedChatId, isVacanciesOpen, fetchVacancies]);

  useEffect(() => {
    if (selectedChatId && isSocketConnected && isVacanciesOpen) {
      const subscription = subscribeToVacancies(selectedChatId, () => {
        fetchVacancies();
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [selectedChatId, isSocketConnected, isVacanciesOpen, fetchVacancies]);

  if (!isVacanciesOpen) return null;

  return (
    <div 
      className={`border-l border-slate-200 bg-white flex absolute right-0 top-16 bottom-0 shadow-2xl z-20 transition-all duration-300 ${
        selectedVacancy ? "w-full" : "w-[400px]"
      }`}
    >
      {/* Detailed View Panel */}
      {selectedVacancy && (
        <div className="flex-1 border-r border-slate-200 bg-slate-50 flex flex-col h-full animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0">
             <h2 className="font-bold text-xl text-slate-800">Vacancy Details</h2>
             <button 
                onClick={() => setSelectedVacancy(null)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
             >
                Close Details
             </button>
          </div>
          <div className="p-8 overflow-y-auto">
             <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{selectedVacancy.jobTitle}</h1>
                        <div className="flex items-center gap-4 text-slate-500">
                            {selectedVacancy.companyName && <span className="flex items-center gap-1">🏢 {selectedVacancy.companyName}</span>}
                            {selectedVacancy.location && <span className="flex items-center gap-1">📍 {selectedVacancy.location}</span>}
                        </div>
                    </div>
                    <a 
                      href={selectedVacancy.sourceLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Apply Now ↗
                    </a>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">Salary Range</div>
                        <div className="font-semibold text-slate-800 text-lg">
                           {(selectedVacancy.minSalary > 0 || selectedVacancy.maxSalary > 0) ? (
                              <span className="text-green-600">
                                {selectedVacancy.minSalary > 0 ? selectedVacancy.minSalary : ''} 
                                {selectedVacancy.minSalary > 0 && selectedVacancy.maxSalary > 0 ? ' - ' : ''}
                                {selectedVacancy.maxSalary > 0 ? selectedVacancy.maxSalary : ''}
                              </span>
                           ) : "Not specified"}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">Seniority Level</div>
                        <div className="font-semibold text-slate-800 capitalize">
                           {selectedVacancy.seniorityLevel || "Not specified"}
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-lg text-slate-800 mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedVacancy.techStack?.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                            {tech}
                        </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-3">Description</h3>
                    <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
                        {selectedVacancy.description}
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* List Panel */}
      <div className="w-[400px] flex flex-col h-full bg-white shrink-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span>📋</span> Parsed Vacancies
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{vacancies.length}</span>
          </h2>
          <button 
            onClick={toggleVacancies}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center mt-20 text-slate-400 gap-2">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span>Loading vacancies...</span>
            </div>
          ) : vacancies.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 text-slate-400 gap-2">
              <span className="text-4xl">📭</span>
              <span>No vacancies found yet.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {vacancies.map((vacancy) => (
                <div 
                  key={vacancy.id} 
                  onClick={() => setSelectedVacancy(vacancy)}
                  className={`bg-white p-4 rounded-xl shadow-sm border transition-all cursor-pointer group flex flex-col gap-2
                    ${selectedVacancy?.id === vacancy.id 
                      ? "border-blue-500 ring-1 ring-blue-500 shadow-md" 
                      : "border-slate-100 hover:shadow-md hover:border-blue-200"
                    }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-semibold leading-tight transition-colors ${
                      selectedVacancy?.id === vacancy.id ? "text-blue-700" : "text-slate-800 group-hover:text-blue-700"
                    }`}>
                          {vacancy.jobTitle}
                    </h3>
                    {(vacancy.minSalary > 0 || vacancy.maxSalary > 0) && (
                        <span className="text-green-600 font-medium text-xs whitespace-nowrap bg-green-50 px-2 py-1 rounded">
                          {vacancy.minSalary > 0 ? vacancy.minSalary : ''} 
                          {vacancy.minSalary > 0 && vacancy.maxSalary > 0 ? ' - ' : ''}
                          {vacancy.maxSalary > 0 ? vacancy.maxSalary : ''}
                        </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    {vacancy.companyName && <span className="font-medium text-slate-700">🏢 {vacancy.companyName}</span>}
                    {vacancy.location && <span>📍 {vacancy.location}</span>}
                    {vacancy.seniorityLevel && <span className="capitalize">🎓 {vacancy.seniorityLevel}</span>}
                  </div>

                  {vacancy.techStack && vacancy.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                          {vacancy.techStack.slice(0, 3).map((tech) => (
                          <span key={tech} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {tech}
                          </span>
                          ))}
                          {vacancy.techStack.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{vacancy.techStack.length - 3}</span>
                          )}
                      </div>
                  )}
                  
                  {vacancy.description && (
                      <p className="text-xs text-slate-600 line-clamp-3 mt-1 leading-relaxed">
                          {vacancy.description}
                      </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
