/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Layers,
  Target,
  Scale,
  Shield,
  Mail,
  Phone,
  ArrowUpRight,
  Lock,
  Download,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Filter,
  CheckCircle2,
  MessageSquare,
  Copy,
  Share2,
  ChevronDown,
  Menu,
  LogOut,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  ADMIN_EMAIL,
  isAuthorizedAdmin,
  signInAdminWithGoogle,
  signOutAdmin,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType,
} from './firebase';
import heroWorkspaceImg from './assets/images/clarity_warm_workspace_1794141435574.jpg';
import photoChoicesFocus from './assets/images/photo_choices_focus_1794305275415.jpg';
import photoDirectionNext from './assets/images/photo_direction_next_1794305323610.jpg';
import photoInnerReset from './assets/images/photo_inner_reset_1794305306834.jpg';
import photoRelationComm from './assets/images/photo_relation_comm_1794305291524.jpg';

export interface BookingRecord {
  id: string;
  createdAt: string;
  name: string;
  contact: string;
  email?: string;
  programId: string;
  programTitle: string;
  dilemma: string;
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled';
}

const formatTimestamp = (value: unknown): string => {
  const date =
    value instanceof Timestamp
      ? value.toDate()
      : value instanceof Date
      ? value
      : new Date();
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const PROGRAM_OPTIONS = [
  { id: 'decision', label: '선택 & 집중' },
  { id: 'mental', label: '내면 질서 & 번아웃' },
  { id: 'career', label: '삶의 방향 & 전환' },
  { id: 'communication', label: '관계 & 소통' },
  { id: 'unsure', label: '아직 잘 모르겠음 (대화 중 함께 정리)' },
];

const NAV_ITEMS = [
  { href: '#home', label: 'Home' },
  { href: '#programs', label: 'Programs' },
  { href: '#credentials', label: 'Credentials' },
  { href: '#stories', label: 'Stories' },
  { href: '#approach', label: 'Approach' },
  { href: '#insight', label: 'Insight' },
  { href: '#contact', label: 'Contact' },
];

interface InsightPost {
  title: string;
  url: string;
}

const INSIGHTS: InsightPost[] = [
  {
    title: '복잡해지기만 하는 생각을 어떻게 정리하면 좋을까?',
    url: 'https://blog.naver.com/yourthinkingpartner/224231589774',
  },
  {
    title: '어려운 결정을 시작하는 법',
    url: 'https://blog.naver.com/yourthinkingpartner/224246641421',
  },
  {
    title: '준비가 먼저일까, 행동이 먼저일까',
    url: 'https://blog.naver.com/yourthinkingpartner/224224977184',
  },
  {
    title: '왜 문제는 계속 복잡해지는가, 그리고 어떻게 단순하게 볼 것인가',
    url: 'https://blog.naver.com/yourthinkingpartner/224218005707',
  },
];

interface ProgramItem {
  id: string;
  title: string;
  subtitleEn: string;
  quote: string;
  description: string;
  image: string;
}

const PROGRAMS: ProgramItem[] = [
  {
    id: 'decision',
    title: '선택 & 집중',
    subtitleEn: 'Choices & Focus Alignment',
    quote: '해야 할 일은 산더미인데, 막상 무엇부터 손대야 할지 머릿속이 엉킬 때',
    description:
      '쏟아지는 과제와 복잡한 생각 속에서 진짜 중요한 단 하나의 우선순위를 짚어냅니다. 흔들리지 않는 나만의 기준으로 가장 시급한 과제에 몰입하여, 더 이상 미루지 않는 명확한 실행력을 회복합니다.',
    image: photoChoicesFocus,
  },
  {
    id: 'mental',
    title: '내면 질서 & 번아웃',
    subtitleEn: 'Inner Order & Mental Reset',
    quote: '지나친 생각과 과부하로 마음의 여유가 사라지고 번아웃이 찾아왔을 때',
    description:
      '과도한 고민과 누적된 피로로 사고가 멈출 때, 머릿속 안개를 걷어내고 내면의 질서를 회복합니다. 흩어진 마음을 정돈하여 흔들리지 않는 단단한 회복탄력성과 일상의 에너지를 되찾습니다.',
    image: photoInnerReset,
  },
  {
    id: 'career',
    title: '삶의 방향 & 전환',
    subtitleEn: 'Life Direction & Next Chapter',
    quote: '앞으로 나아가야 할 방향이 흐릿해지고, 삶의 새로운 전환점을 고민하게 될 때',
    description:
      '익숙한 자리를 넘어, 온전한 \'나\'로서의 고유한 가치와 기준을 재정의합니다. 불확실한 미래에 대한 막막함을 지우고, 주도적이고 선명한 삶의 다음 궤적을 함께 설계합니다.',
    image: photoDirectionNext,
  },
  {
    id: 'communication',
    title: '관계 & 소통',
    subtitleEn: 'Relational Dynamics & Communication',
    quote: '특정 사람과의 관계나 풀리지 않는 대화 때문에 마음이 지치고 에너지가 소모될 때',
    description:
      '얽혀 있는 관계와 반복되는 소통의 벽을 객관화합니다. 감정적인 소모를 줄이고 명확한 대화 기준을 정립하여, 나와 타인 모두를 지키는 건강한 관계의 시너지를 만듭니다.',
    image: photoRelationComm,
  },
];

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>('');
  const [formContact, setFormContact] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formDilemma, setFormDilemma] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<BookingRecord | null>(null);

  // Firebase Auth & Admin states
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const isAdmin = isAuthReady && isAuthorizedAdmin(authUser);

  // Bookings list synced from Firestore (only for authenticated admin)
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Admin filter states
  const [adminTab, setAdminTab] = useState<'bookings' | 'sns'>('bookings');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const programDropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore bookings ONLY when authenticated as the authorized admin
  useEffect(() => {
    if (!isAdmin) {
      setBookings([]);
      return;
    }

    const bookingsPath = 'bookings';
    const bookingsQuery = query(
      collection(db, bookingsPath),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const items: BookingRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            createdAt: formatTimestamp(data.createdAt),
            name: String(data.name || ''),
            contact: String(data.contact || ''),
            email: data.email ? String(data.email) : undefined,
            programId: String(data.programId || 'unsure'),
            programTitle: String(data.programTitle || ''),
            dilemma: String(data.dilemma || ''),
            status: (data.status as BookingRecord['status']) || 'pending',
          };
        });
        setBookings(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, bookingsPath);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  // Support #admin and direct section hash sublinks (e.g. /#programs) on cold load
  useEffect(() => {
    let timerId: number | undefined;
    const scrollToHash = (hash: string, smooth: boolean) => {
      if (!hash || hash.length <= 1 || hash === '#admin') return;
      const targetId = decodeURIComponent(hash.slice(1));
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      }
    };

    const handleInitialHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setIsAdminOpen(true);
        return;
      }
      if (hash && hash.length > 1) {
        requestAnimationFrame(() => scrollToHash(hash, false));
        timerId = window.setTimeout(() => scrollToHash(hash, true), 180);
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setIsAdminOpen(true);
        return;
      }
      scrollToHash(hash, true);
    };

    handleInitialHash();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      if (timerId !== undefined) window.clearTimeout(timerId);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Close dropdown, mobile menu, or active modal on Escape key
  useEffect(() => {
    if (!isModalOpen && !isAdminOpen && !isProgramDropdownOpen && !isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isProgramDropdownOpen) {
        setIsProgramDropdownOpen(false);
      } else if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      } else if (isAdminOpen) {
        setIsAdminOpen(false);
      } else if (isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isAdminOpen, isProgramDropdownOpen, isMobileMenuOpen]);

  // Lock background page scroll while a modal is open
  useEffect(() => {
    if (!isModalOpen && !isAdminOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalOpen, isAdminOpen]);

  // Close program dropdown when clicking outside
  useEffect(() => {
    if (!isProgramDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        programDropdownRef.current &&
        !programDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProgramDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProgramDropdownOpen]);

  // Close mobile menu when clicking outside header
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleOpenBooking = (programId?: string) => {
    if (programId) {
      setSelectedPrograms([programId]);
    } else {
      setSelectedPrograms([]);
    }
    setIsMobileMenuOpen(false);
    setIsProgramDropdownOpen(false);
    setFormName('');
    setFormContact('');
    setFormEmail('');
    setFormDilemma('');
    setSubmitError(null);
    setIsSubmitted(false);
    setLastBooking(null);
    setIsModalOpen(true);
  };

  const toggleProgramSelection = (id: string) => {
    setSelectedPrograms((prev) => {
      if (id === 'unsure') {
        return prev.includes('unsure') ? [] : ['unsure'];
      }
      const withoutUnsure = prev.filter((item) => item !== 'unsure');
      if (withoutUnsure.includes(id)) {
        return withoutUnsure.filter((item) => item !== id);
      }
      return [...withoutUnsure, id];
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingBooking) return;

    const cleanName = formName.trim().slice(0, 80);
    const cleanContact = formContact.trim().slice(0, 40);
    const cleanEmail = formEmail.trim().slice(0, 120);
    const cleanDilemma = formDilemma.trim().slice(0, 3000);
    if (!cleanName || !cleanContact || !cleanEmail || !cleanDilemma) return;

    const selectedLabels = selectedPrograms
      .map((id) => PROGRAM_OPTIONS.find((opt) => opt.id === id)?.label)
      .filter(Boolean);
    const progTitle = (
      selectedLabels.length > 0
        ? selectedLabels.join(', ')
        : '미정 (대화 시 맞춤 안내)'
    ).slice(0, 200);
    const progId = (selectedPrograms.join(',') || 'unsure').slice(0, 120);

    setIsSubmittingBooking(true);
    setSubmitError(null);

    const newDocRef = doc(collection(db, 'bookings'));
    const docPath = `bookings/${newDocRef.id}`;

    try {
      await setDoc(newDocRef, {
        name: cleanName,
        contact: cleanContact,
        email: cleanEmail,
        programId: progId,
        programTitle: progTitle,
        dilemma: cleanDilemma,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      const newBooking: BookingRecord = {
        id: newDocRef.id,
        createdAt: formatTimestamp(new Date()),
        name: cleanName,
        contact: cleanContact,
        email: cleanEmail,
        programId: progId,
        programTitle: progTitle,
        dilemma: cleanDilemma,
        status: 'pending',
      };

      setLastBooking(newBooking);
      setIsProgramDropdownOpen(false);
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError('신청 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      handleFirestoreError(error, OperationType.CREATE, docPath);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: BookingRecord['status']) => {
    if (!isAdmin) return;
    const docPath = `bookings/${id}`;
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!isAdmin) return;
    const docPath = `bookings/${id}`;
    try {
      await deleteDoc(doc(db, 'bookings', id));
      setConfirmDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  };

  const handleAdminSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInAdminWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('popup-closed-by-user')) {
        setAuthError('Google 로그인 중 문제가 발생했습니다. 팝업 차단 여부를 확인한 뒤 다시 시도해 주세요.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSwitchAdminAccount = async () => {
    setAuthError(null);
    await signOutAdmin();
    await handleAdminSignIn();
  };

  const handleAdminSignOut = async () => {
    setAuthError(null);
    await signOutAdmin();
  };

  const handleExportCSV = () => {
    const headers = ['접수일시', '이름', '연락처', '이메일', '관심 프로그램', '상태', '메시지'];
    const rows = bookings.map((b) => [
      `"${b.createdAt}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.contact.replace(/"/g, '""')}"`,
      `"${(b.email || '').replace(/"/g, '""')}"`,
      `"${b.programTitle.replace(/"/g, '""')}"`,
      `"${b.status === 'pending' ? '대기중' : b.status === 'contacted' ? '연락완료' : b.status === 'confirmed' ? '세션확정' : '취소'}"`,
      `"${b.dilemma.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `partner_in_thinking_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      adminStatusFilter === 'all' || b.status === adminStatusFilter;
    const matchesSearch =
      adminSearchQuery === '' ||
      b.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      b.contact.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      (b.email || '').toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      b.dilemma.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      b.programTitle.toLowerCase().includes(adminSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCopySnsSnippet = () => {
    const snippet = `<!-- OpenGraph (KakaoTalk, Facebook, Instagram, Slack, LinkedIn) -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="PARTNER IN THINKING" />
<meta property="og:title" content="Complexity to Clarity" />
<meta property="og:description" content="복잡한 세상 속, 얽힌 머릿속과 마음을 체계적으로 구조화하는 생각 파트너" />
<meta property="og:url" content="https://www.partnerinthinking.com" />
<meta property="og:image" content="https://www.partnerinthinking.com/og-image.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="982" />
<meta property="og:image:height" content="507" />
<meta property="og:locale" content="ko_KR" />

<!-- Twitter / X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Complexity to Clarity" />
<meta name="twitter:description" content="복잡한 세상 속, 얽힌 머릿속과 마음을 체계적으로 구조화하는 생각 파트너" />
<meta name="twitter:image" content="https://www.partnerinthinking.com/og-image.png" />`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#221A14] selection:bg-[#5C4533] selection:text-[#FAF6F0] antialiased">
      {/* 1. TOP BAR NAVIGATION */}
      <header ref={headerRef} className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#E8DFD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
          {/* Logo naturally blending in without artificial box/border */}
          <a
            href="#home"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-[12.5px] sm:text-base font-bold tracking-[0.1em] sm:tracking-[0.16em] uppercase text-[#221A14] hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
          >
            PARTNER <span className="font-normal text-[#8A725D]">IN</span> THINKING
          </a>

          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-[14px] lg:text-[15px] font-medium text-[#5C4A3B]">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[#221913] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => handleOpenBooking()}
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 text-[11.5px] sm:text-[13.5px] font-semibold text-[#FAF6F0] bg-[#33261C] hover:bg-[#201710] active:scale-[0.98] rounded transition-all shadow-xs whitespace-nowrap cursor-pointer"
            >
              1:1 파트너십 시작하기
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              className="md:hidden w-9 h-9 rounded-md border border-[#DFD2BE] bg-[#F4ECE0]/70 hover:bg-[#EAE0D0] text-[#33261C] flex items-center justify-center transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Dropdown Menu */}
        {isMobileMenuOpen && (
          <nav
            aria-label="모바일 메뉴"
            className="md:hidden border-t border-[#E8DFD3] bg-[#FAF6F0]/98 backdrop-blur-md shadow-lg"
          >
            <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-lg hover:bg-[#EFE7DA] active:bg-[#E7DCCB] text-[15px] font-semibold text-[#221A14] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="scroll-mt-18 pt-14 pb-20 md:pt-20 md:pb-28 border-b border-[#E8DFD3]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Top Title Group - Scaled for refined balance */}
          <div className="mb-8 md:mb-12">
            {/* Complexity to Clarity: Refined proportion */}
            <div className="text-sm sm:text-base font-bold tracking-tight text-[#543E2C] mb-2.5">
              Complexity to Clarity
            </div>

            {/* Main Headline: Balanced scale to harmonize with body text */}
            <h1 className="text-2xl sm:text-[28px] lg:text-[32px] font-bold text-[#201812] leading-[1.38] tracking-tight">
              생각의 무게에 눌려 더 이상 앞으로 나아가지 못할 때,
              <br />
              생각이 행동이 되도록 함께하는 Thinking Partner
            </h1>
          </div>

          {/* 2-Column Split: Story & Workspace Visual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Generous, readable body typography */}
            <div className="lg:col-span-6 space-y-7">
              {/* Body Text: Increased presence & comfortable line height */}
              <div className="space-y-4 text-base sm:text-[17.5px] lg:text-[18.5px] text-[#45372C] leading-[1.85] font-normal">
                <p>
                  <span className="block">머릿속은 복잡한데 시작하지 못해 무기력해질 때,</span>
                  <span className="block sm:pl-5 sm:-indent-5">
                    쏟아지는 일들에 치여, 이대로 진짜 중요한 방향을{' '}
                    <br className="hidden sm:inline" />
                    잃어버리는 건 아닐지 불안해질 때,
                  </span>
                  <span className="block">혼자 하는 고민이 더 이상 답을 주지 못할 때,</span>
                </p>
                <p>
                  혼자서는 제자리걸음이던 고민을 넘어,
                  <br />
                  세션이 끝난 뒤 당장 첫 번째 걸음을 내딛는 자신을 마주하게 됩니다.
                </p>
              </div>
            </div>

            {/* Right Column: Warm, Clarity-Inducing Desk Image */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E0D4C2] shadow-sm bg-white p-2">
                <img
                  src={heroWorkspaceImg}
                  alt="A calm, warm desk with morning light, an open notebook and tea"
                  className="w-full h-auto object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Hero Bottom CTA -> Scrolls to Contact Section */}
          <div className="mt-12 md:mt-14 pt-8 border-t border-[#E6DCD0] flex flex-col md:flex-row md:items-center justify-between gap-5">
            <p className="text-[15.5px] sm:text-[17px] font-medium text-[#342417] leading-relaxed">
              &ldquo;완벽하게 정리된 고민이 아니어도 괜찮습니다. 편안한 첫 대화부터 가볍게 시작해 보세요.&rdquo;
            </p>
            <a
              href="#contact"
              className="px-6 py-3.5 text-sm sm:text-[15px] font-semibold text-[#FAF6F0] bg-[#33261C] hover:bg-[#201710] active:scale-[0.98] rounded transition-all shadow-xs inline-flex items-center justify-center gap-2 group shrink-0"
            >
              <span>첫 번째 생각 정리 대화 신청하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. PROGRAMS SECTION */}
      <section id="programs" className="scroll-mt-18 py-20 md:py-28 bg-[#F0E7D8] border-b border-[#DFD2BD]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header: Left aligned to match site layout */}
          <div className="max-w-3xl mb-10 text-left">
            <span className="text-[11px] font-semibold text-[#7A6451] tracking-[0.2em] uppercase block mb-3">
              PROGRAMS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#201812] leading-[1.36] tracking-tight mb-3">
              지금 가장 우선적으로 해결하고
              <br />
              싶은 머릿속 고민은 무엇인가요?
            </h2>
            <p className="text-base sm:text-[17px] text-[#524133] leading-relaxed">
              누구나 마주할 수 있는 대표적인 머릿속 복잡함입니다.
              <br className="hidden sm:inline" /> 모든 과정은 1:1 맞춤형으로 설계되며, 부담 없는 1회 단기 세션부터 장기 파트너십까지 유연하게 선택하실 수 있습니다.
            </p>
          </div>

          {/* Program Items */}
          <div className="space-y-4">
            {PROGRAMS.map((prog) => (
              <div
                key={prog.id}
                className="pt-8 sm:pt-10 pb-6 sm:pb-8 border-t border-[#DFD2BD] flex flex-col md:flex-row items-start gap-6 md:gap-8"
              >
                {/* Geometric Themed Thumbnail */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden shrink-0 border border-[#D4C3AA] shadow-2xs bg-[#E6D9C5]">
                  <img
                    src={prog.image}
                    alt={prog.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Title & English Subtitle */}
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <h3 className="text-lg sm:text-xl font-bold text-[#201812] tracking-tight">
                      {prog.title}
                    </h3>
                    <span className="text-xs sm:text-sm font-medium text-[#7A6451]">
                      {prog.subtitleEn}
                    </span>
                  </div>

                  {/* 2-Column Dilemma Quote & Resolution */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-8 pt-1">
                    {/* Left: Dilemma Quote */}
                    <div className="lg:col-span-5">
                      <p className="text-[14.5px] sm:text-[15.5px] font-semibold text-[#342417] leading-relaxed">
                        &ldquo;{prog.quote}&rdquo;
                      </p>
                    </div>

                    {/* Right: Value / Transformation Description */}
                    <div className="lg:col-span-7">
                      <p className="text-[13.5px] sm:text-[14.5px] text-[#524133] leading-[1.85]">
                        {prog.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Program Bottom CTA -> Opens 1:1 Booking Popup */}
          <div className="mt-10 sm:mt-12 p-6 sm:p-8 rounded-2xl bg-[#FAF6F0] border border-[#DFD2BD] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <p className="text-[15px] sm:text-[16.5px] text-[#342417] leading-[1.75] font-medium max-w-2xl">
              어디서부터 이야기해야 할지 막막하신가요? 정기적인 코칭이 아니더라도 괜찮습니다.
              <br className="hidden sm:inline" /> 지금 당장 머릿속을 어지럽히는 한 가지 주제를 가지고 1회 생각 정리 세션(60분 / 8만 원, VAT 포함)으로 먼저 가볍게 만나보세요.
            </p>
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="px-6 py-3.5 text-sm sm:text-[15px] font-semibold text-[#FAF6F0] bg-[#33261C] hover:bg-[#201710] active:scale-[0.98] rounded transition-all shadow-xs inline-flex items-center justify-center gap-2 group shrink-0 cursor-pointer"
            >
              <span>1회 생각 정리 세션 신청하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. CREDENTIALS SECTION: PROFESSIONAL FOUNDATION (Rich Warm Oak / Timber Tone) */}
      <section id="credentials" className="scroll-mt-18 py-20 md:py-28 bg-[#EADBCA] border-b border-[#D4BF9E]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left Column: Title & Philosophy Statement */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <span className="text-[11px] font-semibold text-[#7A5F45] tracking-[0.2em] uppercase block">
                CREDENTIALS
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#201812] leading-[1.25] tracking-tight">
                Professional
                <br />
                Foundation
              </h2>

              <div className="space-y-4 text-[13.5px] sm:text-sm text-[#544131] leading-[1.8] pt-2">
                <p>
                  &ldquo;저는 정답을 제시하기 위해 이 자리에 있는 것이 아닙니다.
                  <br />
                  당신이 가장 중요한 결정을 내려야 하는 순간,
                  <br />
                  결코 혼자 고민하지 않도록 함께 합니다.
                </p>
                <p>
                  당신의 &apos;Thinking Partner&apos;로서, 당신만의 방식으로
                  <br />
                  더 나은 선택을 할 수 있는 명확한 시야를 찾도록 돕습니다.&rdquo;
                </p>
              </div>

              <div className="w-12 h-px bg-[#CBB494]" />

              {/* Subtle Portrait for Trust & Human Presence */}
              <div className="pt-2">
                <div className="w-44 sm:w-48 lg:w-52 aspect-square rounded-xl overflow-hidden border border-[#CBB494]/90 bg-[#F4ECE0]/70 p-1.5 shadow-2xs">
                  <img
                    src="/assets/aistudio/____________da75ab76.png"
                    alt="Partner in Thinking 프로필"
                    className="w-full h-full object-cover object-top rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Experience, Certifications, Academics */}
            <div className="lg:col-span-7 space-y-12">
              {/* 1. Professional Experience */}
              <div>
                <span className="text-[11px] font-semibold text-[#7A5F45] tracking-[0.2em] uppercase block mb-3">
                  PROFESSIONAL EXPERIENCE
                </span>
                <div className="pl-4 border-l-2 border-[#8E6E4D] space-y-3">
                  <h3 className="text-sm sm:text-base font-bold text-[#201812]">
                    인사이트, 브랜드, 전략, 리더십에 기반한 23년의 단단한 전문 경력
                  </h3>
                  <p className="text-[13.5px] sm:text-sm text-[#483729] leading-[1.8]">
                    생명과학, 소비재, 의료, 식음료 등 각 산업 분야의 외국계 기업들을 거치며 비즈니스의 본질을 마주하고 실효성 있는 해법을 도출해 왔습니다. 그 과정에서 글로벌 기업의 Internal Advisor 임원으로서 조직의 핵심 의사결정을 지원하며 전략적 실행력을 확립했습니다.
                  </p>
                  <p className="text-[13.5px] sm:text-sm text-[#483729] leading-[1.8]">
                    지금은 Independent Thinking Partner로서 복잡함 속에 갇힌 개인과 조직에게 선명한 질서를 함께 만들어가고 있습니다. 모호한 상황을 확신 있는 의사결정과 정교한 실행 체계로 전환하는 것, 그것이 Thinking Partner가 추구하는 핵심 가치입니다.
                  </p>
                </div>
              </div>

              {/* 2. Professional Certification */}
              <div>
                <span className="text-[11px] font-semibold text-[#7A5F45] tracking-[0.2em] uppercase block mb-3">
                  PROFESSIONAL CERTIFICATION
                </span>
                <ul className="space-y-2.5 text-[13px] sm:text-sm text-[#241A13]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E6E4D] shrink-0" />
                    <span>Certified Associate Coach (KAC)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E6E4D] shrink-0" />
                    <span>Certified Birkman® (The Birkman Method)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E6E4D] shrink-0" />
                    <span>Certified TKI® (Thomas-Kilmann Conflict Mode Instrument)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E6E4D] shrink-0" />
                    <span>Certified FIRO-B® (Fundamental Interpersonal Relations Orientation - Behavior)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E6E4D] shrink-0" />
                    <span>Certified Problem Solving Process Advanced Practitioner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E6E4D] shrink-0" />
                    <span>Certified Leader Championship Orientation Trainer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E6E4D] shrink-0" />
                    <span>Certified Training &amp; Facilitation Techniques for Instructors Trainer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E6E4D] shrink-0" />
                    <span>Certified Green Belt, and more</span>
                  </li>
                </ul>
              </div>

              {/* 3. Academic Background */}
              <div>
                <span className="text-[11px] font-semibold text-[#7A5F45] tracking-[0.2em] uppercase block mb-3">
                  ACADEMIC BACKGROUND
                </span>
                <div className="space-y-2.5 text-[13px] sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-medium text-[#241A13]">Bachelor of Architecture</span>
                    <span className="font-semibold text-[#524133] tracking-wider text-[11px] sm:text-xs uppercase">SEOUL NATIONAL UNIVERSITY</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-medium text-[#241A13]">M.S. in Engineering &amp; Project Management</span>
                    <span className="font-semibold text-[#524133] tracking-wider text-[11px] sm:text-xs uppercase">UC BERKELEY</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-medium text-[#241A13]">B.A. in Psychology</span>
                    <span className="font-semibold text-[#524133] tracking-wider text-[11px] sm:text-xs uppercase">CHUNG-ANG UNIVERSITY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STORIES SECTION (CLIENT TESTIMONIAL POST-IT BOARD) */}
      <section id="stories" className="scroll-mt-18 py-20 md:py-28 bg-[#F5EEE4] border-b border-[#E2D5C3] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section Header */}
          <div className="max-w-3xl mb-12 text-left">
            <span className="text-[11px] font-semibold text-[#7A6451] tracking-[0.2em] uppercase block mb-3">
              STORIES
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#201812] leading-[1.36] tracking-tight mb-3">
              대화가 끝난 후 일어난
              <br />
              생각과 행동의 선명한 변화
            </h2>
            <p className="text-base sm:text-[17px] text-[#524133] leading-relaxed">
              머릿속이 엉켜 멈춰있던 고민이 어떻게 명확한 실행으로 전환되었는지,
              <br />
              Thinking Partner 세션을 경험한 분들의 실제 기록입니다.
            </p>
          </div>

          {/* Post-it / Sticky Note Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-2">
            {/* Post-it 1 (Top-Left): Warm Butter Note (선택 & 집중 - 외국계 기업 세일즈 상무) */}
            <div className="relative group bg-[#FFFDEB] p-6 sm:p-7 rounded-sm border border-[#EDE2BA] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rotate-[-0.7deg] hover:rotate-0 flex flex-col justify-between">
              {/* Semi-transparent washi tape accent */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-100/75 border border-amber-200/60 shadow-2xs rotate-[1.5deg]" />

              <div className="space-y-4">
                <div className="pb-3 border-b border-[#E8DAAA]/60">
                  <span className="text-[11px] font-bold text-[#8A6A32] tracking-wider uppercase">
                    선택 &amp; 집중
                  </span>
                </div>

                <div className="space-y-3.5 text-[13px] sm:text-[14px] leading-[1.75]">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8DCBE] text-[#5C421A] mr-1.5 mb-1">
                      BEFORE
                    </span>
                    <p className="text-[#59442B] font-medium">
                      &ldquo;직장에서의 커리어 개발과 삶에서 해야 한다고 생각하는 일들이 뒤엉켜, 무엇부터 발걸음을 시작해야 할지 막막했습니다.&rdquo;
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#755928] text-[#FFFBEB] mr-1.5 mb-1">
                      AFTER
                    </span>
                    <p className="text-[#2B1F0E] font-semibold leading-relaxed">
                      &ldquo;세션 이후 무엇이 중요한지 우선순위가 명확해졌고, 하나씩 실천하며 막막했던 일들을 이미 주도적으로 해내고 있습니다.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-[#E8DAAA]/50 text-xs sm:text-[12.5px] text-[#7A6038]">
                <span className="font-bold text-[#3B2912]">외국계 기업 세일즈 상무</span>
              </div>
            </div>

            {/* Post-it 2 (Top-Center): Pale Muted Sage (내면 질서 & 번아웃 - 스타트업 창업 준비) */}
            <div className="relative group bg-[#F5F8F1] p-6 sm:p-7 rounded-sm border border-[#DDE5D4] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rotate-[0.5deg] hover:rotate-0 flex flex-col justify-between">
              {/* Semi-transparent washi tape accent */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-stone-200/75 border border-stone-300/60 shadow-2xs rotate-[2deg]" />

              <div className="space-y-4">
                <div className="pb-3 border-b border-[#D2DDC8]/60">
                  <span className="text-[11px] font-bold text-[#55694A] tracking-wider uppercase">
                    내면 질서 &amp; 번아웃
                  </span>
                </div>

                <div className="space-y-3.5 text-[13px] sm:text-[14px] leading-[1.75]">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D7E2D0] text-[#36492B] mr-1.5 mb-1">
                      BEFORE
                    </span>
                    <p className="text-[#43523A] font-medium">
                      &ldquo;오랜 불안과 트라우마 속에 갇혀, 새로운 시작을 앞두고도 과거의 경험에 발목이 잡혀 있었습니다.&rdquo;
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#4B5E41] text-[#F5F8F1] mr-1.5 mb-1">
                      AFTER
                    </span>
                    <p className="text-[#192413] font-semibold leading-relaxed">
                      &ldquo;깊은 공감과 통찰 있는 질문 덕분에 걱정의 실체를 깨닫고, 과거의 경험을 새로운 도전을 위한 발판으로 전환했습니다.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-[#D2DDC8]/50 text-xs sm:text-[12.5px] text-[#55694B]">
                <span className="font-bold text-[#1E2916]">스타트업 창업 준비</span>
              </div>
            </div>

            {/* Post-it 3 (Top-Right): Warm Sandalwood / Chai Paper (삶의 방향 & 전환 - 학원 원장) */}
            <div className="relative group bg-[#FAF4EB] p-6 sm:p-7 rounded-sm border border-[#E7D8C2] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rotate-[-0.6deg] hover:rotate-0 flex flex-col justify-between">
              {/* Semi-transparent washi tape accent */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-100/75 border border-amber-200/60 shadow-2xs rotate-[-1deg]" />

              <div className="space-y-4">
                <div className="pb-3 border-b border-[#DFCEB7]/60">
                  <span className="text-[11px] font-bold text-[#7A5B3D] tracking-wider uppercase">
                    삶의 방향 &amp; 전환
                  </span>
                </div>

                <div className="space-y-3.5 text-[13px] sm:text-[14px] leading-[1.75]">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E2CEB4] text-[#4A321B] mr-1.5 mb-1">
                      BEFORE
                    </span>
                    <p className="text-[#59422C] font-medium">
                      &ldquo;현실적인 사업의 양적 성장과 지향점 사이에서 괴리가 생기며, 복잡한 생각들로 방향을 잃고 있었습니다.&rdquo;
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#6B4B29] text-[#FAF3E8] mr-1.5 mb-1">
                      AFTER
                    </span>
                    <p className="text-[#26170A] font-semibold leading-relaxed">
                      &ldquo;머릿속의 생각들을 꺼내어 본질적인 삶의 가치와 비교·정렬하자, 당장 집중해야 할 것과 나중으로 미룰 것이 명확해졌습니다. 이제 선명해진 기준을 바탕으로 차근차근 성과를 만들어가고 있습니다.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-[#DFCEB7]/50 text-xs sm:text-[12.5px] text-[#78593A]">
                <span className="font-bold text-[#36210F]">학원 원장 (사업 3년 차)</span>
              </div>
            </div>

            {/* Post-it 4 (Bottom-Left): Soft Warm Peach Note (삶의 방향 & 전환 - 대기업 20년 차 팀장) */}
            <div className="relative group bg-[#FDF5F0] p-6 sm:p-7 rounded-sm border border-[#ECD9CE] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rotate-[0.8deg] hover:rotate-0 flex flex-col justify-between">
              {/* Semi-transparent washi tape accent */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-100/75 border border-amber-200/60 shadow-2xs rotate-[-1.5deg]" />

              <div className="space-y-4">
                <div className="pb-3 border-b border-[#E3CEC1]/60">
                  <span className="text-[11px] font-bold text-[#825442] tracking-wider uppercase">
                    삶의 방향 &amp; 전환
                  </span>
                </div>

                <div className="space-y-3.5 text-[13px] sm:text-[14px] leading-[1.75]">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8D0C3] text-[#522919] mr-1.5 mb-1">
                      BEFORE
                    </span>
                    <p className="text-[#5B3E32] font-medium">
                      &ldquo;당면한 문제를 단편적으로만 바라보며, 복잡한 과제 앞에서 스스로의 기준을 찾지 못하고 헤매고 있었습니다.&rdquo;
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#784632] text-[#FDF5F0] mr-1.5 mb-1">
                      AFTER
                    </span>
                    <p className="text-[#2C150C] font-semibold leading-relaxed">
                      &ldquo;존재 자체에 대한 깊은 성찰을 통해, 세션이 끝난 이후에도 스스로 주도적으로 문제를 해결할 명확한 기준을 얻었습니다.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-[#E3CEC1]/50 text-xs sm:text-[12.5px] text-[#7C5241]">
                <span className="font-bold text-[#3A1B10]">대기업 20년 차 팀장</span>
              </div>
            </div>

            {/* Post-it 5 (Bottom-Center): Warm Linen / Kraft Paper (관계 & 소통 - 글로벌 기업 임원) */}
            <div className="relative group bg-[#FAF3E8] p-6 sm:p-7 rounded-sm border border-[#E5D7C2] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rotate-[-0.5deg] hover:rotate-0 flex flex-col justify-between">
              {/* Semi-transparent washi tape accent */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-100/75 border border-amber-200/60 shadow-2xs rotate-[1deg]" />

              <div className="space-y-4">
                <div className="pb-3 border-b border-[#DFCEB7]/60">
                  <span className="text-[11px] font-bold text-[#7A5B3D] tracking-wider uppercase">
                    관계 &amp; 소통
                  </span>
                </div>

                <div className="space-y-3.5 text-[13px] sm:text-[14px] leading-[1.75]">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E2CEB4] text-[#4A321B] mr-1.5 mb-1">
                      BEFORE
                    </span>
                    <p className="text-[#59422C] font-medium">
                      &ldquo;조직 내 인간관계와 팀 운영 과제 앞에서 감정적으로 소모되며 리더로서의 자신감을 잃고 있었습니다.&rdquo;
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#6B4B29] text-[#FAF3E8] mr-1.5 mb-1">
                      AFTER
                    </span>
                    <p className="text-[#26170A] font-semibold leading-relaxed">
                      &ldquo;감정을 걷어내고 대화의 구조를 객관화하자, 솔직한 피드백과 함께 팀 전체의 신뢰가 다시 살아났습니다.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-[#DFCEB7]/50 text-xs sm:text-[12.5px] text-[#78593A]">
                <span className="font-bold text-[#36210F]">글로벌 기업 임원</span>
              </div>
            </div>

            {/* Post-it 6 (Bottom-Right): Customizable Placeholder Slot (Completes 2x3 grid) */}
            <div className="relative group bg-[#FAF6EE]/80 border-2 border-dashed border-[#D5C6AF] p-6 sm:p-7 rounded-sm flex flex-col items-center justify-center text-center rotate-[0.6deg] hover:rotate-0 hover:bg-[#FAF6EE] transition-all min-h-[250px]">
              <div className="w-10 h-10 rounded-full bg-[#EDE2D0] text-[#7A6451] flex items-center justify-center mb-3">
                <span className="text-xl font-light leading-none">+</span>
              </div>
              <h4 className="text-sm sm:text-[15px] font-bold text-[#45372C] mb-1.5">
                당신의 변화가 기록될 차례입니다
              </h4>
              <p className="text-xs text-[#7A6755] leading-relaxed max-w-[240px]">
                복잡했던 머릿속 매듭을 풀고, 선명해진 첫 걸음을 함께 시작합니다.
              </p>
              <button
                onClick={() => handleOpenBooking()}
                className="mt-4 px-5 py-2 text-xs font-semibold text-[#FAF6F0] bg-[#33261C] hover:bg-[#201710] rounded transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 group"
              >
                <span>1:1 파트너십 시작하기</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. APPROACH SECTION: APPROACH OF PARTNER IN THINKING */}
      <section id="approach" className="scroll-mt-18 py-20 md:py-28 bg-[#EDE3D2] border-b border-[#D8C7B0]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left Column: Editorial Headline & Stance */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-[#7A6451] tracking-[0.2em] uppercase block">
                  APPROACH
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#201812] leading-[1.25] tracking-tight whitespace-nowrap">
                  Complexity to Clarity
                </h2>
              </div>

              <p className="text-base sm:text-[18px] text-[#544335] font-normal leading-relaxed">
                당신의 사고 파트너로서
                <br />
                당신만의 가치와 기준으로 생각을 정리하도록 함께합니다.
              </p>
            </div>

            {/* Right Column: Lead Statement + 4 Pillars Grid */}
            <div className="lg:col-span-7 space-y-9">
              {/* Lead Paragraphs */}
              <div className="space-y-4">
                <p className="text-xl sm:text-2xl lg:text-[23px] text-[#241A14] font-medium leading-[1.55]">
                  어떤 순간에는 혼자만으로는 삶의 무게가 버겁게 느껴질 때가 있습니다.
                </p>

                <p className="text-base sm:text-[17px] text-[#503F31] leading-[1.85]">
                  당신의 <strong className="font-semibold text-[#241A14]">Thinking Partner</strong>로서 사고를 구조화하고 실행 가능한 명확함을 만듭니다.
                  <br />
                  내면의 질서를 정돈하며 지속 가능한 균형을 함께 회복합니다.
                </p>
              </div>

              {/* 4 Pillars (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 pt-6 border-t border-[#D2C0A7]">
                {/* 1. Critical Framing */}
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#E1D0B8] border border-[#CCB998] text-[#402F21] flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-[17px] sm:text-[18px] font-bold text-[#241A14] mb-2">
                    Critical Framing
                  </h3>
                  <p className="text-[15px] sm:text-[16px] text-[#5A493B] leading-[1.8]">
                    복잡한 상황의 본질을 정의하고, 해결해야 할 핵심 문제를 선명하게 만듭니다.
                  </p>
                </div>

                {/* 2. Actionable Focus */}
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#E1D0B8] border border-[#CCB998] text-[#402F21] flex items-center justify-center mb-3">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-[17px] sm:text-[18px] font-bold text-[#241A14] mb-2">
                    Actionable Focus
                  </h3>
                  <p className="text-[15px] sm:text-[16px] text-[#5A493B] leading-[1.8]">
                    한정된 에너지를 가장 중요한 과제에 정렬하여 실질적인 실행력을 높입니다.
                  </p>
                </div>

                {/* 3. Inner Order */}
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#E1D0B8] border border-[#CCB998] text-[#402F21] flex items-center justify-center mb-3">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="text-[17px] sm:text-[18px] font-bold text-[#241A14] mb-2">
                    Inner Order
                  </h3>
                  <p className="text-[15px] sm:text-[16px] text-[#5A493B] leading-[1.8]">
                    내면의 충돌과 사고 패턴을 객관화하여 실행을 가로막는 심리적 장벽을 해소합니다.
                  </p>
                </div>

                {/* 4. Relational Balance */}
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#E1D0B8] border border-[#CCB998] text-[#402F21] flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-[17px] sm:text-[18px] font-bold text-[#241A14] mb-2">
                    Relational Balance
                  </h3>
                  <p className="text-[15px] sm:text-[16px] text-[#5A493B] leading-[1.8]">
                    관계 속의 사고 구조를 파악하여 조직과 개인의 지속 가능한 조화를 이룹니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INSIGHT SECTION */}
      <section id="insight" className="scroll-mt-18 py-20 md:py-28 bg-[#FAF6F0] border-b border-[#E8DFD3]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header with Top-Right Blog Link */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-3xl text-left">
              <span className="text-[11px] font-semibold text-[#7A6451] tracking-[0.2em] uppercase block mb-3">
                INSIGHT
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#201812] leading-[1.36] tracking-tight mb-3">
                생각의 실타래를 푸는 관점과 글
              </h2>
              <p className="text-base sm:text-[17px] text-[#524133] leading-relaxed">
                복잡한 상황을 단순하게 바라보고 실행으로 전환하기 위해 나눈 Thinking Partner의 기록입니다. 네이버 블로그에서 더 깊은 사유와 다양한 인사이트를 만나보세요.
              </p>
            </div>

            <a
              href="https://blog.naver.com/yourthinkingpartner"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FAF6F0] bg-[#33261C] hover:bg-[#201710] active:scale-[0.98] rounded transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start md:self-end whitespace-nowrap group"
            >
              <span>더 많은 글 읽어보기</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* 4 Articles Grid (2x2) - Uniform card dimensions and matched box heights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {INSIGHTS.map((post, idx) => (
              <a
                key={idx}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 sm:p-8 bg-[#F2E8D9] hover:bg-white rounded-xl border border-[#DFD1BD] hover:border-[#BFA88A] shadow-2xs hover:shadow-xs transition-all duration-200 h-full min-h-[116px] sm:min-h-[128px] flex items-center justify-between gap-6"
              >
                <h3 className="text-base sm:text-[17.5px] font-bold text-[#241A14] group-hover:text-[#4A3728] transition-colors leading-[1.6]">
                  {post.title}
                </h3>
                <div className="w-9 h-9 rounded-full bg-[#E2D2BC] group-hover:bg-[#33261C] text-[#594433] group-hover:text-[#FAF6F0] flex items-center justify-center shrink-0 transition-all duration-200">
                  <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER / CONTACT SECTION (Deep Espresso Walnut Wood) */}
      <footer id="contact" className="scroll-mt-18 bg-[#1F1813] text-[#EDE4DA] pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-5">
              {/* Mobile Line Breaks */}
              <span className="sm:hidden">
                생각만 많아지고
                <br />
                행동은 멈춰있다면,
                <br />
                이제 변화를 위한 첫 걸음을
                <br />
                시작할 시간입니다.
              </span>
              {/* PC / Tablet Line Breaks */}
              <span className="hidden sm:inline">
                생각만 많아지고 행동은 멈춰 있다면,
                <br />
                이제 변화를 위한 첫 걸음을 시작할 시간입니다.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-[#CFC2B4] leading-relaxed mb-8">
              {/* Mobile Line Breaks */}
              <span className="sm:hidden">
                얽힌 생각을 구조화하고 당장 실천할 수 있는
                <br />
                명확한 답을 함께 찾아갑니다.
                <br />
                혼자 하던 고민을 실행으로 바꾸는 대화를
                <br />
                지금 시작해 보세요.
              </span>
              {/* PC / Tablet Line Breaks */}
              <span className="hidden sm:inline">
                얽힌 생각을 구조화하고 당장 실천할 수 있는 명확한 답을 함께 찾아갑니다.
                <br />
                혼자 하던 고민을 실행으로 바꾸는 대화를 지금 시작해 보세요.
              </span>
            </p>

            <button
              onClick={() => handleOpenBooking()}
              className="px-8 py-4 text-sm font-bold text-[#1F1813] bg-[#E8DCC9] hover:bg-white active:scale-[0.98] rounded transition-all shadow-md inline-flex items-center gap-2 group"
            >
              <span>1:1 파트너십 시작하기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Direct Contact Points */}
            <div className="mt-8 flex items-center justify-center text-xs sm:text-sm text-[#C4B4A2]">
              <a
                href="mailto:hello.partnerinthinking@gmail.com"
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-[#D4C3AF]" />
                <span>hello.partnerinthinking@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Session Format & Confidentiality Assurance */}
          <div className="py-4 px-6 bg-[#2B211A] rounded-lg border border-[#3E3026] inline-flex items-center gap-3 text-xs text-[#E5DCD2] mb-12">
            <ShieldCheck className="w-4 h-4 text-[#D4B594] shrink-0" />
            <span>
              오프라인 세션 (서울 강남) 및 온라인 화상 세션 모두 가능하며, 모든 세션의 내용은 100% 기밀이 보장됩니다.
            </span>
          </div>

          {/* Footer Bottom Brand Logo & Admin Access (Balanced Single Brand Title) */}
          <div className="pt-10 border-t border-[#362A22] flex flex-col sm:flex-row items-center justify-between gap-5 text-xs text-[#9E8B7A]">
            <a
              href="#"
              className="text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-white hover:opacity-90 transition-opacity whitespace-nowrap select-none"
            >
              PARTNER <span className="font-normal text-[#B8A492]">IN</span> THINKING
            </a>

            <div className="flex items-center gap-3 text-[11.5px] text-[#8E7C6E]">
              <span>© All rights reserved.</span>
              <span className="text-[#4A3B31]">·</span>
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setIsAdminOpen(true);
                }}
                className="px-2.5 py-1 rounded bg-[#2B211A] hover:bg-[#382B22] border border-[#3E3026] text-[#9E8B7A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                aria-label="Admin"
              >
                <Lock className="w-3 h-3 text-[#9E8B7A]" />
                <span className="font-medium">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 8. MODAL: 1:1 BOOKING & CONSULTATION INTAKE */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-[#FCFBF8] w-full max-w-xl rounded-2xl border border-[#E3D8C8] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 sm:px-7 py-5 bg-[#F4ECE0] border-b border-[#E4D7C5] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#201812] tracking-tight">
                  1:1 파트너십 대화 신청
                </h3>
                <p className="text-[13.5px] sm:text-sm text-[#6E5948] mt-0.5 leading-relaxed">
                  머릿속의 혼란을 정리하고 첫 매듭을 함께 찾습니다.
                  <br />
                  (1회 세션 60분 / 8만 원, VAT 포함)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6E5948] hover:text-[#201812] hover:bg-[#E7DAC7] transition-colors cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmitted && lastBooking ? (
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#E5D7C3] text-[#33261C] rounded-full flex items-center justify-center mx-auto mb-3.5 shadow-inner">
                    <Check className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#201812] mb-1.5">
                    신청이 성공적으로 접수되었습니다.
                  </h4>
                  <p className="text-sm text-[#524133] leading-relaxed">
                    작성하신 신청 내용이 안전하게 접수되었습니다.
                    <br />
                    확인 후 입력하신 연락처 또는 이메일로 답변드리겠습니다.
                  </p>
                </div>

                {/* Submitted Summary Card */}
                <div className="p-5 bg-[#F4ECE0]/80 rounded-xl border border-[#DFD2BD] text-sm space-y-2.5 text-[#423225]">
                  <div className="flex justify-between gap-4 pb-2 border-b border-[#D8C7B2]">
                    <span className="font-semibold text-[#6E5948] shrink-0">성함</span>
                    <span className="font-bold text-[#241A13] text-right">{lastBooking.name}</span>
                  </div>
                  <div className="flex justify-between gap-4 pb-2 border-b border-[#D8C7B2]">
                    <span className="font-semibold text-[#6E5948] shrink-0">연락처</span>
                    <span className="font-bold text-[#241A13] text-right">{lastBooking.contact}</span>
                  </div>
                  <div className="flex justify-between gap-4 pb-2 border-b border-[#D8C7B2]">
                    <span className="font-semibold text-[#6E5948] shrink-0">이메일</span>
                    <span className="font-bold text-[#241A13] text-right break-all">{lastBooking.email}</span>
                  </div>
                  <div className="flex justify-between gap-4 pb-2 border-b border-[#D8C7B2]">
                    <span className="font-semibold text-[#6E5948] shrink-0">관심 프로그램</span>
                    <span className="font-bold text-[#241A13] text-right">{lastBooking.programTitle}</span>
                  </div>
                  <div className="pt-1">
                    <span className="block font-semibold text-[#6E5948] mb-1.5">메시지</span>
                    <p className="p-3 bg-white/90 rounded-lg border border-[#E0D4C2] text-[#342417] leading-relaxed">
                      &ldquo;{lastBooking.dilemma}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3.5 text-[15px] font-bold text-white bg-[#33261C] hover:bg-[#201710] active:scale-[0.99] rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="p-6 sm:p-7 space-y-5 overflow-y-auto">
                {/* Row 1: 이름 & 연락처 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-bold text-[#2E2218] mb-2">
                      이름 <span className="text-[#8E4B32]">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="성함을 입력해 주세요"
                      className="w-full px-4 py-3.5 text-[15px] bg-[#F3EFE9] border border-transparent focus:border-[#A8927B] focus:bg-white rounded-xl focus:outline-none text-[#241A13] placeholder:text-[#9A8B7C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-[#2E2218] mb-2">
                      연락처 <span className="text-[#8E4B32]">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-4 py-3.5 text-[15px] bg-[#F3EFE9] border border-transparent focus:border-[#A8927B] focus:bg-white rounded-xl focus:outline-none text-[#241A13] placeholder:text-[#9A8B7C] transition-colors"
                    />
                  </div>
                </div>

                {/* Row 2: 이메일 */}
                <div>
                  <label className="block text-[14px] font-bold text-[#2E2218] mb-2">
                    이메일 <span className="text-[#8E4B32]">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="답변 및 일정 안내를 받으실 이메일 주소"
                    className="w-full px-4 py-3.5 text-[15px] bg-[#F3EFE9] border border-transparent focus:border-[#A8927B] focus:bg-white rounded-xl focus:outline-none text-[#241A13] placeholder:text-[#9A8B7C] transition-colors"
                  />
                </div>

                {/* Row 3: 관심 프로그램 (중복 선택 가능 드롭다운) */}
                <div ref={programDropdownRef} className="relative">
                  <label className="block text-[14px] font-bold text-[#2E2218] mb-2">
                    관심 프로그램 <span className="text-[12.5px] font-normal text-[#7A6451]">(선택 사항)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsProgramDropdownOpen((prev) => !prev)}
                    className={`w-full px-4 py-3.5 text-[15px] bg-[#F3EFE9] border rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isProgramDropdownOpen
                        ? 'border-[#A8927B] bg-white'
                        : 'border-transparent hover:bg-[#EDE7DE]'
                    }`}
                  >
                    <span
                      className={`truncate ${
                        selectedPrograms.length > 0
                          ? 'text-[#241A13] font-medium'
                          : 'text-[#9A8B7C]'
                      }`}
                    >
                      {selectedPrograms.length > 0
                        ? selectedPrograms
                            .map((id) => PROGRAM_OPTIONS.find((opt) => opt.id === id)?.label)
                            .filter(Boolean)
                            .join(', ')
                        : '관심 있는 프로그램을 선택해 주세요 (중복 선택 가능)'}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#7A6451] shrink-0 transition-transform ${
                        isProgramDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isProgramDropdownOpen && (
                    <div className="mt-2 p-2 bg-white border border-[#DFD2BE] rounded-xl shadow-lg space-y-1">
                      {PROGRAM_OPTIONS.map((option) => {
                        const isChecked = selectedPrograms.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleProgramSelection(option.id)}
                            className={`w-full px-3.5 py-2.5 rounded-lg text-left text-[14.5px] flex items-center gap-3 transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-[#F4ECE0] text-[#201812] font-semibold'
                                : 'text-[#45372C] hover:bg-[#FAF6F0]'
                            }`}
                          >
                            <span
                              className={`w-4.5 h-4.5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-[#33261C] border-[#33261C] text-white'
                                  : 'bg-white border-[#CBBAA4]'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </span>
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Row 4: 메시지 */}
                <div>
                  <label className="block text-[14px] font-bold text-[#2E2218] mb-2">
                    메시지 <span className="text-[#8E4B32]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formDilemma}
                    onChange={(e) => setFormDilemma(e.target.value)}
                    placeholder={
                      '함께 생각해 보고 싶은 주제나 고민을 적어주세요.\n예: 너무 많은 생각으로 겪는 결정의 어려움, 커리어 전환을 앞두고 정리되지 않는 고민, 혹은 팀 운영에서 겪는 소통의 어려움 등을 편하게 적어주세요.'
                    }
                    className="w-full px-4 py-3.5 text-[15px] bg-[#F3EFE9] border border-transparent focus:border-[#A8927B] focus:bg-white rounded-xl focus:outline-none text-[#241A13] placeholder:text-[#9A8B7C] leading-relaxed transition-colors resize-none"
                  />
                </div>

                <div className="p-3.5 bg-[#F4ECE0] rounded-xl border border-[#E4D7C5] text-[13px] text-[#5C4A3B] leading-relaxed">
                  🔒 입력하신 모든 정보는 파트너 외에 누구에게도 공개되지 않습니다. 신청서를 남겨주시면 확인 후 세션 일정 조율 및 결제 안내(네이버페이 가능)를 보내드립니다.
                </div>

                {submitError && (
                  <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-[13px] text-red-800 leading-relaxed">
                    {submitError}
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="w-full py-3.5 text-[15px] sm:text-base font-bold text-white bg-[#33261C] hover:bg-[#201710] disabled:opacity-60 active:scale-[0.99] rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {isSubmittingBooking ? '신청 접수 중...' : '첫 대화 예약 신청하기'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 9. MODAL: ADMIN DASHBOARD (Authenticated Admin Only) */}
      {isAdminOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAdminOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          {!isAdmin ? (
            <div className="bg-[#FAF7F2] w-full max-w-md rounded-2xl border border-[#DFD3C0] shadow-2xl overflow-hidden">
              <div className="px-6 py-4 bg-[#231A14] text-[#EDE4DA] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[#D4B594]" />
                  <h3 className="text-base font-bold text-white">Admin</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminOpen(false)}
                  className="w-8 h-8 rounded flex items-center justify-center text-[#C4B4A2] hover:text-white hover:bg-[#3A2D23] transition-colors cursor-pointer"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-7 space-y-5 text-center">
                {!isAuthReady ? (
                  <p className="text-sm text-[#5C4A3B] py-4">인증 상태를 확인하고 있습니다...</p>
                ) : authUser ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-[#201812]">
                        접근 권한이 없습니다
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#5C4A3B] leading-relaxed">
                        현재 로그인된 계정(<span className="font-semibold">{authUser.email}</span>)에는 관리자 권한이 없습니다.
                        <br />
                        지정된 관리자 Google 계정으로 로그인해 주세요.
                      </p>
                    </div>

                    {authError && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                        {authError}
                      </p>
                    )}

                    <div className="space-y-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleSwitchAdminAccount}
                        disabled={isSigningIn}
                        className="w-full py-3 px-4 text-sm font-bold text-white bg-[#33261C] hover:bg-[#201710] disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                      >
                        {isSigningIn ? '로그인 중...' : '다른 Google 계정으로 로그인'}
                      </button>
                      <button
                        type="button"
                        onClick={handleAdminSignOut}
                        className="w-full py-2.5 px-4 text-xs font-semibold text-[#5C4A3B] hover:text-[#201812] hover:bg-[#EDE4D6] rounded-xl transition-colors cursor-pointer"
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#EDE2D2] text-[#33261C] flex items-center justify-center mx-auto">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-[#201812]">
                        관리자 인증이 필요합니다
                      </h4>
                      <p className="text-xs sm:text-[13px] text-[#5C4A3B] leading-relaxed">
                        지정된 관리자 Google 계정으로 로그인한 경우에만 접근할 수 있습니다.
                      </p>
                    </div>

                    {authError && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                        {authError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleAdminSignIn}
                      disabled={isSigningIn}
                      className="w-full py-3 px-4 text-sm font-bold text-white bg-[#33261C] hover:bg-[#201710] disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
                    >
                      {isSigningIn ? '로그인 창 여는 중...' : 'Google 계정으로 로그인'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
          <div className="bg-[#FAF7F2] w-full max-w-4xl rounded-xl border border-[#DFD3C0] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Admin Header */}
            <div className="px-6 py-4 bg-[#231A14] text-[#EDE4DA] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3A2D23] border border-[#524133] flex items-center justify-center text-[#E8DCC9]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      1:1 파트너십 신청 관리
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#8E6E4D] text-white">
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-[#BCAAA0]">
                    로그인: {authUser?.email} · 총 {bookings.length}건
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {adminTab === 'bookings' && (
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 text-xs font-semibold text-[#241A14] bg-[#E8DCC9] hover:bg-white rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="신청 내역을 엑셀(CSV) 파일로 저장합니다"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">CSV 다운로드</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAdminSignOut}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#E8DCC9] hover:text-white bg-[#3A2D23] hover:bg-[#4A3B30] rounded transition-colors flex items-center gap-1 cursor-pointer"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className="w-8 h-8 rounded flex items-center justify-center text-[#C4B4A2] hover:text-white hover:bg-[#3A2D23] transition-colors cursor-pointer"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Admin Header Navigation Tabs */}
            <div className="px-6 pt-2 bg-[#231A14] border-t border-[#3A2D23] flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAdminTab('bookings')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'bookings'
                    ? 'bg-[#F0E7D8] text-[#241A14]'
                    : 'text-[#C4B4A2] hover:text-white hover:bg-[#34271D]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>신청 내역 관리 ({bookings.length})</span>
              </button>
              <button
                onClick={() => setAdminTab('sns')}
                className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'sns'
                    ? 'bg-[#F0E7D8] text-[#241A14]'
                    : 'text-[#C4B4A2] hover:text-white hover:bg-[#34271D]'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SNS 썸네일 &amp; 메타태그 미리보기</span>
              </button>
            </div>

            {/* TAB 1: BOOKINGS LIST */}
            {adminTab === 'bookings' ? (
              <>
                {/* Admin Filter & Search Bar */}
                <div className="p-4 bg-[#F0E7D8] border-b border-[#DFD1BD] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    <button
                      onClick={() => setAdminStatusFilter('all')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        adminStatusFilter === 'all'
                          ? 'bg-[#33261C] text-[#FAF6F0]'
                          : 'bg-white/70 text-[#5C4A3B] hover:bg-white'
                      }`}
                    >
                      전체 ({bookings.length})
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('pending')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        adminStatusFilter === 'pending'
                          ? 'bg-[#8E6E4D] text-white'
                          : 'bg-white/70 text-[#5C4A3B] hover:bg-white'
                      }`}
                    >
                      대기중 ({bookings.filter((b) => b.status === 'pending').length})
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('contacted')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        adminStatusFilter === 'contacted'
                          ? 'bg-[#405436] text-white'
                          : 'bg-white/70 text-[#5C4A3B] hover:bg-white'
                      }`}
                    >
                      연락완료 ({bookings.filter((b) => b.status === 'contacted').length})
                    </button>
                    <button
                      onClick={() => setAdminStatusFilter('confirmed')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        adminStatusFilter === 'confirmed'
                          ? 'bg-[#2A4365] text-white'
                          : 'bg-white/70 text-[#5C4A3B] hover:bg-white'
                      }`}
                    >
                      세션확정 ({bookings.filter((b) => b.status === 'confirmed').length})
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="이름, 연락처, 고민 검색..."
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D5C7B3] rounded focus:outline-none focus:border-[#5C4533] text-[#241A13]"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A7563]">
                      🔍
                    </span>
                  </div>
                </div>

                {/* Bookings List Area */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white/60 rounded-xl border border-dashed border-[#D5C7B3]">
                      <MessageSquare className="w-10 h-10 text-[#BCAAA0] mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#5C4A3B]">해당 조건의 신청 내역이 없습니다.</p>
                      <p className="text-xs text-[#8A7563] mt-1">
                        고객이 1:1 파트너십을 신청하면 이곳에 즉시 실시간으로 등록됩니다.
                      </p>
                    </div>
                  ) : (
                    filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-5 bg-white rounded-xl border border-[#DFD1BD] shadow-xs hover:border-[#BFA88A] transition-all space-y-3"
                      >
                        {/* Top Row: Meta & Status Selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0E7D8]">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm sm:text-base text-[#241A14]">
                              {b.name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EDE2D2] text-[#5C421A]">
                              {b.programTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Status selector */}
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleUpdateStatus(b.id, e.target.value as BookingRecord['status'])
                              }
                              className={`text-xs font-semibold px-2.5 py-1 rounded border outline-none cursor-pointer ${
                                b.status === 'pending'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : b.status === 'contacted'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : b.status === 'confirmed'
                                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                                  : 'bg-stone-100 text-stone-700 border-stone-300'
                              }`}
                            >
                              <option value="pending">⏳ 대기중</option>
                              <option value="contacted">📞 연락완료</option>
                              <option value="confirmed">✅ 세션확정</option>
                              <option value="cancelled">🚫 취소/보류</option>
                            </select>

                            {/* Inline Delete confirmation */}
                            {confirmDeleteId === b.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBooking(b.id)}
                                  className="px-2 py-1 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                                >
                                  삭제 확인
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 text-[11px] font-medium bg-[#EDE4D6] hover:bg-[#DFD2BE] text-[#33261C] rounded cursor-pointer"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(b.id)}
                                className="p-1 text-[#A8988A] hover:text-red-700 transition-colors cursor-pointer"
                                title="신청 내역 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Middle: Dilemma text */}
                        <div className="p-3 bg-[#FAF6F0] rounded-lg border border-[#EDE2D2]">
                          <span className="text-[10px] font-bold text-[#8A7563] uppercase tracking-wider block mb-1">
                            고민 내용
                          </span>
                          <p className="text-xs sm:text-[13px] text-[#332417] leading-relaxed whitespace-pre-wrap">
                            {b.dilemma}
                          </p>
                        </div>

                        {/* Bottom Row: Contact & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-[#6E5948]">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1 text-[#8A7563]">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{b.createdAt}</span>
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-[#241A14]">
                              {b.contact}
                            </span>
                            {b.email && (
                              <>
                                <span>·</span>
                                <span className="font-medium text-[#524133]">
                                  {b.email}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Direct phone call if contact contains numbers */}
                            {/\d/.test(b.contact) && (
                              <a
                                href={`tel:${b.contact.replace(/[^\d]/g, '')}`}
                                className="px-3 py-1 rounded bg-[#F0E7D8] hover:bg-[#E2D2BD] text-[#33261C] font-semibold transition-colors flex items-center gap-1.5"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>전화 걸기</span>
                              </a>
                            )}

                            {/* Direct email reply */}
                            <a
                              href={`mailto:${b.email || b.contact}?subject=${encodeURIComponent(
                                `[PARTNER IN THINKING] ${b.name}님, 신청해주신 1:1 세션 일정 조율 안내입니다.`
                              )}`}
                              className="px-3 py-1 rounded bg-[#F0E7D8] hover:bg-[#E2D2BD] text-[#33261C] font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>메일 답장</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* TAB 2: SNS THUMBNAIL & OG META PREVIEW */
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Visual Card Preview matching user attachment */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5C4533] uppercase tracking-wider">
                        📱 SNS 링크 공유 카드 미리보기
                      </span>
                      <span className="text-[11px] text-[#8E7660]">
                        카카오톡 / iMessage / 페이스북 / 슬랙
                      </span>
                    </div>

                    {/* Actual Card Simulation */}
                    <div className="bg-[#FAF6F0] rounded-xl border border-[#DFD2BE] shadow-md overflow-hidden max-w-sm mx-auto">
                      {/* Thumbnail Image */}
                      <div className="relative aspect-[982/507] bg-[#F7F3EB] overflow-hidden border-b border-[#E2D5C3]">
                        <img
                          src="/og-image.png"
                          alt="PARTNER IN THINKING SNS Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Card Content Area */}
                      <div className="p-4 bg-white space-y-1.5">
                        <h4 className="text-[15px] font-bold text-[#1F1813] tracking-tight leading-snug">
                          Complexity to Clarity
                        </h4>
                        <p className="text-xs text-[#524133] leading-relaxed line-clamp-2">
                          복잡한 세상 속, 얽힌 머릿속과 마음을 체계적으로 구조화하는 생각 파트너
                        </p>
                        <span className="text-[11px] text-[#8E7660] font-medium block pt-1">
                          www.partnerinthinking.com
                        </span>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-[#7A6451] text-center leading-relaxed pt-1">
                      💡 링크 전송 시 첨부해주신 <strong>PARTNER IN THINKING</strong> 썸네일 이미지와
                      지정 텍스트가 위와 같이 깔끔하게 표시됩니다.
                    </p>
                  </div>

                  {/* Right Column: Code Snippet & Instructions */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5C4533] uppercase tracking-wider">
                        💻 사이트 헤더에 적용된 메타태그
                      </span>
                      <button
                        onClick={handleCopySnsSnippet}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-[#33261C] hover:bg-[#201710] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>복사 완료!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>코드 복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Preformatted Code Block */}
                    <div className="p-3.5 bg-[#1C1611] text-[#E0D7CD] rounded-lg border border-[#3A2D23] font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[280px]">
                      <pre>
{`<!-- OpenGraph SNS Meta Tags -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="PARTNER IN THINKING" />
<meta property="og:title" content="Complexity to Clarity" />
<meta property="og:description" content="복잡한 세상 속, 얽힌 머릿속과 마음을 체계적으로 구조화하는 생각 파트너" />
<meta property="og:url" content="https://www.partnerinthinking.com" />
<meta property="og:image" content="https://www.partnerinthinking.com/og-image.png" />
<meta property="og:image:width" content="982" />
<meta property="og:image:height" content="507" />
<meta property="og:locale" content="ko_KR" />

<!-- Twitter / X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Complexity to Clarity" />
<meta name="twitter:description" content="복잡한 세상 속, 얽힌 머릿속과 마음을 체계적으로 구조화하는 생각 파트너" />
<meta name="twitter:image" content="https://www.partnerinthinking.com/og-image.png" />`}
                      </pre>
                    </div>

                    {/* Guide for Social Cache Clearing */}
                    <div className="p-3 bg-[#FAF6EE] rounded-lg border border-[#E0D4C2] text-xs text-[#524133] space-y-1.5">
                      <span className="font-bold text-[#3B2D22] block">
                        🔍 SNS 캐시 갱신 안내
                      </span>
                      <p className="text-[11.5px] leading-relaxed">
                        카카오톡이나 페이스북에서 이전 썸네일이 계속 보일 경우 각 플랫폼의 캐시 초기화 도구(카카오 디벨로퍼스 OG 캐시 삭제 / 페이스북 공유 디버거)를 통해 즉시 새 썸네일로 갱신할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Footer Information */}
            <div className="px-6 py-3 bg-[#F0E7D8] border-t border-[#DFD1BD] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#6E5948] shrink-0">
              <span>
                💡 모든 접수 데이터는 Firebase에 암호화 저장되며, 관리자 계정({ADMIN_EMAIL})으로 로그인한 경우에만 열람할 수 있습니다.
              </span>
              <a
                href="mailto:hello.partnerinthinking@gmail.com"
                className="font-bold text-[#33261C] hover:underline"
              >
                hello.partnerinthinking@gmail.com
              </a>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
