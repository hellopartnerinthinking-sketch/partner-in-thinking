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
  Layout, Target, Scale, Shield, Brain
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
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="ml-1 bg-brand-primary hover:opacity-90 text-white text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 shadow-sm shadow-brand-primary/20 flex items-center gap-1.5"
            >
              <span>30분 무료 코칭</span>
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
                  setIsOpen(false);
                  handleLinkClick(e, '#contact');
                }}
                className="mt-2 bg-brand-primary text-white text-center py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                <span>30분 무료 코칭</span>
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

const Hero = () => (
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
        className="flex flex-col items-end lg:pt-52"
      >
        <div className="w-full max-w-lg mb-8">
          <img 
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80" 
            alt="Sunlight streaming through a lush green forest path" 
            className="w-full aspect-[16/10] object-cover rounded-[40px] shadow-2xl shadow-black/10"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="text-right font-serif italic text-brand-ink/70 text-lg md:text-xl leading-relaxed max-w-sm">
          <p>When the moment truly matters</p>
          <p>You don't have to lead by yourself.</p>
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
                30분 무료 코칭을 통해 생각의 정돈과 방향성을 함께 탐색해 보세요.
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
            30분 무료 코칭을 통해 함께 방향성을 찾아드립니다.
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
    return [matched || initialProgram];
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
      if (!selectedPrograms.includes(toAdd)) {
        setSelectedPrograms(prev => [...prev, toAdd]);
        setProgramError(false);
      }
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
      if (next.length > 0) setProgramError(false);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPrograms.length === 0) {
      setProgramError(true);
      setIsDropdownOpen(true);
      return;
    }

    setStatus('sending');
    try {
      const programsText = selectedPrograms.join(', ');

      // Save to database as backup
      await addDoc(collection(db, 'messages'), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        program: programsText,
        programs: selectedPrograms,
        subject: `Thinking Journey Inquiry: ${programsText}`,
        message: formData.message,
        createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0)
      });

      // Construct mailto URL
      const subject = encodeURIComponent(`Thinking Journey Inquiry: ${programsText}`);
      const body = encodeURIComponent(`이름: ${formData.name}\n연락처: ${formData.phone}\n이메일: ${formData.email}\n관심 프로그램: ${programsText}\n\n메시지:\n${formData.message}`);
      const mailtoUrl = `mailto:Contact@partnerinthinking.com?subject=${subject}&body=${body}`;
      
      // Open mail client
      window.location.href = mailtoUrl;

      setStatus('success');
      setFormData({ name: '', phone: '', email: '', message: '' });
      setSelectedPrograms([]);
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
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
                placeholder="함께 생각해 보고 싶은 주제나 고민을 적어주시면 30분 무료 코칭을 진행해 드립니다."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-brand-bg border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none placeholder:text-brand-ink/30" 
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl text-lg sm:text-xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-brand-primary/20 disabled:opacity-50 cursor-pointer"
            >
              {status === 'sending' ? '전송 중...' : '사고 파트너와 1:1 30분 무료 세션 신청하기'}
            </button>
            
            <p className="text-center text-xs text-brand-ink/50 mt-3 flex items-center justify-center gap-1.5">
              <Shield size={13} className="text-[#ab8040] shrink-0" />
              <span>작성해 주신 모든 대화 주제와 개인정보는 비밀보장 원칙에 따라 철저히 보호됩니다.</span>
            </p>
            
            {status === 'success' && (
              <p className="text-center text-brand-primary font-medium animate-fade-in">메시지가 전송되었습니다. 곧 연락드리겠습니다.</p>
            )}
            {status === 'error' && (
              <p className="text-center text-red-500 font-medium">오류가 발생했습니다. 다시 시도해 주세요.</p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

// --- Admin CMS Components ---

const AdminDashboard = ({ posts, credentials, messages, onLogout }: { posts: Post[], credentials: Credential[], messages: ContactMessage[], onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'credentials' | 'messages'>('posts');
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [editingCred, setEditingCred] = useState<Partial<Credential> | null>(null);

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    
    const postData = {
      ...editingPost,
      publishedAt: editingPost.publishedAt || new Date().toISOString(),
      slug: editingPost.slug || editingPost.title?.toLowerCase().replace(/ /g, '-') || ''
    };

    if (editingPost.id) {
      await updateDoc(doc(db, 'posts', editingPost.id), postData);
    } else {
      await addDoc(collection(db, 'posts'), postData);
    }
    setEditingPost(null);
  };

  const handleSaveCred = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCred) return;

    if (editingCred.id) {
      await updateDoc(doc(db, 'credentials', editingCred.id), editingCred);
    } else {
      await addDoc(collection(db, 'credentials'), { ...editingCred, order: credentials.length });
    }
    setEditingCred(null);
  };

  const handleSeedData = async () => {
    if (!window.confirm("This will add sample posts and credentials. Continue?")) return;
    try {
      for (const post of SEED_POSTS) {
        await addDoc(collection(db, 'posts'), post);
      }
      for (const cred of SEED_CREDS) {
        await addDoc(collection(db, 'credentials'), cred);
      }
      alert("Data seeded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error seeding data. Check console.");
    }
  };

  return (
    <div id="admin" className="min-h-screen bg-brand-ink text-brand-bg py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <h2 className="text-4xl font-serif italic">Admin Dashboard</h2>
            <button 
              onClick={handleSeedData}
              className="text-xs bg-brand-bg/10 hover:bg-brand-bg/20 px-4 py-2 rounded-full transition-colors"
            >
              Seed Sample Data
            </button>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm uppercase tracking-widest opacity-60 hover:opacity-100">
            <LogOut size={16} /> Exit Admin
          </button>
        </div>

        <div className="flex gap-8 mb-12 border-b border-brand-bg/10">
          {(['posts', 'credentials', 'messages'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm uppercase tracking-widest font-bold transition-colors ${activeTab === tab ? 'text-brand-primary border-b-2 border-brand-primary' : 'opacity-40'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div className="space-y-8">
            <button 
              onClick={() => setEditingPost({ title: '', content: '', excerpt: '', category: 'Leadership', imageUrl: '' })}
              className="bg-brand-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
            >
              <Plus size={18} /> New Insight
            </button>

            <div className="grid gap-4">
              {posts.map(post => (
                <div key={post.id} className="bg-brand-bg/5 p-6 rounded-2xl flex justify-between items-center border border-brand-bg/10">
                  <div>
                    <h4 className="text-xl font-sans font-semibold">{post.title}</h4>
                    <p className="text-xs opacity-40 uppercase tracking-widest mt-1">{post.category} • {format(new Date(post.publishedAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setEditingPost(post)} className="p-2 hover:text-brand-primary transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => deleteDoc(doc(db, 'posts', post.id!))} className="p-2 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="space-y-8">
            <button 
              onClick={() => setEditingCred({ title: '', organization: '', year: '' })}
              className="bg-brand-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
            >
              <Plus size={18} /> Add Credential
            </button>

            <div className="grid gap-4">
              {credentials.map(cred => (
                <div key={cred.id} className="bg-brand-bg/5 p-6 rounded-2xl flex justify-between items-center border border-brand-bg/10">
                  <div>
                    <h4 className="text-xl font-sans font-semibold">{cred.title}</h4>
                    <p className="text-xs opacity-40 uppercase tracking-widest mt-1">{cred.organization} • {cred.year}</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setEditingCred(cred)} className="p-2 hover:text-brand-primary transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => deleteDoc(doc(db, 'credentials', cred.id!))} className="p-2 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {messages.length === 0 ? (
                <p className="opacity-40 italic">No messages received yet.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="bg-brand-bg/5 p-8 rounded-3xl border border-brand-bg/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-sans font-semibold mb-1">{msg.subject}</h4>
                        <p className="text-sm opacity-60">From: <span className="text-brand-primary">{msg.name}</span> ({msg.email})</p>
                      </div>
                      <button onClick={() => deleteDoc(doc(db, 'messages', msg.id!))} className="p-2 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                    <div className="bg-brand-bg/5 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                    <p className="text-[10px] uppercase tracking-widest opacity-30 mt-4">
                      Received: {msg.createdAt ? format(new Date((msg.createdAt as any).seconds * 1000), 'MMM d, yyyy HH:mm') : 'Unknown'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {editingPost && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-ink/90 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-brand-bg text-brand-ink w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] p-12"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-serif italic">{editingPost.id ? 'Edit' : 'New'} Insight</h3>
                  <button onClick={() => setEditingPost(null)}><X /></button>
                </div>
                <form onSubmit={handleSavePost} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold opacity-50">Title</label>
                      <input 
                        required
                        type="text" 
                        value={editingPost.title}
                        onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                        className="w-full bg-brand-ink/5 border-none rounded-xl px-4 py-3 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold opacity-50">Category</label>
                      <input 
                        required
                        type="text" 
                        value={editingPost.category}
                        onChange={e => setEditingPost({...editingPost, category: e.target.value})}
                        className="w-full bg-brand-ink/5 border-none rounded-xl px-4 py-3 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold opacity-50">Image URL</label>
                    <input 
                      type="text" 
                      value={editingPost.imageUrl}
                      onChange={e => setEditingPost({...editingPost, imageUrl: e.target.value})}
                      className="w-full bg-brand-ink/5 border-none rounded-xl px-4 py-3 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold opacity-50">Excerpt</label>
                    <textarea 
                      required
                      rows={2}
                      value={editingPost.excerpt}
                      onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})}
                      className="w-full bg-brand-ink/5 border-none rounded-xl px-4 py-3 outline-none resize-none" 
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold opacity-50">Content (Markdown)</label>
                    <textarea 
                      required
                      rows={10}
                      value={editingPost.content}
                      onChange={e => setEditingPost({...editingPost, content: e.target.value})}
                      className="w-full bg-brand-ink/5 border-none rounded-xl px-4 py-3 outline-none font-mono text-sm" 
                    ></textarea>
                  </div>
                  <button className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-brand-ink transition-colors">
                    Save Insight
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {editingCred && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-ink/90 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-brand-bg text-brand-ink w-full max-w-xl rounded-[40px] p-12"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl font-serif italic">{editingCred.id ? 'Edit' : 'New'} Credential</h3>
                  <button onClick={() => setEditingCred(null)}><X /></button>
                </div>
                <form onSubmit={handleSaveCred} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold opacity-50">Title</label>
                    <input 
                      required
                      type="text" 
                      value={editingCred.title}
                      onChange={e => setEditingCred({...editingCred, title: e.target.value})}
                      className="w-full bg-brand-ink/5 border-none rounded-xl px-4 py-3 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold opacity-50">Organization</label>
                    <input 
                      required
                      type="text" 
                      value={editingCred.organization}
                      onChange={e => setEditingCred({...editingCred, organization: e.target.value})}
                      className="w-full bg-brand-ink/5 border-none rounded-xl px-4 py-3 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold opacity-50">Year</label>
                    <input 
                      required
                      type="text" 
                      value={editingCred.year}
                      onChange={e => setEditingCred({...editingCred, year: e.target.value})}
                      className="w-full bg-brand-ink/5 border-none rounded-xl px-4 py-3 outline-none" 
                    />
                  </div>
                  <button className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-brand-ink transition-colors">
                    Save Credential
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
    if (preselectedProgram) {
      setSelectedContactProgram(preselectedProgram);
    }
    
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
            <Hero />
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

        {isAdmin && <AdminDashboard posts={posts} credentials={credentials} messages={messages} onLogout={logout} />}

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
