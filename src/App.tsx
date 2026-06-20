/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, ArrowRight, Mail, Linkedin, ExternalLink, 
  Plus, Edit2, Trash2, LogIn, LogOut, ChevronRight, ChevronDown,
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
    title: "Certified TKI® (Thomas-Kilmann Conflict Mode Instrument)", 
    organization: "Certified", 
    year: "Certified", 
    order: 4,
    description: "갈등 상황에서 반복되는 사고와 감정의 패턴을 분석하여 효과적인 대응 전략을 수립합니다."
  },
  { 
    title: "Certified FIRO-B® (Fundamental Interpersonal Relations Orientation – Behavior)", 
    organization: "Certified", 
    year: "Certified", 
    order: 5,
    description: "관계 속에서 형성된 사고 구조와 대인 관계 욕구를 파악하여 조직 내 협업과 소통을 개선합니다."
  },
  { 
    title: "Certified Problem Solving Process Advanced Practitioner", 
    organization: "Strategic Methodology", 
    year: "Certified", 
    order: 6,
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
    { name: 'Contact', href: '#contact' },
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
          <div className="hidden md:flex items-center gap-8">
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
        
        <div className="mb-10 pl-4 border-l-2 border-brand-primary/20">
          <p className="text-xl md:text-2xl font-serif text-[#b58b4c] italic tracking-tight leading-relaxed break-keep">
            “온전히 나눌 수 없어 홀로 내린 결정들, <br className="hidden sm:inline" />
            얼마나 확신하고 계시나요?”
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
            className="bg-brand-primary text-white px-10 py-4 rounded-full flex items-center gap-3 hover:opacity-90 transition-all duration-300 text-lg font-medium shadow-lg shadow-brand-primary/20"
          >
            Start a Conversation <ArrowRight size={20} />
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

const Program = ({ onSelectProgramDetail }: { onSelectProgramDetail: (slug: string) => void }) => {
  const categories = [
    {
      id: "clarity",
      title: "Complexity to Actionable Clarity",
      subtitle: "복잡하게 얽힌 생각의 파편을 구조화해,\n사안의 본질을 분명히 하고 실행 가능한 선택으로 이동하는 사고 프로그램 라인입니다.",
      programs: [
        {
          title: "Focus & Alignment",
          summary: "에너지가 분산된 상태에서, \n무엇에 집중해야 할지 다시 정렬하는 사고 작업",
          description: "해야 할 일은 많지만, 어디에 에너지를 써야 할지 흐려질 때가 있습니다. Focus & Alignment는 현재의 선택과 우선순위를 점검하고, 지금 가장 중요한 과제에 에너지를 다시 정렬하는 사고 중심 프로그램입니다.",
          image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1000&auto=format&fit=crop",
          sessionsCount: "1:1 (3~5회)",
          totalDuration: "3~5시간"
        },
        {
          title: "Critical Problem Framing",
          summary: "해결보다 앞서,\n문제의 정의 자체를 다시 세우는 사고 작업",
          description: "문제를 해결하려 애쓰고 있지만, 정작 무엇이 문제인지가 명확하지 않을 때가 있습니다. Critical Problem Framing은 현재 해결해야 할 핵심 문제를 다시 정의하고, 복잡한 상황 속에서도 실질적인 출발점을 세우는 사고 프로그램입니다.",
          image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=1000&auto=format&fit=crop",
          sessionsCount: "1:1 (4~6회)",
          totalDuration: "4~6시간"
        }
      ]
    },
    {
      id: "balance",
      title: "Inner Order & Balance",
      subtitle: "누적된 감정과 반복되는 내적 충돌을 객관적으로 정리해,\n사고 상태의 균형을 회복하고 실행을 가로막는 심리적 장벽을 살펴보는 프로그램 라인입니다.",
      programs: [
        {
          title: "Think Through Conflict",
          summary: "갈등 상황에서 반복되는\n사고와 감정의 패턴을 짚어내고 구조화하는 프로그램",
          description: "갈등 상황에서는 사고가 빠르게 단순화되고, 우리는 익숙한 반응을 반복하게 됩니다. 이 프로그램은 갈등의 순간에 내가 자동적으로 선택해온 사고 반응을 살펴보고, 그 패턴이 지금의 나에게도 유효한지를 점검하는 사고 중심 프로그램입니다.\n(TKI 기반)",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
          sessionsCount: "1:1 (4~6회)",
          totalDuration: "4~6시간"
        },
        {
          title: "Relational Dynamics & Alignment",
          summary: "관계 속에 형성된 사고 구조를 \n파악하는 프로그램",
          description: "Relational Dynamics & Alignment는 관계를 더 잘 맺기 위한 프로그램이 아닙니다. 이 프로그램은 관계 속에서 반복되어 온 나의 사고 구조와 선택을 살펴보고, 그 구조가 현재의 역할과 삶에도 여전히 적절한지를 점검하는 사고 파트너십입니다.\n(FIRO-B 기반)",
          image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
          sessionsCount: "1:1 (3~6회)",
          totalDuration: "3~6시간"
        }
      ]
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
            <span className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-6 block font-bold">Tailored Solutions</span>
            <h2 className="text-4xl md:text-6xl font-serif italic text-brand-ink mb-12">Programs</h2>
            
            <div className="max-w-3xl space-y-4 text-brand-ink/80 text-lg leading-relaxed break-keep">
              <p>지금 해결해야 할 문제가 무엇을 할지가 불분명한 상태라면 <br className="hidden md:block" />
              <span className="font-bold text-brand-ink">Complexity to Actionable Clarity</span>에서 시작하는 것이 적합합니다.</p>
              <p>문제는 비교적 명확하지만, 반복되는 관계의 마찰이나 내적 충돌이 있다면 <br className="hidden md:block" />
              <span className="font-bold text-brand-ink">Inner Order & Balance</span>가 출발점이 됩니다.</p>
              <p>이후 코칭 세션으로 Action Plan과 실행을 이어갈 수 있습니다.</p>
              
              <div className="mt-8 pt-6 border-t border-brand-ink/10">
                <p className="text-sm md:text-base text-[#b58b4c] font-medium leading-relaxed flex items-start gap-2 break-keep">
                  <span className="inline-block mt-1.5 w-1.5 h-1.5 rounded-full bg-[#b58b4c] shrink-0" />
                  <span>
                    아래 소개된 모든 프로그램 및 회차별 커리큘럼은 설계 예시(Sample)이며, 실제 코칭 세션은 고객이 직면한 구체적인 비즈니스 맥락과 개발 영역에 맞추어 완전히 1:1로 맞춤 설계(Tailored)되어 진행됩니다.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="space-y-32">
          {categories.map((category, catIdx) => (
            <div key={category.id} className="space-y-12">
              {/* Category Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="border-l-2 border-brand-ink pl-6"
              >
                <h3 className="text-2xl md:text-3xl font-sans font-bold text-brand-ink mb-2 tracking-tight">{category.title}</h3>
                <p className="text-brand-ink/70 text-lg whitespace-pre-line leading-relaxed break-keep">
                  {category.subtitle}
                </p>
              </motion.div>

              {/* Sub-Programs */}
              <div className="space-y-20 pl-6 md:pl-12">
                {category.programs.map((prog, progIdx) => (
                  <motion.div
                    key={progIdx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: progIdx * 0.1 }}
                    className="grid md:grid-cols-12 gap-8 md:gap-12 items-start"
                  >
                    {/* Left: Image */}
                    <div className="md:col-span-3 lg:col-span-2">
                      <div className="aspect-square overflow-hidden rounded-2xl shadow-sm border border-brand-ink/5">
                        <img 
                          src={prog.image} 
                          alt={prog.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    {/* Right: Content Area */}
                    <div className="md:col-span-9 lg:col-span-10">
                      {/* Title */}
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h4 className="text-xl font-bold text-brand-ink">
                          {prog.title}
                        </h4>
                      </div>
                      
                      {/* Divider Line */}
                      <div className="w-full h-px bg-brand-ink/10 mb-4"></div>
                      
                      {/* Summary & Description Grid */}
                      <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                        {/* Summary (Left side of the content) */}
                        <div className="space-y-2">
                          <p className="text-brand-ink/80 font-medium leading-snug break-keep whitespace-pre-line">
                            {prog.summary}
                          </p>
                        </div>
                        
                        {/* Description (Right side of the content) */}
                        <div className="flex flex-col h-full">
                          <p className="text-brand-ink/60 text-sm leading-relaxed break-keep whitespace-pre-line mb-6">
                            {prog.description}
                          </p>
                          <div className="mt-auto flex justify-end">
                            <button 
                              onClick={() => {
                                const title = prog.title;
                                let slug = "focus-alignment";
                                if (title === "Focus & Alignment") slug = "focus-alignment";
                                else if (title === "Critical Problem Framing") slug = "critical-framing";
                                else if (title === "Think Through Conflict") slug = "thinking-conflict";
                                else if (title === "Relational Dynamics & Alignment") slug = "relational-dynamics";
                                onSelectProgramDetail(slug);
                              }}
                              className="inline-block bg-brand-ink/80 hover:bg-[#5A5A40] text-white px-6 py-2.5 text-sm font-bold transition-colors rounded-sm cursor-pointer"
                            >
                              프로그램 상세 및 신청
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-32 pt-16 border-t border-brand-ink/10 space-y-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-brand-ink/60 text-base"
          >
            이외의 주제나 복합적인 고민에 대해서는 <a href="#contact" className="text-brand-primary font-bold hover:underline">Contact</a>를 통해 개별 문의해 주세요.
          </motion.div>

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

const Contact = ({ initialProgram = '' }: { initialProgram?: string }) => {
  const [formData, setFormData] = useState({ name: '', email: '', program: initialProgram, message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // Save to database as backup
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0)
      });

      // Construct mailto URL
      const subject = encodeURIComponent(`Thinking Journey Inquiry: ${formData.program}`);
      const body = encodeURIComponent(`이름: ${formData.name}\n이메일: ${formData.email}\n프로그램: ${formData.program}\n\n메시지:\n${formData.message}`);
      const mailtoUrl = `mailto:Contact@partnerinthinking.com?subject=${subject}&body=${body}`;
      
      // Open mail client
      window.location.href = mailtoUrl;

      setStatus('success');
      setFormData({ name: '', email: '', program: '', message: '' });
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
          className="bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-12 lg:p-20 shadow-2xl shadow-black/5 grid lg:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-12 lg:gap-y-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="lg:col-span-1">
            <p className="text-xs md:text-sm uppercase tracking-[0.3em] font-sans text-brand-ink/50 mb-4">Complexity to clear next steps.</p>
            <h2 className="text-3xl md:text-4xl font-serif italic font-bold mb-12 tracking-tight leading-tight">
              Start Your <br />
              <span className="inline-block ml-8 md:ml-12">Thinking Journey</span>
            </h2>
          </div>

          <div className="hidden lg:block"></div>

          <div className="lg:col-span-1">
            <div className="text-lg md:text-xl font-sans text-brand-ink/70 leading-relaxed mb-12 space-y-1">
              <p>막연한 고민이 선명한 액션 플랜이 되는 시간.</p>
              <p>당신의 사고 파트너와 함께</p>
              <p>새로운 변화를 설계해 보세요.</p>
            </div>

            <div className="space-y-6">
              <a href="mailto:Contact@partnerinthinking.com" className="flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center group-hover:bg-brand-primary/10 transition-all duration-300">
                  <Mail size={20} className="text-brand-primary" />
                </div>
                <span className="text-lg font-sans text-brand-ink/80 group-hover:text-brand-primary transition-colors">
                  Contact@partnerinthinking.com
                </span>
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-brand-ink/80 ml-1">이름</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-brand-ink/80 ml-1">이메일</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-ink/80 ml-1">프로그램</label>
              <div className="relative">
                <select 
                  required
                  value={formData.program}
                  onChange={e => setFormData({...formData, program: e.target.value})}
                  className="w-full bg-brand-bg border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all appearance-none cursor-pointer" 
                >
                  <option value="" disabled>프로그램을 선택해주세요</option>
                  <option value="Focus & Alignment">Focus & Alignment</option>
                  <option value="Critical Problem Framing">Critical Problem Framing</option>
                  <option value="Think Through Conflict">Think Through Conflict</option>
                  <option value="Relational Dynamics & Alignment">Relational Dynamics & Alignment</option>
                  <option value="Thinking Your Core Value">Thinking Your Core Value</option>
                  <option value="Thinking Organizational Politics">Thinking Organizational Politics</option>
                  <option value="1:1 Coaching">1:1 Coaching</option>
                  <option value="기타">기타</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand-ink/30">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-ink/80 ml-1">메시지</label>
              <textarea 
                required
                rows={4}
                placeholder="함께 생각해 보고 싶은 이슈나 프로그램 관련해서 궁금한 내용을 간단히 적어주세요."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-brand-bg border-none rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none placeholder:text-brand-ink/30" 
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl text-xl font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {status === 'sending' ? '전송 중...' : '함께 생각 정리하기'}
            </button>
            
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

  const handleNavigateSection = (sectionId: string, preselectedProgram?: string) => {
    setActiveProgramDetail(null);
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
        <Navbar 
          isAdmin={isAdmin} 
          user={user} 
          onLogin={login} 
          onLogout={logout} 
          onNavigateSection={handleNavigateSection} 
        />
        
        {activeProgramDetail ? (
          <ProgramDetailPage 
            initialProgramId={activeProgramDetail} 
            onClose={() => setActiveProgramDetail(null)} 
            onNavigateSection={handleNavigateSection} 
          />
        ) : (
          <main>
            <Hero />
            <About />
            <Credentials credentials={credentials} />
            <Program onSelectProgramDetail={setActiveProgramDetail} />
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
