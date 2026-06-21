import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Clock, MapPin, Calendar, HelpCircle, CheckCircle2, MessageSquare, Laptop, UserCheck, Settings, Award 
} from 'lucide-react';
import { DETAILED_PROGRAMS, DetailedProgram, SessionInfo } from '../data/programsData';

interface ProgramDetailPageProps {
  initialProgramId: string;
  onClose: () => void;
  onNavigateSection: (sectionId: string, preselectedProgram?: string) => void;
}

export default function ProgramDetailPage({ 
  initialProgramId, 
  onClose, 
  onNavigateSection 
}: ProgramDetailPageProps) {
  const [selectedProgramId, setSelectedProgramId] = React.useState(initialProgramId);

  // Synchronize state when initialProgramId prop changes (e.g. browser back/forward buttons clicked)
  useEffect(() => {
    setSelectedProgramId(initialProgramId);
  }, [initialProgramId]);

  // Smooth scroll to top on mount or program switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProgramId]);

  const handleProgramSelect = (progId: string) => {
    setSelectedProgramId(progId);
    if (window.history.state?.isDetail) {
      window.history.replaceState({ isDetail: true, programSlug: progId }, '', `#program-detail-${progId}`);
    }
  };

  const activeProg = DETAILED_PROGRAMS.find(p => p.id === selectedProgramId) || DETAILED_PROGRAMS[0];

  const handleApplyClick = () => {
    // Map the selected program ID back to the value expected in the select input
    let selectVal = "기타";
    if (activeProg.id === "focus-alignment") selectVal = "Focus & Alignment";
    else if (activeProg.id === "critical-framing") selectVal = "Critical Problem Framing";
    else if (activeProg.id === "thinking-conflict") selectVal = "Think Through Conflict";
    else if (activeProg.id === "relational-dynamics") selectVal = "Relational Dynamics & Alignment";
    else if (activeProg.id === "core-value") selectVal = "1:1 Coaching"; // map to coaching or let it preselect
    else if (activeProg.id === "organizational-politics") selectVal = "기타";

    onNavigateSection('#contact', selectVal);
  };

  return (
    <div id="top" className="min-h-screen bg-[#F5F2ED] text-brand-ink selection:bg-brand-primary selection:text-white">
      {/* Visual Header / Sub-Nav consistent with theme */}
      <div className="border-b border-brand-ink/10 bg-[#F5F2ED]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] hover:text-brand-primary transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to main
          </button>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => onNavigateSection('#home')} className="text-xs font-bold uppercase tracking-[0.2em] hover:text-brand-primary transition-colors">Home</button>
            <button onClick={() => onNavigateSection('#about')} className="text-xs font-bold uppercase tracking-[0.2em] hover:text-brand-primary transition-colors">About</button>
            <button onClick={() => onNavigateSection('#credentials')} className="text-xs font-bold uppercase tracking-[0.2em] hover:text-brand-primary transition-colors">Credentials</button>
            <button onClick={() => onClose()} className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary font-bold">Programs</button>
            <button onClick={() => onNavigateSection('#insights')} className="text-xs font-bold uppercase tracking-[0.2em] hover:text-brand-primary transition-colors">Insights</button>
            <button onClick={() => onNavigateSection('#contact')} className="text-xs font-bold uppercase tracking-[0.2em] hover:text-brand-primary transition-colors">Contact</button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-20">
        
        {/* Core Introductory Banner (Polish Copy) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl p-8 md:p-12 mb-16 shadow-xs border border-brand-ink/5"
        >
          <div className="max-w-4xl">
            <span className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-3 block font-bold">Program Overview</span>
            <h1 className="text-xl md:text-2xl font-serif italic mb-6 text-brand-ink">나를 규정하는 사고를 마주하고 정렬하기</h1>
            
            <div className="w-20 h-0.5 bg-brand-primary/40 mb-8"></div>
            
            <div className="space-y-4 text-brand-ink/80 text-base md:text-lg leading-relaxed break-keep">
              <p className="font-semibold text-brand-ink">
                제시된 커리큘럼은 많은 리더들이 겪는 어려움에 기반한 예시 프로그램 제안입니다.
              </p>
              <p>
                우리의 삶과 비즈니스 이슈는 결코 정형화된 틀에 끼워 맞춰질 수 없기 때문입니다.
                첫 단계인 <span className="text-brand-primary font-bold">웰컴 세션(Welcome Session)</span>을 통해 고객의 인격적 가치, 지향 방향, 그리고 해결하고 싶은 실질적인 당면 난제를 깊고 세심히 경청합니다.
              </p>
              <p>
                당신이 결정하는 어젠다가 곧 코칭의 단 하나뿐인 교본이 되며, 진행 속도와 복잡성에 맞추어 <span className="font-semibold text-brand-ink border-b-2 border-brand-primary/20">유연하고 입체적으로 커스텀 테일러링(Tailoring)</span>되어 제공됩니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 2-Column Program Browser layout */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Mobile/Tablet Program Selector (Horizontal Scroll) - Visible only on < lg screens */}
          <div className="lg:hidden mb-2">
            <h3 className="text-xs uppercase tracking-widest text-brand-ink/50 font-bold px-1 mb-3">전체 프로그램 목차</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6">
              {DETAILED_PROGRAMS.map((prog) => {
                const isActive = prog.id === selectedProgramId;
                return (
                  <button
                    key={prog.id}
                    onClick={() => handleProgramSelect(prog.id)}
                    className={`snap-start shrink-0 text-left px-5 py-4 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer text-xs md:text-sm min-w-[240px] max-w-[280px] ${
                      isActive 
                        ? 'bg-brand-ink text-[#F5F2ED] border-brand-ink shadow-sm' 
                        : 'bg-white text-brand-ink border-brand-ink/10 hover:border-brand-primary/40'
                    }`}
                  >
                    <span className={`text-[9px] uppercase tracking-wider ${isActive ? 'text-brand-primary/80' : 'text-brand-ink/50'}`}>
                      {prog.category === "Clarity" ? "Complexity to Clarity" : "Inner Order & Balance"}
                    </span>
                    <span className="font-bold tracking-tight truncate w-full">{prog.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Left Navigation: Program Switcher - Desktop only (visible on lg and above) */}
          <div className="hidden lg:block lg:col-span-4 space-y-3 lg:sticky lg:top-28">
            <h3 className="text-xs uppercase tracking-widest text-[#5e584f]/50 font-bold px-4 mb-4">전체 프로그램 목차</h3>
            <div className="space-y-2">
              {DETAILED_PROGRAMS.map((prog, idx) => {
                const isActive = prog.id === selectedProgramId;
                return (
                  <button
                    key={prog.id}
                    onClick={() => handleProgramSelect(prog.id)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group text-sm md:text-base ${
                      isActive 
                        ? 'bg-brand-ink text-[#F5F2ED] border-brand-ink shadow-sm' 
                        : 'bg-white text-brand-ink border-brand-ink/10 hover:border-brand-primary/40'
                    }`}
                  >
                    <div className="flex flex-col gap-1 max-w-[95%]">
                      <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-brand-primary/80' : 'text-brand-ink/50'}`}>
                        {prog.category === "Clarity" ? "Complexity to Clarity" : "Inner Order & Balance"}
                      </span>
                      <span className="font-bold tracking-tight truncate">{prog.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-brand-ink/5 p-6 rounded-2xl border border-brand-ink/5 mt-8">
              <h4 className="text-xs uppercase tracking-widest font-bold text-brand-ink mb-2">Tailoring Promise</h4>
              <p className="text-xs text-brand-ink/60 leading-relaxed break-keep mb-3">
                모든 프로그램은 세션 수와 구성, 진로에 대한 맞춤 설계가 무제한 적용될 수 있습니다. 상담 단계를 지나 핵심 진단에 따르는 세심한 맞춤을 지원받으십시오.
              </p>
              <p className="text-[11px] text-[#b58b4c] font-medium leading-relaxed break-keep border-t border-brand-ink/10 pt-3">
                ※ 진단 및 오리엔테이션 강도에 따라 첫 세션은 통합 진행될 수 있습니다.
              </p>
            </div>
          </div>

          {/* Right Area: Dynamic Program Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProg.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xs border border-brand-ink/5"
              >
                {/* Banner Image */}
                <div className="h-64 md:h-80 relative overflow-hidden">
                  <img 
                    src={activeProg.image} 
                    alt={activeProg.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/40 to-transparent"></div>
                  
                  <div className="absolute bottom-8 left-8 right-8 text-[#F5F2ED]">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs uppercase tracking-[0.2em] bg-brand-primary text-white font-bold px-3 py-1 rounded-sm">
                        {activeProg.category === "Clarity" ? "Clarity Line" : "Balance Line"}
                      </span>
                      <span className="text-xs font-bold bg-[#b58b4c] text-white px-3 py-1 rounded-sm">
                        {activeProg.sessionsCount}
                      </span>
                      <span className="text-xs font-bold bg-white/20 text-[#F5F2ED] backdrop-blur-xs px-3 py-1 rounded-sm">
                        {activeProg.totalDuration}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-serif font-bold italic tracking-tight">{activeProg.title}</h2>
                  </div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                  {/* Detailed Description */}
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-brand-primary font-bold">About Program</h3>
                    <p className="text-lg font-bold text-brand-ink leading-snug break-keep">
                      "{activeProg.shortSummary}"
                    </p>
                    <p className="text-brand-ink/75 text-base leading-relaxed break-keep whitespace-pre-line pt-2">
                      {activeProg.fullDescription}
                    </p>
                  </div>

                  {/* Tailoring & Custom Rules Box */}
                  <div className="bg-[#F5F2ED] rounded-2xl p-6 md:p-8 space-y-4 border border-brand-ink/5">
                    <div className="flex items-center gap-2 text-brand-primary">
                      <Settings size={18} />
                      <h4 className="text-xs uppercase tracking-widest font-bold">1:1 맞춤화 및 조율 규칙 (Agile Tailoring)</h4>
                    </div>
                    <ul className="space-y-3">
                      {activeProg.tailoringNotes.map((note, noteIdx) => (
                        <li key={noteIdx} className="flex gap-2.5 text-sm text-brand-ink/85 leading-relaxed break-keep">
                          <CheckCircle2 size={16} className="text-brand-primary shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Curriculum Timeline */}
                  <div className="space-y-8">
                    <div className="flex justify-between items-center pb-2 border-b border-brand-ink/10">
                      <h3 className="text-xs uppercase tracking-[0.2em] text-brand-primary font-bold">Curriculum & Flow</h3>
                      <span className="text-xs text-brand-ink/50 font-medium">세션별 상세 정보</span>
                    </div>

                    <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-brand-ink/5">
                      {activeProg.sessions.map((session, sIdx) => (
                        <div key={sIdx} className="relative pl-12 group">
                          {/* Dot accent on timeline */}
                          <div className="absolute left-4 top-1 w-4 h-4 rounded-full border-2 border-brand-primary bg-white z-10 transition-transform group-hover:scale-125"></div>
                          
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-sm">
                                {session.sessionNum}
                              </span>
                              <span className="text-xs font-semibold text-brand-ink/60 flex items-center gap-1 bg-brand-ink/5 px-2 py-0.5 rounded-sm">
                                <Clock size={12} /> {session.duration}
                              </span>
                              {session.recommendation && (
                                <span className="text-[10px] font-bold text-[#b58b4c] border border-[#b58b4c]/30 px-2 py-0.5 rounded-sm flex items-center gap-1 bg-[#b58b4c]/5">
                                  {session.recommendation === "Offline 추천" ? <MapPin size={10} /> : <Award size={10} />}
                                  {session.recommendation}
                                </span>
                              )}
                            </div>
                            
                            <h4 className="text-base font-bold text-brand-ink tracking-tight group-hover:text-brand-primary transition-colors">
                              {session.title}
                            </h4>
                            <p className="text-sm text-brand-ink/70 leading-relaxed break-keep">
                              {session.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Application Anchor Card */}
                  <div className="p-8 rounded-2xl bg-brand-ink text-[#F5F2ED] text-center space-y-6 mt-6">
                    <div className="max-w-lg mx-auto space-y-2">
                      <h4 className="text-xl font-bold tracking-tight">이 프로그램에 대해 상담을 받아보시겠습니까?</h4>
                      <p className="text-xs text-[#F5F2ED]/60 leading-relaxed break-keep">
                        현재 풀고 계시는 고민이나 지향하시는 리더십 이슈에 맞춰 상세 일정을 조율해 드립니다. <br />
                        아래 버튼을 선택하면 문의 작성 폼으로 자동 이동하며 프로그램명이 자동 지정됩니다.
                      </p>
                    </div>
                    <button 
                      onClick={handleApplyClick}
                      className="inline-flex items-center gap-2 bg-[#F5F2ED] hover:bg-[#F5F2ED]/90 text-brand-ink font-bold px-8 py-3.5 rounded-sm text-sm transition-all focus:ring-2 focus:ring-[#F5F2ED]/50 cursor-pointer shadow-md"
                    >
                      <MessageSquare size={16} />
                      프로그램 상담 및 신청하기
                    </button>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
