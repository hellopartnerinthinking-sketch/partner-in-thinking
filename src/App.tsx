/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, ArrowRight, Mail, Linkedin, ExternalLink, 
  Plus, Edit2, Trash2, LogIn, LogOut, ChevronRight, ChevronDown, Check,
  Award, BookOpen, MessageSquare, User, Settings,
  Layout, Target, Scale, Shield, Brain,
  Phone, Calendar, Clock, Copy, Search, Filter, AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, 
  updateDoc, deleteDoc, doc, limit, getDocs, setDoc,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { db, auth, login, logout } from './firebase';
import { Post, Credential, ContactMessage, SiteSettings } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import ProgramDetailPage from './components/ProgramDetailPage';
import heroStudyImg from './assets/images/luxury_private_study_1791706207887.jpg';

// --- Seed Data ---
const SEED_POSTS: Partial<Post>[] = [
  {
    id: 'seed-1',
    title: "Leader and Problem",
    category: "Inner Growth",
    excerpt: "어떻게 문제에 접근하면 좋을까",
    content: "Read on Naver Blog",
    publishedAt: "2026-03-14T00:00:00Z",
    slug: "leader-and-problem",
    imageUrl: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1000&auto=format&fit=crop",
    externalUrl: "https://blog.naver.com/yourthinkingpartner/224218005707"
  },
  {
    id: 'seed-2',
    title: "Complexity vs. Simplicity",
    category: "Inner Growth",
    excerpt: "어떻게 생각을 정리하면 좋을까",
    content: "Read on Naver Blog",
    publishedAt: "2026-03-18T00:00:00Z",
    slug: "complexity-simplicity",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
    externalUrl: "https://blog.naver.com/yourthinkingpartner/224231589774"
  },
  {
    id: 'seed-3',
    title: "Beyond the Breaking Point",
    category: "Inner Growth",
    excerpt: "왜 우리는 스스로를 무너뜨릴 만큼 짊어질까",
    content: "Read on Naver Blog",
    publishedAt: "2026-04-01T00:00:00Z",
    slug: "leader-overload",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&auto=format&fit=crop",
    externalUrl: "https://blog.naver.com/yourthinkingpartner/224216525846"
  },
  {
    id: 'seed-4',
    title: "Relationship and Desire",
    category: "Inner Growth",
    excerpt: "왜 어떤 관계는 갈등으로 끝이 날까",
    content: "Read on Naver Blog",
    publishedAt: "2026-04-08T00:00:00Z",
    slug: "desire-recognition",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
    externalUrl: "https://blog.naver.com/yourthinkingpartner/224216502208"
  },
  {
    id: 'seed-5',
    title: "Conflict Management",
    category: "Inner Growth",
    excerpt: "갈등 상황에서 '회피'는 정말 잘못된 선택일까",
    content: "Read on Naver Blog",
    publishedAt: "2026-04-22T00:00:00Z",
    slug: "conflict-management",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
    externalUrl: "https://blog.naver.com/yourthinkingpartner/224303947434"
  },
  {
    id: 'seed-6',
    title: "Leader and Communication",
    category: "Inner Growth",
    excerpt: "왜 우리의 말은 닿지 않을까",
    content: "Read on Naver Blog",
    publishedAt: "2026-05-06T00:00:00Z",
    slug: "leader-language",
    imageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop",
    externalUrl: "https://blog.naver.com/yourthinkingpartner/224218015851"
  }
];

const SEED_CREDS: Partial<Credential>[] = [
  { 
    title: "Bachelor of Architecture", 
    organization: "Seoul National University", 
    year: "Graduate", 
    order: 0,
    description: "건축학적 논리를 적용하여 복잡한 문제를 구조적으로 해석하고, 시스템적 관점에서 리더십과 조직 코칭의 명확한 방향과 우선순위를 도출합니다."
  },
  { 
    title: "M.S. in Engineering & Project Management", 
    organization: "UC Berkeley", 
    year: "Graduate", 
    order: 1,
    description: "글로벌 경영 프레임워크를 활용하여 복잡한 조직 환경에서 실행력과 리더십을 이끌어내며, 구조적 사고와 전략적 코칭을 통합합니다."
  },
  { 
    title: "B.A. in Psychology", 
    organization: "Chung-Ang University", 
    year: "Graduate", 
    order: 2,
    description: "인간 행동과 심리 기제에 대한 기초적인 이해를 바탕으로, 효과적인 코칭을 위한 과학적 근거를 제공합니다."
  },
  { 
    title: "Certified Associate Coach (KAC)", 
    organization: "Korea Coach Association", 
    year: "Certified", 
    order: 3,
    description: "코칭 방법론에 대한 기초적인 전문성과 전문적인 윤리 기준에 대한 엄격한 준수를 입증합니다."
  },
  { 
    title: "Certified Birkman® (The Birkman Method)", 
    organization: "Birkman International", 
    year: "Certified", 
    order: 4,
    description: "다면적 행동 특성, 내적 동기 및 스트레스 반응을 진단하여 자기 이해와 대인관계 효율성을 극대화합니다."
  },
  { 
    title: "Certified TKI® (Thomas-Kilmann Conflict Mode Instrument)", 
    organization: "Certified", 
    year: "Certified", 
    order: 5,
    description: "갈등 상황에서 반복되는 사고와 감정의 패턴을 분석하여 효과적인 대응 전략을 수립합니다."
  },
  { 
    title: "Certified FIRO-B® (Fundamental Interpersonal Relations Orientation – Behavior)", 
    organization: "Certified", 
    year: "Certified", 
    order: 6,
    description: "관계 속에서 형성된 사고 구조와 대인 관계 욕구를 파악하여 조직 내 협업과 소통을 개선합니다."
  },
  { 
    title: "Certified Problem Solving Process Advanced Practitioner", 
    organization: "Strategic Methodology", 
    year: "Certified", 
    order: 7,
    description: "구조화된 프레임워크를 마스터하여 복잡한 조직의 과제를 분석하고 실행 가능한 전략적 솔루션을 도출합니다."
  }
];

// --- GA4 Event Tracking Helpers ---
let lastContactSubmitTime = 0;
export const trackContactSubmit = (buttonName = '최종 신청하기', location = 'contact_form') => {
  const now = Date.now();
  // Prevent duplicate events within 500ms (e.g., button click and form submit fired simultaneously)
  if (now - lastContactSubmitTime < 500) return;
  lastContactSubmitTime = now;

  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'contact_submit', {
        button_name: buttonName,
        location: location,
      });
    } else if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(['event', 'contact_submit', { button_name: buttonName, location: location }]);
    }
  } catch (error) {
    console.warn('GA4 tracking error:', error);
  }
};

export const trackCtaClick = (buttonName: string, location: string) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'click_cta', {
        button_name: buttonName,
        location: location,
      });
    } else if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(['event', 'click_cta', { button_name: buttonName, location: location }]);
    }
  } catch (error) {
    console.warn('GA4 tracking error:', error);
  }
};

// --- Components ---

const Navbar = ({ 
  isAdmin, 
  user, 
  onLogin, 
  onLogout,
  onNavigateSection
}: { 
  isAdmin: boolean, 
  user: FirebaseUser | null, 
  onLogin: () => void, 
  onLogout: () => void,
  onNavigateSection?: (sectionId: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Credentials', href: '#credentials' },
    { name: 'Programs', href: '#program' },
    { name: 'Insights', href: '#insights' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigateSection) {
      e.preventDefault();
      onNavigateSection(href);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-brand-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center gap-2">
            <a 
              href="#home" 
              onClick={(e) => handleLinkClick(e, '#home')}
              className="text-xl font-display font-bold tracking-[0.15em] uppercase flex items-center gap-2.5"
            >
              <span className="text-brand-ink">PARTNER</span>
              <span className="text-brand-primary">IN</span>
              <span className="text-brand-ink">THINKING</span>
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-xs font-bold uppercase tracking-[0.2em] hover:text-brand-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => {
                trackCtaClick('무료 세션 바로가기', 'navbar');
                handleLinkClick(e, '#contact');
              }}
              className="ml-1 bg-brand-primary hover:opacity-90 text-white text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 shadow-sm shadow-brand-primary/20 flex items-center gap-1.5"
            >
              <span>30분 무료 세션</span>
              <ArrowRight size={12} />
            </a>
            {isAdmin && (
              <div className="flex items-center gap-4 pl-4 border-l border-brand-ink/10">
                <a href="#admin" className="text-xs font-bold text-brand-primary">ADMIN</a>
                <button onClick={onLogout} className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100">Logout</button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-bg border-b border-brand-ink/5 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => {
                    setIsOpen(false);
                    handleLinkClick(e, link.href);
                  }}
                  className="text-lg font-serif italic"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => {
                  trackCtaClick('무료 세션 바로가기', 'navbar');
                  setIsOpen(false);
                  handleLinkClick(e, '#contact');
                }}
                className="mt-2 bg-brand-primary text-white text-center py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                <span>30분 무료 세션</span>
                <ArrowRight size={16} />
              </a>
              {isAdmin && (
                <div className="pt-4 border-t border-brand-ink/5">
                  <button onClick={onLogout} className="text-sm uppercase tracking-widest">Logout</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onNavigateContact }: { onNavigateContact?: () => void }) => (
  <section id="home" className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden bg-brand-bg">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-start relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="pt-10"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-brand-ink mb-2">
          A THINKING PARTNER
        </h1>
        <h2 className="text-2xl md:text-3xl font-sans font-light text-brand-ink/90 mb-12 tracking-tight">
          Complexity to clear next steps
        </h2>
        
        <div className="mb-10 pl-5 border-l border-brand-primary/30">
          <p className="text-lg md:text-xl font-serif text-[#ab8040] italic tracking-normal leading-relaxed break-keep">
            “성과로 증명해야 하는 자리에서<br />
            온전히 나눌 수 없어 홀로 내린 결정들.<br />
            과연 리더로서 얼마나 확신하고 계시나요?”
          </p>
        </div>
        
        <div className="space-y-1 text-lg md:text-xl font-sans text-brand-ink/80 leading-snug mb-16">
          <p>복잡한 세상 속,</p>
          <p>얽힌 머릿속과 마음을</p>
          <p>체계적으로 구조화합니다.</p>
          <p>행동으로 이어지는 대화를 통해</p>
          <p>당신의 일상을 정돈하고,</p>
          <p>다시 충만한 삶으로 나아가도록 돕는</p>
          <p>사고 파트너입니다.</p>
        </div>

        <div className="flex flex-wrap gap-6">
          <a 
            href="#contact" 
            onClick={(e) => {
              trackCtaClick('사고 파트너와 1:1 30분 무료 세션 신청하기', 'hero_section');
              if (onNavigateContact) {
                e.preventDefault();
                onNavigateContact();
              }
            }}
            className="bg-brand-primary text-white px-8 sm:px-10 py-4 rounded-full flex items-center gap-3 hover:opacity-90 transition-all duration-300 text-base sm:text-lg font-medium shadow-lg shadow-brand-primary/20"
          >
            사고 파트너와 1:1 30분 무료 세션 신청하기 <ArrowRight size={20} />
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-end lg:pt-[180px]"
      >
        <div className="w-full max-w-sm">
          {/* Rounded photo frame */}
          <div className="overflow-hidden rounded-[32px] shadow-2xl shadow-brand-ink/10 border border-brand-ink/5 bg-brand-bg-alt">
            <img 
              src={heroStudyImg} 
              alt="따뜻한 조명이 켜진 프라이빗 서재 데스크" 
              className="w-full aspect-[4/3] object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = '/images/hero_study.jpg';
              }}
            />
          </div>
          
          {/* Quote text beneath the image, right aligned, scaled down to match '사고 파트너입니다.' baseline */}
          <div className="mt-5 text-right pr-1">
            <p className="font-serif italic text-brand-ink/80 text-base sm:text-lg leading-snug">
              When the moment truly matters<br />
              You don’t have to lead by yourself.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-24 bg-white/50">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
        {/* Left Column: Title & Philosophy */}
        <motion.div 
          className="lg:col-span-5"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-8 block font-bold">
            ABOUT PARTNER <span className="text-brand-primary">IN</span> THINKING
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-brand-ink mb-8 leading-tight">
            From Complexity <br /> to clear next steps
          </h2>
          <p className="text-lg md:text-xl font-serif italic text-brand-ink/60 leading-relaxed mb-8">
            당신의 사고 파트너로서 <br /> 명확한 시야를 찾도록 돕습니다.
          </p>
          <div className="w-20 h-px bg-brand-primary mb-6"></div>
        </motion.div>

        {/* Right Column: Description & Features */}
        <div className="lg:col-span-7 lg:pt-[12.5rem]">
          <motion.p 
            className="text-base md:text-lg font-sans leading-relaxed text-brand-ink/80 mb-12 break-keep"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            중요한 책임의 무게는 누구에게나 버겁게 느껴질 수 있습니다. <br />
            리더의 자리에서든, 일과 삶의 전환점에서든 우리는 종종 복잡함에 갇힙니다. <br /><br />
            당신의 <span className="italic text-brand-primary">Thinking Partner</span>로서 
            <span className="font-bold text-brand-ink"> 사고의 구조화</span>를 통해 실행 가능한 명확함을 찾고, <br />
            <span className="font-bold text-brand-ink"> 내면의 질서</span>를 정돈하여 지속 가능한 균형을 회복하도록 돕습니다.
          </motion.p>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            {[
              { icon: <Layout size={20} />, title: "Critical Framing", desc: <>복잡한 상황의 본질을 정의하고, <br />해결해야 할 핵심 문제를 선명하게 만듭니다.</> },
              { icon: <Target size={20} />, title: "Actionable Focus", desc: <>한정된 에너지를 가장 중요한 과제에 정렬하여 <br />실질적인 실행력을 높입니다.</> },
              { icon: <Scale size={20} />, title: "Inner Order", desc: <>내면의 충돌과 사고 패턴을 객관화하여 <br />실행을 가로막는 심리적 장벽을 해소합니다.</> },
              { icon: <Shield size={20} />, title: "Relational Balance", desc: <>관계 속의 사고 구조를 파악하여 <br />조직과 개인의 지속 가능한 조화를 이룹니다.</> }
            ].map((item, i) => (
              <motion.div 
                key={i}
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 * i + 0.4 }}
              >
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-brand-ink">{item.title}</h3>
                <p className="text-sm md:text-base text-brand-ink/60 leading-relaxed break-keep">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Program = ({ 
  onSelectProgramDetail,
  onNavigateContact 
}: { 
  onSelectProgramDetail: (slug: string) => void;
  onNavigateContact?: (programTitle?: string) => void;
}) => {
  const pillars = [
    {
      id: "performance-decision",
      koreanTitle: "성과 & 의사 결정",
      englishTitle: "Performance & Decision Alignment",
      relevance: "할 일은 쏟아지고 불확실성은 높은데, 지금 어떤 결정부터 내려야 할지 막막할 때",
      outcome: "명확한 기준에 따라 우선순위를 정하고 가장 중요한 과제에 몰입하게 됩니다. 나만의 업무 가치와 데이터를 바탕으로 의사결정의 확신을 가질 수 있습니다.",
      image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1000&auto=format&fit=crop",
      slug: "focus-alignment"
    },
    {
      id: "team-dynamics",
      koreanTitle: "조직 & 대인 관계",
      englishTitle: "Team Dynamics & Alignment",
      relevance: "팀원 간 갈등, 모호한 R&R, 타 부서와의 상극으로 조직 성과가 정체되어 있을 때",
      outcome: "관계 속 반복되는 충돌 패턴의 원인을 분석해 원활한 협업 체계를 구축합니다. 명확한 역할 정의와 신뢰 형성을 통해 팀 시너지를 극대화하고, 건강한 조직 문화를 완성합니다.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
      slug: "relational-dynamics"
    },
    {
      id: "impactful-communication",
      koreanTitle: "커뮤니케이션",
      englishTitle: "Impactful Communication",
      relevance: "의도와 다르게 전달되는 지시, 성과 저고자 면담 등 난처한 대화가 부담스러울 때",
      outcome: "대화의 본질을 정립하여 핵심이 명확히 전달되는 대화 구조를 터득합니다. 어려운 피드백 상황에서도 관계를 해치지 않고 솔루션을 끌어내는 심리적 주도권을 확보합니다.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
      slug: "thinking-conflict"
    },
    {
      id: "inner-order",
      koreanTitle: "멘탈 & 자기 관리",
      englishTitle: "Inner Order & Mental Resilience",
      relevance: "리더로서의 고독감과 과도한 책임감으로 번아웃이 오고 감정 조절이 힘들 때",
      outcome: "감정적 앙금과 누적된 스트레스를 객관적으로 정리해 내면의 평정심을 회복합니다. 어떤 위기 상황에서도 흔들리지 않는 단단한 회복탄력성과 지속 가능한 리더십 에너지를 충전합니다.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
      slug: "core-value"
    },
    {
      id: "authentic-leadership",
      koreanTitle: "리더십 & 커리어",
      englishTitle: "Leadership & Career",
      relevance: "나만의 리더십 스타일이 모호하거나, 리더로서의 다음 커리어 방향이 고민될 때",
      outcome: "자신의 핵심 강점을 재발견하여 고유한 리더십 정체성과 브랜딩을 확립합니다. 단기적 역할을 넘어 조직 내 영향력을 확장하고 장기적인 리더십 비전 로드맵을 선명하게 설계합니다.",
      image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1000&auto=format&fit=crop",
      slug: "organizational-politics"
    }
  ];

  return (
    <section id="program" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-6 block font-bold">5 Core Coaching Pillars</span>
            <h2 className="text-4xl md:text-6xl font-serif italic text-brand-ink mb-12">Programs</h2>
            
            <div className="max-w-3xl space-y-4 text-brand-ink/80 text-lg leading-relaxed break-keep">
              <p>
                리더가 처한 현실과 당면 과제는 저마다 다르지만,<br className="hidden md:block" />
                현장에서 마주하는 보편적인 고민은 아래의 영역들로 모입니다.
              </p>
              <p>
                복잡하게 얽힌 내 고민의 본질을 객관적으로 들여다보고 싶다면,<br className="hidden md:block" />
                30분 무료 세션을 통해 생각의 정돈과 방향성을 함께 탐색해 보세요.
              </p>
              
              <div className="mt-8 pt-6 border-t border-brand-ink/10">
                <p className="text-sm md:text-base text-[#b58b4c] font-medium leading-relaxed flex items-start gap-2 break-keep">
                  <span className="inline-block mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b58b4c] shrink-0" />
                  <span>
                    모든 프로그램은 설계 기준이며, 실제 코칭 세션은 리더가 직면한 비즈니스 맥락과 조직 환경에 맞추어<br />
                    1:1 맞춤형(Tailored)으로 최적화되어 진행됩니다.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 5 Pillars List */}
        <div className="space-y-20 md:space-y-24">
          {pillars.map((prog, progIdx) => (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: progIdx * 0.08 }}
              className="grid md:grid-cols-12 gap-8 md:gap-12 items-start"
            >
              {/* Left: Image */}
              <div className="md:col-span-3 lg:col-span-2">
                <div className="aspect-square overflow-hidden rounded-2xl shadow-sm border border-brand-ink/5">
                  <img 
                    src={prog.image} 
                    alt={`${prog.koreanTitle} ${prog.englishTitle}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Right: Content Area */}
              <div className="md:col-span-9 lg:col-span-10">
                {/* Title: 한글 먼저, 영어를 작은 크기로 뒤에, 숫자는 제거 */}
                <div className="flex flex-wrap items-baseline gap-2.5 md:gap-3 mb-2">
                  <h4 className="text-xl md:text-2xl font-bold text-brand-ink tracking-tight">
                    {prog.koreanTitle}
                  </h4>
                  <span className="text-sm md:text-base font-normal text-brand-ink/50 tracking-normal">
                    {prog.englishTitle}
                  </span>
                </div>
                
                {/* Divider Line */}
                <div className="w-full h-px bg-brand-ink/10 mb-5"></div>
                
                {/* Summary & Description Grid */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                  {/* Summary / 타깃의 구체적 고민 상황 (메인 카피) */}
                  <div className="space-y-2">
                    <p className="text-brand-ink/90 font-medium text-base md:text-lg leading-relaxed break-keep">
                      "{prog.relevance}"
                    </p>
                  </div>
                  
                  {/* Description / 우측 상세 설명: 코칭 후 기대효과 */}
                  <div className="flex flex-col h-full justify-center">
                    <p className="text-brand-ink/70 text-sm md:text-base leading-relaxed break-keep">
                      {prog.outcome}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Unified Call To Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 md:mt-28 bg-brand-bg/60 border border-brand-ink/10 rounded-[32px] md:rounded-[40px] p-8 sm:p-12 md:p-16 text-center max-w-4xl mx-auto shadow-sm"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-[#ab8040] font-bold block mb-3">
            1:1 Thinking Partner Session
          </span>
          <h3 className="text-2xl md:text-3xl font-sans font-bold text-brand-ink mb-4 break-keep tracking-tight">
            함께 생각해 보고 싶은 주제나 고민이 있으신가요?
          </h3>
          <p className="text-brand-ink/75 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-6 break-keep">
            어떤 주제라도 좋습니다. 당면한 고민이나 생각을 남겨주시면,<br className="hidden sm:block" /> 
            30분 무료 세션을 통해 함께 방향성을 찾아드립니다.
          </p>

          {/* 3-Step Process Mini Guide */}
          <div className="my-8 py-5 px-4 sm:px-6 bg-white/80 rounded-2xl border border-brand-ink/10 max-w-2xl mx-auto shadow-sm">
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-left sm:text-center divide-y sm:divide-y-0 sm:divide-x divide-brand-ink/10">
              <div className="pt-2 sm:pt-0 sm:px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ab8040] block mb-1">STEP 1</span>
                <p className="text-sm font-bold text-brand-ink mb-0.5">간단한 신청</p>
                <p className="text-xs text-brand-ink/60">고민 키워드 작성</p>
              </div>
              <div className="pt-3 sm:pt-0 sm:px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ab8040] block mb-1">STEP 2</span>
                <p className="text-sm font-bold text-brand-ink mb-0.5">일정 확정</p>
                <p className="text-xs text-brand-ink/60">비대면 Zoom 또는 유선 조율</p>
              </div>
              <div className="pt-3 sm:pt-0 sm:px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ab8040] block mb-1">STEP 3</span>
                <p className="text-sm font-bold text-brand-ink mb-0.5">1:1 맞춤 세션</p>
                <p className="text-xs text-brand-ink/60">30분간 생각 정리 및 방향성 도출</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              trackCtaClick('사고 파트너와 1:1 30분 무료 세션 신청하기', 'programs_section');
              if (onNavigateContact) {
                onNavigateContact();
              } else {
                const el = document.getElementById('contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-3 bg-brand-primary hover:opacity-90 text-white px-8 md:px-10 py-4 rounded-2xl text-base sm:text-lg md:text-xl font-medium shadow-lg shadow-brand-primary/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <span>사고 파트너와 1:1 30분 무료 세션 신청하기</span>
            <ArrowRight size={20} />
          </button>
          <p className="text-xs text-brand-ink/45 mt-4">
            세션 전 사전 준비나 별도의 비용은 필요하지 않습니다. 편안한 마음으로 신청해 주세요.
          </p>
        </motion.div>

        {/* Footer Info */}
        <div className="mt-32 pt-16 border-t border-brand-ink/10 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-bg/30 p-8 md:p-10 rounded-3xl space-y-6"
          >
            <h4 className="font-bold text-brand-ink/80">아래와 같은 경우에는 이 방식이 기대에 맞지 않을 수 있습니다.</h4>
            <ul className="space-y-3 text-brand-ink/60 text-sm md:text-base list-disc ml-5">
              <li>빠른 해답이나 직접적인 조언을 중심으로 한 접근</li>
              <li>사고 과정보다 판단의 위임을 원하는 경우</li>
              <li>감정적 위로 자체를 주된 목적으로 하는 심리 상담 중심의 접근</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  const isAvailable = post.content !== "Coming soon..." || post.externalUrl;
  
  return (
    <motion.div 
      whileHover={isAvailable ? { y: -10 } : {}}
      className={`group ${isAvailable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="aspect-[16/10] overflow-hidden rounded-3xl mb-6">
        <img 
          src={post.imageUrl || `https://picsum.photos/seed/${post.slug}/800/500`} 
          alt={post.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>
      <h3 className="text-xl font-sans font-semibold mb-3 group-hover:text-brand-primary transition-colors">{post.title}</h3>
      <p className="text-brand-ink/60 line-clamp-2 mb-4">{post.excerpt}</p>
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
        {!isAvailable && (
          <span className="opacity-40">Coming Soon</span>
        )}
      </div>
    </motion.div>
  );
};

const Insights = ({ posts }: { posts: Post[] }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <section id="insights" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div 
          className="flex justify-between items-end mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-4 block">Inner Growth & Leadership</span>
            <h2 className="text-3xl md:text-5xl font-serif italic">Insights</h2>
          </div>
          <a 
            href="https://blog.naver.com/yourthinkingpartner" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b-2 border-brand-primary pb-1"
          >
            Read more on Naver Blog <ExternalLink size={16} />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <motion.div 
                key={post.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                onClick={() => {
                  if (post.externalUrl) {
                    window.open(post.externalUrl, '_blank', 'noopener,noreferrer');
                  } else if (post.content !== "Coming soon...") {
                    setSelectedPost(post);
                  }
                }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 opacity-50 italic">
              Sharing insights soon...
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-ink/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-brand-bg text-brand-ink w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] p-8 md:p-16 relative"
            >
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-8 right-8 p-2 hover:bg-brand-ink/5 rounded-full transition-colors"
              >
                <X />
              </button>
              
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-sans font-bold mb-12 leading-tight">{selectedPost.title}</h2>
                <div className="aspect-video rounded-3xl overflow-hidden mb-12">
                  <img 
                    src={selectedPost.imageUrl || `https://picsum.photos/seed/${selectedPost.slug}/1200/800`} 
                    alt={selectedPost.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="markdown-body">
                  <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                </div>
                <div className="mt-16 pt-8 border-t border-brand-ink/10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif italic">P</div>
                    <div>
                      <p className="text-sm font-bold">A Thinking Partner</p>
                      <p className="text-xs opacity-50">Author</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Credentials = ({ credentials }: { credentials: Credential[] }) => {
  const academicBackground = [
    {
      title: "Bachelor of Architecture",
      organization: "Seoul National University"
    },
    {
      title: "M.S. in Engineering & Project Management",
      organization: "UC Berkeley"
    },
    {
      title: "B.A. in Psychology",
      organization: "Chung-Ang University"
    }
  ];

  const coreCertification = [
    {
      title: "Certified Associate Coach (KAC)",
      organization: "",
      description: ""
    },
    {
      title: "Certified Birkman® (The Birkman Method)",
      organization: "",
      description: ""
    },
    {
      title: "Certified TKI® (Thomas-Kilmann Conflict Mode Instrument)",
      organization: "",
      description: ""
    },
    {
      title: "Certified FIRO-B® (Fundamental Interpersonal Relations Orientation – Behavior)",
      organization: "",
      description: ""
    },
    {
      title: "Certified Problem Solving Process Advanced Practitioner",
      organization: "",
      description: ""
    },
    {
      title: "Certified Leader Championship Orientation Trainer",
      organization: "",
      description: ""
    },
    {
      title: "Certified Training & Facilitation Techniques for Instructors Trainer",
      organization: "",
      description: ""
    },
    {
      title: "Certified Green Belt, and more",
      organization: "",
      description: ""
    }
  ];

  return (
    <section id="credentials" className="py-24 bg-brand-ink text-brand-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-20">
          {/* Left Column: Title & Philosophy */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-3xl md:text-5xl font-serif italic mb-12">Professional <br />Foundation</h2>
            <div className="relative">
              <div className="absolute -left-6 top-0 w-1 h-full bg-brand-primary/30"></div>
              <blockquote className="text-sm md:text-base font-sans leading-relaxed text-brand-bg/90 break-keep">
                "저는 정답을 제시하기 위해 이 자리에 있는 것이 아닙니다.<br />
                당신이 가장 중요한 결정을 내려야 하는 순간,<br />
                결코 혼자 고민하지 않도록 함께 합니다.<br /><br />
                당신의 'Thinking Partner'로서, 당신만의 방식으로<br />
                더 나은 선택을 할 수 있는 명확한 시야를 찾도록 돕습니다."
              </blockquote>
            </div>
          </motion.div>

          {/* Right Column: Background & Certification */}
          <motion.div 
            className="lg:col-span-7 space-y-20"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {/* Professional Experience */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-10 font-bold">Professional Experience</h3>
              <div className="text-brand-bg/80 text-sm md:text-base font-sans leading-relaxed border-l-2 border-brand-primary pl-8">
                <p className="font-bold mb-4">인사이트, 브랜드, 전략, 리더십에 기반한 23년의 단단한 전문 경력</p>
                <p className="mb-4">
                  생명과학, 소비재, 의료, 식음료 등 각 산업 분야의 외국계 기업들을 거치며 비즈니스의 본질을<br />
                  마주하고 실효성 있는 해법을 도출해 왔습니다. 그 과정에서 글로벌 기업의 Internal Advisor<br />
                  임원으로서 조직의 핵심 의사결정을 지원하며 전략적 실행력을 확립했습니다.
                </p>
                <p>
                  지금은 Independent Thinking Partner로서 복잡함 속에 갇힌 개인과 조직에게<br />
                  선명한 질서를 함께 만들어가고 있습니다. 모호한 상황을 확신 있는 의사결정과<br />
                  정교한 실행 체계로 전환하는 것, 그것이 Thinking Partner가 추구하는 핵심 가치입니다.
                </p>
              </div>
            </div>

            {/* Core Certification */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-10 font-bold">Professional Certification</h3>
              <div className="space-y-6">
                {coreCertification.map((cert, idx) => (
                  <div key={idx} className="group">
                    <div className={`flex justify-between items-start ${cert.description ? 'mb-2' : ''}`}>
                      <h4 className="text-sm font-sans font-semibold text-brand-bg/90">{cert.title}</h4>
                      {cert.organization && (
                        <span className="text-xs uppercase tracking-widest opacity-40 shrink-0 ml-4">{cert.organization}</span>
                      )}
                    </div>
                    {cert.description && (
                      <p className="text-brand-bg/50 text-sm leading-relaxed border-l border-brand-primary/20 pl-6 mt-4">
                        {cert.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Background */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-10 font-bold">Academic Background</h3>
              <div className="space-y-6">
                {academicBackground.map((edu, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-sans font-semibold text-brand-bg/90">{edu.title}</h4>
                      <span className="text-xs uppercase tracking-widest text-white font-bold shrink-0 ml-4">{edu.organization}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Training */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-10 font-bold">Professional Training</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-sans font-semibold text-brand-bg/90">Situational Leadership® II (SLII®): The Ken Blanchard Companies</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-sans font-semibold text-brand-bg/90">The Speed of Trust®: FranklinCovey</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-sans font-semibold text-brand-bg/90">Prosci® Change Management: Prosci Inc.</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-sans font-semibold text-brand-bg/90">Leadership Essentials, Coaching Leadership, and more</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const AVAILABLE_PROGRAMS = [
  "성과 & 의사 결정 (Performance & Decision Alignment)",
  "조직 & 대인 관계 (Team Dynamics & Alignment)",
  "커뮤니케이션 (Impactful Communication)",
  "멘탈 & 자기 관리 (Inner Order & Mental Resilience)",
  "리더십 & 커리어 (Leadership & Career)",
  "1:1 Coaching",
  "기타"
];

const Contact = ({ initialProgram = '' }: { initialProgram?: string }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(() => {
    if (!initialProgram) return [];
    const matched = AVAILABLE_PROGRAMS.find(p => 
      p === initialProgram || p.startsWith(initialProgram) || p.includes(initialProgram)
    );
    return matched ? [matched] : [];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [programError, setProgramError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProgram) {
      const matched = AVAILABLE_PROGRAMS.find(p => 
        p === initialProgram || p.startsWith(initialProgram) || p.includes(initialProgram)
      );
      const toAdd = matched || initialProgram;
      setSelectedPrograms([toAdd]);
      setProgramError(false);
    } else {
      setSelectedPrograms([]);
    }
  }, [initialProgram]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProgram = (program: string) => {
    setSelectedPrograms(prev => {
      const next = prev.includes(program) 
        ? prev.filter(p => p !== program) 
        : [...prev, program];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // GA4 이벤트 전송: 최종 신청 완료 (contact_submit)
    trackContactSubmit('최종 신청하기', 'contact_form');

    const applicantName = formData.name.trim() || '신청자';
    const finalPrograms = selectedPrograms;
    const programsText = finalPrograms.join(', ');

    setStatus('sending');

    // 2. 폼 입력값 보관 후 초기화
    const submissionData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      program: programsText || '30분 무료 세션 (프로그램 미지정)',
      programs: finalPrograms,
      subject: programsText 
        ? `Thinking Journey Inquiry: ${programsText}`
        : 'Thinking Journey Inquiry: 30분 무료 세션 신청',
      message: formData.message,
      createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0)
    };

    setFormData({ name: '', phone: '', email: '', message: '' });

    // 3. 백그라운드에서 안전하게 데이터베이스(Firestore)에 저장
    try {
      await addDoc(collection(db, 'messages'), submissionData);
      setStatus('idle');
    } catch (err) {
      console.warn('DB submission backup notice:', err);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-brand-bg/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div 
          className="bg-white rounded-[40px] md:rounded-[60px] p-6 sm:p-8 md:p-12 lg:p-20 shadow-2xl shadow-black/5 grid lg:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-12 lg:gap-y-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="lg:col-span-1">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] font-sans text-brand-ink/50 mb-4">Complexity to clear next steps.</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold mb-8 sm:mb-12 tracking-tight leading-tight">
              Start Your <br />
              <span className="inline-block ml-4 sm:ml-8 md:ml-12">Thinking Journey</span>
            </h2>
          </div>

          <div className="hidden lg:block"></div>

          <div className="lg:col-span-1">
            <div className="text-base sm:text-lg md:text-xl font-sans text-brand-ink/70 leading-relaxed mb-8 sm:mb-12 space-y-1">
              <p>막연한 고민이 선명한 액션 플랜이 되는 시간.</p>
              <p>당신의 사고 파트너와 함께</p>
              <p>새로운 변화를 설계해 보세요.</p>
            </div>

            <div className="space-y-6">
              <a href="mailto:Contact@partnerinthinking.com" className="flex items-center gap-3 sm:gap-5 group w-full overflow-hidden">
                <div className="shrink-0 w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center group-hover:bg-brand-primary/10 transition-all duration-300">
                  <Mail size={20} className="text-brand-primary" />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-sans text-brand-ink/80 group-hover:text-brand-primary transition-colors break-all">
                  Contact@partnerinthinking.com
                </span>
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1st Row: 이름 & 연락처 (한 줄에 2열) */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-brand-ink/80 ml-1">이름</label>
                <input 
                  required
                  type="text" 
                  placeholder="성함을 입력해 주세요"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-brand-ink/30" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-brand-ink/80 ml-1">연락처</label>
                <input 
                  required
                  type="tel" 
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-brand-ink/30" 
                />
              </div>
            </div>

            {/* 2nd Row: 이메일 (다음 줄에 단독 배치) */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-ink/80 ml-1">이메일</label>
              <input 
                required
                type="email" 
                placeholder="답변 및 일정 안내를 받으실 이메일 주소"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-brand-ink/30" 
              />
            </div>
            
            <div className="space-y-3" ref={dropdownRef}>
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-brand-ink/80">관심 프로그램</label>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(prev => !prev)}
                  className={`w-full bg-brand-bg text-left rounded-2xl px-6 py-4 outline-none transition-all flex items-center justify-between cursor-pointer min-h-[58px] ${
                    programError 
                      ? 'ring-2 ring-red-400 bg-red-50/30' 
                      : isDropdownOpen 
                        ? 'ring-2 ring-brand-primary' 
                        : 'focus:ring-2 focus:ring-brand-primary'
                  }`}
                  aria-expanded={isDropdownOpen}
                >
                  <div className="flex-1 pr-3 overflow-hidden">
                    {selectedPrograms.length === 0 ? (
                      <span className="text-brand-ink/40 text-sm sm:text-base select-none">
                        관심 있는 프로그램을 선택해 주세요 (중복 선택 가능)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 py-0.5">
                        {selectedPrograms.map(p => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-primary text-white shadow-sm"
                          >
                            <span>{p}</span>
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProgram(p);
                              }}
                              className="hover:opacity-75 focus:outline-none cursor-pointer"
                              aria-label={`${p} 선택 해제`}
                            >
                              <X size={12} />
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`shrink-0 text-brand-ink/40 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-brand-primary' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-brand-ink/10 p-2 space-y-1 max-h-72 overflow-y-auto"
                    >
                      <div className="px-3 py-2 text-xs font-medium text-brand-ink/60 border-b border-brand-ink/5">
                        관심 있는 프로그램을 선택해 주세요 (중복 선택 가능)
                      </div>
                      <div className="pt-1 space-y-0.5">
                        {AVAILABLE_PROGRAMS.map(program => {
                          const isSelected = selectedPrograms.includes(program);
                          return (
                            <button
                              key={program}
                              type="button"
                              onClick={() => toggleProgram(program)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${
                                isSelected 
                                  ? 'bg-brand-primary/10 text-brand-primary font-semibold' 
                                  : 'text-brand-ink/80 hover:bg-brand-bg/80'
                              }`}
                            >
                              <span>{program}</span>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                isSelected 
                                  ? 'bg-brand-primary border-brand-primary text-white' 
                                  : 'border-brand-ink/20 bg-white'
                              }`}>
                                {isSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {programError && (
                <p className="text-xs text-red-500 ml-1">관심 있는 프로그램을 하나 이상 선택해 주세요.</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-ink/80 ml-1">메시지</label>
              <textarea 
                required
                rows={4}
                placeholder="함께 생각해 보고 싶은 주제나 고민을 적어주시면 30분 무료 세션을 진행해 드립니다."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-brand-bg border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none placeholder:text-brand-ink/30" 
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={status === 'sending'}
              onClick={() => {
                trackContactSubmit('최종 신청하기', 'contact_form');
              }}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl text-lg sm:text-xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-brand-primary/20 disabled:opacity-50 cursor-pointer"
            >
              {status === 'sending' ? '전송 중...' : '사고 파트너와 1:1 30분 무료 세션 신청하기'}
            </button>
            
            <p className="text-center text-xs text-brand-ink/50 mt-3 flex items-center justify-center gap-1.5">
              <Shield size={13} className="text-[#ab8040] shrink-0" />
              <span>작성해 주신 모든 대화 주제와 개인정보는 비밀보장 원칙에 따라 철저히 보호됩니다.</span>
            </p>
            
            {status === 'error' && (
              <p className="text-center text-red-500 font-medium">오류가 발생했습니다. 다시 시도해 주세요.</p>
            )}
          </form>
        </motion.div>
      </div>

          </section>
  );
};

// --- Admin Dashboard (Contact Submissions) ---
const AdminDashboard = ({ messages, onLogout }: { messages: ContactMessage[], onLogout: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free_session' | 'other'>('all');
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Format timestamp helper
  const formatTimestamp = (createdAt: any) => {
    if (!createdAt) return '접수일시 미상';
    try {
      if (typeof createdAt?.toDate === 'function') {
        return format(createdAt.toDate(), 'yyyy. MM. dd HH:mm');
      }
      if (createdAt?.seconds) {
        return format(new Date(createdAt.seconds * 1000), 'yyyy. MM. dd HH:mm');
      }
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) {
        return format(d, 'yyyy. MM. dd HH:mm');
      }
      return String(createdAt);
    } catch {
      return '접수일시 미상';
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage(`${label}이(가) 클립보드에 복사되었습니다.`);
    }).catch(() => {
      setToastMessage(`복사 실패: 직접 복사해 주세요.`);
    });
  };

  // Delete message handler without window.confirm (works inside iframes)
  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteDoc(doc(db, 'messages', deleteTarget.id));
      setToastMessage(`'${deleteTarget.name}' 님의 신청 내역이 삭제되었습니다.`);
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setErrorMessage(`삭제 실패: ${err?.message || '권한이 없거나 네트워크 오류가 발생했습니다.'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Statistics
  const freeSessionCount = messages.filter(m => (m.subject || '').includes('무료 세션')).length;
  const otherCount = messages.length - freeSessionCount;

  // Filter & Search
  const filteredMessages = messages.filter(msg => {
    const isFree = (msg.subject || '').includes('무료 세션');
    if (filterType === 'free_session' && !isFree) return false;
    if (filterType === 'other' && isFree) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = (msg.name || '').toLowerCase().includes(term);
    const emailMatch = (msg.email || '').toLowerCase().includes(term);
    const phoneMatch = (msg.phone || '').toLowerCase().includes(term);
    const subjectMatch = (msg.subject || '').toLowerCase().includes(term);
    const contentMatch = (msg.message || '').toLowerCase().includes(term);
    return nameMatch || emailMatch || phoneMatch || subjectMatch || contentMatch;
  });

  return (
    <div id="admin" className="min-h-screen bg-[#F8F6F2] text-stone-900 py-16 px-4 sm:px-6 lg:px-8 border-t-4 border-brand-primary">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium border border-stone-700"
          >
            <CheckCircle size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (In-App dialog, no window.confirm) */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 border border-stone-200"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">신청 내역 삭제 확인</h3>
                  <p className="text-sm text-stone-500 mt-1">삭제된 내역은 영구적으로 제거되며 복구할 수 없습니다.</p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 mb-5 text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-medium">신청자:</span>
                  <span className="font-bold text-stone-900 text-base">{deleteTarget.name} 님</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-medium">신청 프로그램:</span>
                  <span className="font-semibold text-brand-primary">{deleteTarget.subject || '30분 무료 세션 신청'}</span>
                </div>
                {deleteTarget.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">연락처:</span>
                    <span className="font-mono text-stone-900 font-semibold">{deleteTarget.phone}</span>
                  </div>
                )}
                {deleteTarget.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">이메일:</span>
                    <span className="text-stone-900">{deleteTarget.email}</span>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setDeleteTarget(null);
                    setErrorMessage(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>삭제 중...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>삭제 확정</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  ADMIN ONLY
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  실시간 연동 중
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                신청 및 고객 문의 관리
              </h1>
              <p className="text-sm text-stone-600 mt-1.5 font-sans leading-relaxed">
                웹사이트를 통해 고객이 신청한 30분 무료 세션 및 프로그램 문의 내역을 실시간으로 확인하고 관리합니다.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-stone-200"
              >
                <LogOut size={16} />
                <span>관리자 로그아웃</span>
              </button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">전체 접수 내역</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-serif font-bold text-stone-900">{messages.length}</span>
                <span className="text-xs font-medium text-stone-500">건</span>
              </div>
            </div>

            <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-100">
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">30분 무료 세션 신청</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-serif font-bold text-brand-primary">{freeSessionCount}</span>
                <span className="text-xs font-medium text-rose-700">건</span>
              </div>
            </div>

            <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">기타 프로그램 / 문의</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-serif font-bold text-blue-900">{otherCount}</span>
                <span className="text-xs font-medium text-blue-700">건</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              전체 ({messages.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('free_session')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'free_session'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              30분 무료 세션 ({freeSessionCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('other')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'other'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              기타 문의 ({otherCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="이름, 연락처, 이메일, 내용 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Submissions List */}
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-1">
              {messages.length === 0 ? '현재 접수된 신청 내역이 없습니다.' : '일치하는 검색 결과가 없습니다.'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
              {messages.length === 0
                ? '고객이 웹사이트에서 30분 무료 세션을 신청하면 여기에 실시간으로 표시됩니다.'
                : '검색어를 변경하거나 필터를 초기화해 보세요.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-4 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                검색어 초기화
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredMessages.map((msg) => {
              const formattedDate = formatTimestamp(msg.createdAt);
              const isFreeSession = (msg.subject || '').includes('무료 세션');

              return (
                <div
                  key={msg.id}
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  {/* Left accent strip for free session */}
                  {isFreeSession && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-primary" />
                  )}

                  {/* Top Bar: Badge, Date, Delete Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isFreeSession
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : 'bg-stone-100 text-stone-800 border border-stone-200'
                        }`}
                      >
                        {msg.subject || '30분 무료 세션 신청'}
                      </span>
                      <span className="text-xs text-stone-600 font-semibold flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-200/80 font-mono">
                        <Clock size={13} className="text-stone-500" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(msg)}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                        title="신청 내역 삭제"
                      >
                        <Trash2 size={14} />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>

                  {/* Applicant Details */}
                  <div className="pt-4 space-y-4">
                    {/* Name */}
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                        <span>{msg.name}</span>
                        <span className="text-xs font-sans font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          신청자
                        </span>
                      </h3>
                    </div>

                    {/* Contact Information Box (High Contrast) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-50 rounded-xl p-4 border border-stone-200/80">
                      {/* Phone */}
                      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-stone-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Phone size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">연락처</p>
                            <p className="text-sm sm:text-base font-mono font-bold text-stone-900 truncate">
                              {msg.phone || '미기재'}
                            </p>
                          </div>
                        </div>

                        {msg.phone && (
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={`tel:${msg.phone}`}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-md transition-colors border border-emerald-100"
                            >
                              통화
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.phone || '', '전화번호')}
                              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                              title="전화번호 복사"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-stone-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                            <Mail size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">이메일</p>
                            <p className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                              {msg.email || '미기재'}
                            </p>
                          </div>
                        </div>

                        {msg.email && (
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={`mailto:${msg.email}`}
                              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md transition-colors border border-indigo-100"
                            >
                              메일 작성
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.email || '', '이메일')}
                              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
                              title="이메일 복사"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Body */}
                    {msg.message && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare size={13} className="text-stone-500" />
                          <span>신청 사유 및 문의 메시지</span>
                        </span>
                        <div className="bg-stone-50/80 p-4 sm:p-5 rounded-xl border border-stone-200 text-sm sm:text-base leading-relaxed text-stone-800 whitespace-pre-wrap font-sans">
                          {msg.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProgramDetail, setActiveProgramDetail] = useState<string | null>(null);
  const [selectedContactProgram, setSelectedContactProgram] = useState<string>('');

  const handleSelectProgramDetail = (slug: string) => {
    setActiveProgramDetail(slug);
    if (!window.history.state || window.history.state.programSlug !== slug) {
      window.history.pushState({ isDetail: true, programSlug: slug }, '', `#program-detail-${slug}`);
    }
  };

  const handleCloseProgramDetail = () => {
    setActiveProgramDetail(null);
    if (window.history.state?.isDetail) {
      window.history.back();
    }
  };

  const handleNavigateSection = (sectionId: string, preselectedProgram?: string) => {
    if (activeProgramDetail) {
      setActiveProgramDetail(null);
      if (window.history.state?.isDetail) {
        window.history.back();
      }
    }
    setSelectedContactProgram(preselectedProgram || '');
    
    setTimeout(() => {
      // Find element and scroll
      // If it's a hash link like '#home', direct scroll. Otherwise strip '#'
      const targetId = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
      const element = document.querySelector(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 150);
  };

  // Sync deep link on initialization or tab refresh/navigation & popstate
  useEffect(() => {
    const checkHashOnLoad = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#program-detail-')) {
        const slug = hash.replace('#program-detail-', '');
        setActiveProgramDetail(slug);
        if (!window.history.state || window.history.state.programSlug !== slug) {
          window.history.replaceState({ isDetail: true, programSlug: slug }, '', hash);
        }
      }
    };

    checkHashOnLoad();

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.isDetail) {
        setActiveProgramDetail(event.state.programSlug || null);
      } else {
        setActiveProgramDetail(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdmin = user?.email === 'wonyoung.park@gmail.com';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    const qPosts = query(collection(db, 'posts'), orderBy('publishedAt', 'asc'), limit(6));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });

    const qCreds = query(collection(db, 'credentials'), orderBy('order', 'asc'));
    const unsubscribeCreds = onSnapshot(qCreds, (snapshot) => {
      setCredentials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Credential)));
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
      unsubscribeCreds();
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setMessages([]);
      return;
    }

    const qMessages = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage)));
    }, (error) => {
      console.error("Firestore messages listener error:", error);
    });

    return () => unsubscribeMessages();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative">
        {!activeProgramDetail && (
          <Navbar 
            isAdmin={isAdmin} 
            user={user} 
            onLogin={login} 
            onLogout={logout} 
            onNavigateSection={handleNavigateSection} 
          />
        )}
        
        {activeProgramDetail ? (
          <ProgramDetailPage 
            initialProgramId={activeProgramDetail} 
            onClose={handleCloseProgramDetail} 
            onNavigateSection={handleNavigateSection} 
          />
        ) : (
          <main>
            <Hero onNavigateContact={() => handleNavigateSection('#contact')} />
            <About />
            <Credentials credentials={credentials} />
            <Program 
              onSelectProgramDetail={handleSelectProgramDetail} 
              onNavigateContact={(title) => handleNavigateSection('#contact', title)}
            />
            <Insights posts={posts.length > 0 ? posts : (SEED_POSTS as Post[]).slice(0, 6)} />
            <Contact key={selectedContactProgram} initialProgram={selectedContactProgram} />
          </main>
        )}

        {isAdmin && <AdminDashboard messages={messages} onLogout={logout} />}

        <footer className="py-12 bg-brand-bg border-t border-brand-ink/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-sm font-display font-semibold tracking-widest uppercase">
              Partner <span className="text-brand-primary">in</span> Thinking
            </div>
            <div className="flex gap-8">
              <a href="https://blog.naver.com/yourthinkingpartner" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100">Naver Blog</a>
              {!user && (
                <button onClick={login} className="text-xs uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity">Admin</button>
              )}
            </div>
            <p className="text-xs opacity-40">© 2026 Partner in Thinking. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
