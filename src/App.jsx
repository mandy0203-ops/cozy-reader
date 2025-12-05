
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import {
  Pause, Play, ArrowLeft, Settings, List, Sparkles, SkipBack, SkipForward,
  Laptop, AlertCircle, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import booksData from './data/books.json';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const WashiTape = ({ color = "bg-pink", rotate = "-rotate-45", className }) => (
  <div
    className={cn(
      "absolute h-6 w-24 opacity-90 shadow-sm z-10 pointer-events-none",
      color,
      rotate,
      className
    )}
    style={{
      clipPath: "polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)",
      maskImage: "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='black'/%3E%3C/svg%3E\")"
    }}
  >
    <div className="w-full h-full bg-white/20 bg-[length:4px_4px] bg-repeat" />
  </div>
);

const Doodle = ({ type, className, color = "text-pink-300" }) => {
  const doodles = {
    star: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    sparkle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    ),
    flower: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3zm0 14a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3zm7-7a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3zM5 9a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    cat: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5c2.5 0 4.5 1.5 5.5 3.5.5-1 1.5-2 2.5-2s2 1 2.5 2c1 2 1.5 4 1.5 6 0 3.5-2.5 6-5.5 6H5.5C2.5 20.5 0 18 0 14.5c0-2 .5-4 1.5-6 .5-1 1.5-2 2.5-2s2 1 2.5 2c1-2 3-3.5 5.5-3.5z" />
        <path d="M9 13l1 1 1-1" />
        <path d="M13 13l1 1 1-1" />
        <path d="M12 16v1" />
      </svg>
    ),
    sun: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    )
  };
  return (
    <div className={cn("absolute pointer-events-none opacity-60", color, className)}>
      <div className="w-full h-full animate-pulse">
        {doodles[type] || doodles.star}
      </div>
    </div>
  );
};

const CuteProgressBar = ({ progress }) => (
  <div className="w-full h-8 flex items-center relative group cursor-pointer">
    {/* Background Line */}
    <div className="absolute w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
      <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWwxOCAxOE0xOSAxTDEgMTkiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')]"></div>
    </div>

    {/* Filled Line (Wobbly) */}
    <motion.div
      className="absolute h-3 bg-pink-300 rounded-full border border-pink-400/50"
      style={{
        width: `${progress}%`,
        borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px"
      }}
      layoutId="progressBar"
    />

    {/* Cute Thumb Icon */}
    <motion.div
      className="absolute w-8 h-8 -ml-4 flex items-center justify-center z-10 drop-shadow-md"
      style={{ left: `${progress}%` }}
      whileHover={{ scale: 1.2, rotate: 15 }}
    >
      <span className="text-xl filter drop-shadow-sm">🌸</span>
    </motion.div>
  </div>
);

const HandDrawnButton = ({ onClick, children, active, className, size = "md" }) => {
  const sizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1, rotate: Math.random() * 6 - 3 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "relative flex items-center justify-center transition-colors",
        sizes[size],
        className
      )}
    >
      <div className={cn(
        "absolute inset-0 border-2 rounded-full transition-all duration-300",
        active ? "bg-pink-100 border-pink-400 rotate-2" : "bg-white border-gray-300 hover:border-pink-300",
        "hand-drawn-border"
      )}
        style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
      />
      <div className="relative z-10 text-gray-600">
        {children}
      </div>
    </motion.button>
  );
};

// --- Storage Utils ---
const STORAGE_KEY = 'cozy_reader_progress';

const saveProgress = (bookId, chapter, paragraph) => {
  const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  progress[bookId] = { chapter, paragraph, timestamp: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

const getProgress = (bookId) => {
  const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return progress[bookId];
};

const getAllProgress = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
};

const exportProgress = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cozy-reader-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const importProgress = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // Basic validation
      if (typeof data === 'object') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        alert('Backup restored successfully! Please refresh the page.');
        window.location.reload();
      } else {
        alert('Invalid backup file.');
      }
    } catch (err) {
      console.error('Import failed', err);
      alert('Failed to parse backup file.');
    }
  };
  reader.readAsText(file);
};

const BookCard = ({ book, progress }) => {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
      className="group relative flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300"
    >
      {/* Cover Image Area - Focus on clarity */}
      <div className="relative aspect-[3/4] w-full bg-gray-50 overflow-hidden border-b border-gray-50">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Overlay Gradient for text contrast if needed, but keeping it clean for now */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Progress Bar - Functional & Minimal */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200/50 backdrop-blur-sm">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* New Badge - Minimalist & Clear */}
        {!progress && book.id % 3 === 0 && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-2 py-1 rounded shadow-sm tracking-wide">
            NEW
          </div>
        )}
      </div>

      {/* Content Area - Left aligned for readability (Z-pattern scanning) */}
      <div className="p-4 flex flex-col flex-1 bg-white">
        {/* Title - High contrast, clear hierarchy */}
        <h3
          className="font-bold text-gray-800 text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:text-pink-600 transition-colors"
          title={book.title}
        >
          {book.title}
        </h3>

        {/* Author - Secondary information, distinct color */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-4 font-medium" title={book.author}>
          {book.author}
        </p>

        {/* Meta/Action - Pushed to bottom to align cards */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
          {progress > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {Math.round(progress)}% read
            </div>
          ) : (
            <span className="text-xs text-gray-400 font-medium group-hover:text-gray-600 transition-colors">Start reading</span>
          )}

          {/* Subtle Arrow Icon */}
          <div className="text-gray-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all">
            <ArrowLeft className="rotate-180 w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const [allProgress, setAllProgress] = useState({});

  useEffect(() => {
    setAllProgress(getAllProgress());
  }, []);

  const getBookProgress = (bookId) => {
    // This is an estimation since we don't have total paragraphs here easily without loading every book.
    // For now, we visualize that there IS progress.
    // Ideally, we'd store 'totalParagraphs' in the progress object when we visit the reader.
    const p = allProgress[bookId];
    return p ? (p.percentage || 0) : 0;
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Doodles */}
      <Doodle type="cloud" className="top-10 left-10 w-16 h-16 text-blue-100" />
      <Doodle type="sun" className="top-20 right-20 w-12 h-12 text-yellow-100 animate-spin-slow" />
      <Doodle type="flower" className="bottom-20 left-20 w-10 h-10 text-pink-100" />
      <Doodle type="cat" className="bottom-10 right-10 w-14 h-14 text-gray-200" />

      <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 relative z-10">
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-hand text-text relative z-10 flex items-center gap-4">
            My Cozy Library
            <span className="text-4xl animate-bounce">☁️</span>
          </h1>
          <div className="absolute -bottom-2 left-0 w-full h-3 bg-green/30 -rotate-1 rounded-full -z-0" />
        </div>

        <div className="flex gap-4">
          <button className="btn-hand bg-green text-white px-6 py-2 rounded-full border-2 border-transparent shadow-md hover:opacity-90 flex items-center gap-2 text-sm">
            + Add Book
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-12 px-2 relative z-10">
        {booksData.map((book) => (
          <Link to={`/book/${book.id}`} key={book.id} className="no-underline block h-full">
            <BookCard book={book} progress={getBookProgress(book.id)} />
          </Link>
        ))}
      </div>
    </div>
  );
};

const ReaderPage = () => {
  const { id } = useParams();
  const book = booksData.find(b => b.id === parseInt(id));

  // --- State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('chapters'); // 'chapters' or 'settings'
  const [showControls, setShowControls] = useState(true);
  const [theme, setTheme] = useState('cream');
  const [fontSize, setFontSize] = useState(20);

  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Content
  const [bookContent, setBookContent] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs
  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const contentRef = useRef(null);
  const activeParagraphRef = useRef(null);
  const fileInputRef = useRef(null); // For import

  // --- Initialization ---

  // Load Browser Voices (Strictly Taiwan/Mac)
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = synth.getVoices();

      const zhVoices = allVoices.filter(v =>
        v.lang.includes('zh-TW') || v.lang.includes('zh-HK') || v.name.includes('Meijia') || v.name.includes('Sin-ji')
      );

      zhVoices.sort((a, b) => {
        const aScore = (a.name.includes('Meijia') ? 2 : 0) + (a.name.includes('Enhanced') ? 1 : 0);
        const bScore = (b.name.includes('Meijia') ? 2 : 0) + (b.name.includes('Enhanced') ? 1 : 0);
        return bScore - aScore;
      });

      setAvailableVoices(zhVoices);

      if (!selectedVoice && zhVoices.length > 0) {
        setSelectedVoice(zhVoices[0].name);
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  // Load Book Content & Progress
  useEffect(() => {
    if (book?.contentPath) {
      setLoading(true);
      setErrorMsg(null);

      console.log(`Loading book content from: ${book.contentPath}`);

      fetch(book.contentPath)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log(`Loaded ${data.length} chapters`);
          if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Book content is empty or invalid");
          }
          const processed = data.map(chapter => ({
            ...chapter,
            paragraphs: chapter.text ? chapter.text.split('\n').filter(p => p.trim().length > 0) : []
          }));
          setBookContent(processed);

          // Restore Progress
          const saved = getProgress(book.id);
          if (saved) {
            setCurrentChapterIndex(saved.chapter || 0);
            setCurrentParagraphIndex(saved.paragraph || 0);
          } else {
            setCurrentChapterIndex(0);
            setCurrentParagraphIndex(0);
          }

          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load book content:", err);
          setErrorMsg(`Failed to load book: ${err.message}`);
          setLoading(false);
        });
    }
    return () => {
      synth.cancel();
    };
  }, [book]);

  // Save Progress
  useEffect(() => {
    if (book && bookContent.length > 0) {
      const totalParagraphs = bookContent.reduce((acc, ch) => acc + (ch.paragraphs?.length || 0), 0);
      const currentTotalP = bookContent.slice(0, currentChapterIndex).reduce((acc, ch) => acc + (ch.paragraphs?.length || 0), 0) + currentParagraphIndex;
      const percentage = totalParagraphs > 0 ? (currentTotalP / totalParagraphs) * 100 : 0;

      const timer = setTimeout(() => {
        saveProgress(book.id, currentChapterIndex, currentParagraphIndex);
        // Update percentage in storage too for HomePage
        const p = getAllProgress();
        if (p[book.id]) {
          p[book.id].percentage = percentage;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentChapterIndex, currentParagraphIndex, book, bookContent]);

  // Scroll active paragraph
  useEffect(() => {
    if (activeParagraphRef.current && showControls) {
      activeParagraphRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentParagraphIndex, currentChapterIndex]);

  // --- Playback Logic ---

  const playText = (text, onEndCallback) => {
    setErrorMsg(null);
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      const voice = availableVoices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    } else {
      utterance.lang = 'zh-TW';
    }

    utterance.rate = rate;
    utterance.onend = onEndCallback;
    utterance.onerror = (e) => {
      console.error("TTS Error", e);
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        setErrorMsg("Playback error. Click to retry.");
        setIsPlaying(false);
      }
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  // Dynamic Rate Adjustment
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying && !isIntroPlaying) {
        if (utteranceRef.current) {
          utteranceRef.current.onend = null;
        }
        synth.cancel();
        playChapterParagraph(currentChapterIndex, currentParagraphIndex);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [rate]);

  const playIntro = () => {
    setIsIntroPlaying(true);
    setIsPlaying(true);
    const introText = `嗨，歡迎收聽本集的說書節目。今天要為大家介紹的這本書是《${book.title}》。這本書的作者是${book.author}。這是一本非常值得一讀的好書，讓我們一起來聽聽看吧！`;
    playText(introText, () => {
      setIsIntroPlaying(false);
      playChapterParagraph(currentChapterIndex, 0);
    });
  };

  const playChapterParagraph = (cIndex, pIndex) => {
    if (!bookContent[cIndex]) return;
    const paragraphs = bookContent[cIndex].paragraphs;

    if (pIndex >= paragraphs.length) {
      if (cIndex < bookContent.length - 1) {
        setCurrentChapterIndex(cIndex + 1);
        setCurrentParagraphIndex(0);
        playChapterParagraph(cIndex + 1, 0);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    setCurrentChapterIndex(cIndex);
    setCurrentParagraphIndex(pIndex);
    setIsPlaying(true);

    const text = paragraphs[pIndex];
    playText(text, () => {
      if (isPlaying) {
        playChapterParagraph(cIndex, pIndex + 1);
      }
    });
  };

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      setIsIntroPlaying(false);
    } else {
      setIsPlaying(true);
      if (isIntroPlaying) {
        playIntro();
      } else {
        playChapterParagraph(currentChapterIndex, currentParagraphIndex);
      }
    }
  };

  const handleParagraphClick = (cIndex, pIndex) => {
    synth.cancel();
    setIsIntroPlaying(false);
    setCurrentChapterIndex(cIndex);
    setCurrentParagraphIndex(pIndex);
    setIsPlaying(true);
    playChapterParagraph(cIndex, pIndex);
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < bookContent.length - 1) {
      handleParagraphClick(currentChapterIndex + 1, 0);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      handleParagraphClick(currentChapterIndex - 1, 0);
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevChapter();
      } else if (e.key === 'ArrowRight') {
        handleNextChapter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex]);

  // --- Theme ---
  const themeStyles = {
    cream: { bg: 'bg-[#FDFBF7]', text: 'text-[#5A5A5A]', paper: 'bg-white', border: 'border-gray-200', highlight: 'bg-yellow-100' },
    dark: { bg: 'bg-[#1a1b1e]', text: 'text-gray-300', paper: 'bg-[#25262b]', border: 'border-gray-700', highlight: 'bg-gray-700' },
    sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#5c4b37]', paper: 'bg-[#fdf6e3]', border: 'border-[#d3c4a9]', highlight: 'bg-[#e6dcc6]' },
  };
  const t = themeStyles[theme];

  if (!book) return <div className="p-8 text-center font-hand text-2xl">Book not found! 🍂</div>;

  const currentChapter = bookContent[currentChapterIndex];
  const totalParagraphs = bookContent.reduce((acc, ch) => acc + (ch.paragraphs?.length || 0), 0);
  const currentTotalP = bookContent.slice(0, currentChapterIndex).reduce((acc, ch) => acc + (ch.paragraphs?.length || 0), 0) + currentParagraphIndex;
  const progressPercent = totalParagraphs > 0 ? (currentTotalP / totalParagraphs) * 100 : 0;

  return (
    <div className={cn("h-screen flex flex-col overflow-hidden transition-colors duration-300 font-main relative", t.bg, t.text)}>

      {/* Background Doodles (Reader) */}
      <Doodle type="cloud" className="top-20 -left-10 w-24 h-24 text-blue-50/50 pointer-events-none" />
      <Doodle type="sun" className="top-10 right-10 w-16 h-16 text-yellow-50/50 animate-spin-slow pointer-events-none" />
      <Doodle type="cat" className="bottom-40 -right-6 w-20 h-20 text-gray-100/50 pointer-events-none rotate-12" />

      {/* Floating Navigation Buttons (Desktop) */}
      <div className="hidden md:block absolute top-1/2 left-4 z-20 -translate-y-1/2">
        <HandDrawnButton onClick={handlePrevChapter} size="md" className="opacity-50 hover:opacity-100">
          <ChevronLeft size={24} />
        </HandDrawnButton>
      </div>
      <div className="hidden md:block absolute top-1/2 right-4 z-20 -translate-y-1/2">
        <HandDrawnButton onClick={handleNextChapter} size="md" className="opacity-50 hover:opacity-100">
          <ChevronRight size={24} />
        </HandDrawnButton>
      </div>

      {/* Top Bar */}
      <div className={cn("h-14 flex items-center px-4 justify-between shrink-0 z-20 border-b", t.bg, t.border)}>
        <Link to="/" className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="font-bold text-sm truncate max-w-[200px]">{book.title}</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-black/5 transition-colors relative"
        >
          <Settings size={20} />
          {errorMsg && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
        </button>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold"
          >
            <AlertCircle size={14} />
            {errorMsg}
            <button onClick={() => setErrorMsg(null)}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings/Menu Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-16 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Tabs */}
              <div className="flex border-b bg-gray-50">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors", activeTab === 'chapters' ? "text-pink-500 bg-white border-b-2 border-pink-500" : "text-gray-400 hover:text-gray-600")}
                >
                  Chapters
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors", activeTab === 'settings' ? "text-pink-500 bg-white border-b-2 border-pink-500" : "text-gray-400 hover:text-gray-600")}
                >
                  Settings
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {activeTab === 'chapters' ? (
                  <div className="space-y-2">
                    {bookContent.map((chapter, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleParagraphClick(idx, 0);
                          setShowSettings(false);
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-lg text-sm transition-all border-2",
                          currentChapterIndex === idx
                            ? "bg-pink-50 border-pink-200 text-pink-700 font-bold shadow-sm"
                            : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100 text-gray-600"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="line-clamp-1">{chapter.title}</span>
                          {currentChapterIndex === idx && <Sparkles size={12} />}
                        </div>
                      </button>
                    ))}
                    {bookContent.length === 0 && <div className="text-center text-gray-400 py-8">No chapters found</div>}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Backup & Restore */}
                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                      <h4 className="text-xs font-bold text-pink-600 uppercase mb-3 flex items-center gap-2">
                        <Cloud size={14} /> Backup & Restore
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={exportProgress}
                          className="flex-1 bg-white border border-pink-200 text-pink-600 py-2 rounded-lg text-xs font-bold hover:bg-pink-50 transition-colors"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 bg-pink-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-pink-600 transition-colors"
                        >
                          Import
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={importProgress}
                          className="hidden"
                          accept=".json"
                        />
                      </div>
                    </div>

                    {/* Voice Selector (Mac Only) */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-xs bg-white p-2 border rounded text-blue-600 font-bold mb-2">
                        <Laptop size={14} />
                        <span>Mac System Voices</span>
                      </div>
                      <select
                        className="w-full text-sm p-2 border rounded-lg bg-white"
                        value={selectedVoice || ""}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                      >
                        {availableVoices.map(v => (
                          <option key={v.name} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400 mt-2">
                        Tip: Go to <b>System Settings &gt; Accessibility &gt; Spoken Content</b> to download "Enhanced" voices (e.g., Meijia) for best quality.
                      </p>
                    </div>

                    {/* Speed */}
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Speed: {rate}x</label>
                      <input
                        type="range" min="0.5" max="2" step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full accent-pink-500"
                      />
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Theme</label>
                      <div className="flex gap-2">
                        {['cream', 'sepia', 'dark'].map(mode => (
                          <button
                            key={mode}
                            onClick={() => setTheme(mode)}
                            className={cn(
                              "flex-1 py-2 rounded-lg border-2 capitalize text-xs font-bold",
                              theme === mode ? "border-pink-500" : "border-transparent bg-gray-100"
                            )}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Size</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">A</span>
                        <input
                          type="range" min="16" max="32" step="2"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="flex-1 accent-pink-500"
                        />
                        <span className="text-lg">A</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative scroll-smooth" ref={contentRef}>
        {loading ? (
          <div className="flex h-full items-center justify-center opacity-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-6 py-12 md:py-20 min-h-full">
            <h2 className="text-3xl font-bold mb-12 text-center font-hand opacity-80">{currentChapter?.title}</h2>

            <div className="space-y-6">
              {currentChapter?.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  ref={currentParagraphIndex === idx ? activeParagraphRef : null}
                  onClick={() => handleParagraphClick(currentChapterIndex, idx)}
                  className={cn(
                    "leading-loose transition-colors duration-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-black/5",
                    currentParagraphIndex === idx && isPlaying ? t.highlight : ""
                  )}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-20 mb-10 text-center">
              <div className="opacity-30 text-sm mb-6">End of Chapter</div>
              {currentChapterIndex < bookContent.length - 1 && (
                <HandDrawnButton
                  onClick={() => {
                    handleNextChapter();
                    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mx-auto w-48 h-12 text-sm font-bold"
                >
                  Next Chapter <ArrowLeft className="rotate-180 ml-2" size={16} />
                </HandDrawnButton>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Player Bar */}
      <div className={cn("h-32 border-t shrink-0 flex flex-col px-6 pb-6 pt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 relative overflow-hidden", t.paper, t.border)}>

        {/* Decorative Doodles */}
        <Doodle type="star" className="top-2 left-10 w-4 h-4 text-yellow-300 rotate-12" />
        <Doodle type="heart" className="bottom-4 right-10 w-5 h-5 text-pink-200 -rotate-12" />
        <Doodle type="sparkle" className="top-4 right-1/4 w-3 h-3 text-blue-200" />

        {/* Progress Slider */}
        <div className="w-full flex items-center gap-4 mb-4 relative z-10">
          <span className="text-xs font-hand font-bold opacity-50 w-10 text-right">{Math.round(progressPercent)}%</span>
          <div className="flex-1 mx-2">
            <CuteProgressBar progress={progressPercent} />
          </div>
          <span className="text-xs font-hand font-bold opacity-50 w-10 text-left">100%</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between max-w-lg mx-auto w-full relative z-10">
          <button
            onClick={playIntro}
            className={cn(
              "flex flex-col items-center gap-1 text-xs font-bold transition-colors group",
              isIntroPlaying ? "text-pink-500" : "opacity-40 hover:opacity-80"
            )}
          >
            <div className="p-2 rounded-full bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
              <Sparkles size={18} className={isIntroPlaying ? "animate-spin-slow" : ""} />
            </div>
            <span className="font-hand">Intro</span>
          </button>

          <div className="flex items-center gap-6">
            <HandDrawnButton onClick={handlePrevChapter} size="sm">
              <SkipBack size={18} fill="currentColor" className="opacity-70" />
            </HandDrawnButton>

            <HandDrawnButton
              onClick={togglePlay}
              size="lg"
              active={isPlaying}
              className="text-pink-500"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </HandDrawnButton>

            <HandDrawnButton onClick={handleNextChapter} size="sm">
              <SkipForward size={18} fill="currentColor" className="opacity-70" />
            </HandDrawnButton>
          </div>

          <button
            onClick={() => {
              setShowSettings(true);
              setActiveTab('chapters');
            }}
            className="flex flex-col items-center gap-1 text-xs font-bold opacity-40 hover:opacity-80 transition-colors group"
          >
            <div className="p-2 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
              <List size={18} />
            </div>
            <span className="font-hand">Menu</span>
          </button>
        </div>
      </div>

    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:id" element={<ReaderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
