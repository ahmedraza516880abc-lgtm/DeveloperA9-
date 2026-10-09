import React, { useState } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Plus, 
  Layers, 
  Info,
  Smartphone,
  ShieldCheck,
  Link as LinkIcon,
  Clock,
  Sparkles
} from 'lucide-react';
import { AppCategory, AppItem } from '../types';
import { 
  uploadFile, 
  submitApp, 
  getUserApps,
  sanitizeText 
} from '../services/firebase';
import { 
  APP_CATEGORIES, 
  GAME_TAGS,
  MAX_UPLOADS_PER_DAY, 
  MAX_APK_SIZE_BYTES, 
  MAX_IMAGE_SIZE_BYTES,
  MAX_SCREENSHOTS_COUNT 
} from '../config.js';
import { useApp } from '../context/AppContext';

export const UploadView: React.FC = () => {
  const { currentUser, userProfile, isAdmin, setAuthModalOpen, navigateTo, language, t, showToast } = useApp();

  // Form Fields
  const [name, setName] = useState('');
  const [developerName, setDeveloperName] = useState(userProfile?.displayName || currentUser?.displayName || 'Independent Developer');
  const [category, setCategory] = useState<AppCategory>('Games');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Puzzle', 'Adventure']);
  const [customKeywords, setCustomKeywords] = useState('');
  const [youtubeTrailerUrl, setYoutubeTrailerUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [packageName, setPackageName] = useState('');
  const [whatsNew, setWhatsNew] = useState('');

  // Auto-Publish Option
  const [autoPublishMode, setAutoPublishMode] = useState<'pending' | 'auto_5min' | 'immediate'>('auto_5min');

  // APK source mode: 'file' or 'url'
  const [apkMode, setApkMode] = useState<'file' | 'url'>('file');
  const [apkDirectUrl, setApkDirectUrl] = useState('');

  // Files
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [apkFile, setApkFile] = useState<File | null>(null);

  // Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Guard: Not logged in
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t.uploadTitle}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          {t.loginSubtitle}
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20"
        >
          {t.signIn}
        </button>
      </div>
    );
  }

  // Handle Icon Select
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Icon must be an image file (PNG, JPG, WebP).');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setErrorMsg('Icon image must be less than 5 MB.');
        return;
      }
      setErrorMsg('');
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // Handle Screenshots Select (up to 9 images)
  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combined = [...screenshotFiles, ...newFiles].slice(0, MAX_SCREENSHOTS_COUNT);

      for (const f of newFiles) {
        if (!f.type.startsWith('image/')) {
          setErrorMsg('Screenshots must be image files.');
          return;
        }
        if (f.size > MAX_IMAGE_SIZE_BYTES) {
          setErrorMsg('Each screenshot must be under 5 MB.');
          return;
        }
      }

      setErrorMsg('');
      setScreenshotFiles(combined);
      setScreenshotPreviews(combined.map(f => URL.createObjectURL(f)));
    }
  };

  const removeScreenshot = (index: number) => {
    const updatedFiles = screenshotFiles.filter((_, i) => i !== index);
    setScreenshotFiles(updatedFiles);
    setScreenshotPreviews(updatedFiles.map(f => URL.createObjectURL(f)));
  };

  // Handle APK File Select
  const handleApkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isApk = file.name.toLowerCase().endsWith('.apk');
      if (!isApk) {
        setErrorMsg('File must have an .apk extension.');
        return;
      }
      if (file.size > MAX_APK_SIZE_BYTES) {
        setErrorMsg('Direct APK file must not exceed 100 MB. For larger games (GBs), please choose "Direct Download Link" option below.');
        return;
      }
      setErrorMsg('');
      setApkFile(file);
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Input sanitizations
    const cleanName = sanitizeText(name, 80);
    const cleanDevName = sanitizeText(developerName, 60);
    const cleanPkg = sanitizeText(packageName.toLowerCase(), 120);
    const cleanShortDesc = sanitizeText(shortDescription, 120);
    const cleanFullDesc = sanitizeText(fullDescription, 3000);
    const cleanVersion = sanitizeText(version, 20);
    const cleanWhatsNew = sanitizeText(whatsNew, 500);

    // Validations
    if (!cleanName || cleanName.length < 2) return setErrorMsg('App Name is required (minimum 2 characters).');
    if (!cleanPkg || !cleanPkg.includes('.')) return setErrorMsg('Valid package name required (e.g. com.example.game)');
    if (!iconFile) return setErrorMsg('Please choose an App Icon image.');
    
    if (apkMode === 'file' && !apkFile) {
      return setErrorMsg('Please select an Android APK file (.apk).');
    }
    if (apkMode === 'url' && (!apkDirectUrl.trim() || !apkDirectUrl.startsWith('http'))) {
      return setErrorMsg('Please enter a valid HTTP/HTTPS direct download URL.');
    }

    try {
      setIsUploading(true);
      setUploadPercent(15);
      setUploadStage('Checking daily limit and verifying parameters...');

      // Safe rate limit check: max 10 uploads per day
      try {
        const userApps = await getUserApps(currentUser.uid);
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const todayUploads = userApps.filter(a => a.createdAt > oneDayAgo);
        if (todayUploads.length >= MAX_UPLOADS_PER_DAY) {
          throw new Error(`You have reached the limit of ${MAX_UPLOADS_PER_DAY} uploads per day. Please try again tomorrow.`);
        }
      } catch (rateErr: any) {
        if (rateErr.message?.includes('reached the limit')) {
          throw rateErr;
        }
      }

      const tempAppId = 'app-' + Date.now();

      // 1. Upload Icon (Fast compressed data url)
      setUploadStage('Processing & optimizing App Icon...');
      setUploadPercent(35);
      const iconUrl = await uploadFile('apps', tempAppId, 'images', iconFile);
      setUploadPercent(50);

      // 2. Upload Screenshots (up to 9 images)
      const screenshotUrls: string[] = [];
      if (screenshotFiles.length > 0) {
        setUploadStage(`Processing ${screenshotFiles.length} screenshots...`);
        for (let i = 0; i < screenshotFiles.length; i++) {
          const url = await uploadFile('apps', tempAppId, 'images', screenshotFiles[i]);
          screenshotUrls.push(url);
          setUploadPercent(50 + Math.round(((i + 1) / screenshotFiles.length) * 25));
        }
      } else {
        screenshotUrls.push(iconUrl);
        setUploadPercent(75);
      }

      // 3. Upload APK or use Direct Link
      let apkUrl = '';
      let apkSize = 45 * 1024 * 1024;

      if (apkMode === 'file' && apkFile) {
        setUploadStage('Registering Android APK package archive...');
        setUploadPercent(80);
        apkUrl = await uploadFile('apps', tempAppId, 'apk', apkFile, (pct) => {
          setUploadPercent(80 + Math.round((pct / 100) * 12));
        });
        apkSize = apkFile.size;
        setUploadPercent(92);
      } else {
        setUploadStage('Validating direct game link...');
        apkUrl = apkDirectUrl.trim();
        apkSize = 1024 * 1024 * 1024; // 1GB+ representation
        setUploadPercent(92);
      }

      // Merge selected tags and custom keywords
      const additionalKeywords = customKeywords
        .split(',')
        .map(k => sanitizeText(k, 30))
        .filter(k => k.length > 0);

      const allTags = Array.from(new Set([...selectedTags, ...additionalKeywords]));

      // Determine initial publish status and schedule
      let initialStatus: 'pending' | 'approved' = 'pending';
      let scheduledPublishAt: number | undefined = undefined;

      if (autoPublishMode === 'immediate') {
        initialStatus = 'approved';
      } else if (autoPublishMode === 'auto_5min') {
        // Auto-publish after 5 minutes
        scheduledPublishAt = Date.now() + 5 * 60 * 1000;
        initialStatus = 'pending';
      } else {
        initialStatus = 'pending';
      }

      // 4. Save metadata to Firestore / Local catalog
      setUploadStage('Publishing to App Public Life catalog...');
      setUploadPercent(96);

      const appData: Omit<AppItem, 'id'> = {
        name: cleanName,
        category,
        shortDescription: cleanShortDesc,
        fullDescription: cleanFullDesc,
        version: cleanVersion || '1.0.0',
        packageName: cleanPkg,
        iconUrl,
        screenshots: screenshotUrls,
        apkUrl,
        apkSize,
        downloads: 0,
        rating: 5.0,
        reviewCount: 0,
        uploaderId: currentUser.uid,
        uploaderName: cleanDevName || currentUser.displayName || 'Independent Developer',
        status: initialStatus,
        publishAt: scheduledPublishAt,
        whatsNew: cleanWhatsNew || 'Initial release',
        minAndroidVersion: 'Android 8.0+',
        youtubeTrailerUrl: youtubeTrailerUrl.trim() || undefined,
        tags: allTags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        featured: false
      };

      await submitApp(appData);

      setUploadPercent(100);
      setUploadStage('Done!');

      showToast(
        language === 'ur' 
          ? (initialStatus === 'approved' 
              ? 'ایپ کامیابی کے ساتھ لائیو پبلک ہو گئی!' 
              : scheduledPublishAt 
              ? 'ایپ جمع ہو گئی! 5 منٹ بعد خود بخود پبلک ہو جائے گی۔' 
              : 'ایپ جمع ہو گئی! ایڈمن کی منظوری کے بعد پبلک ہو گی۔')
          : language === 'ja'
          ? (initialStatus === 'approved' 
              ? 'アプリが公開されました！' 
              : scheduledPublishAt 
              ? 'アプリが送信されました！5分後に自動公開されます。' 
              : 'アプリが送信されました！承認待ちです。')
          : language === 'hi' 
          ? (initialStatus === 'approved' 
              ? 'ऐप सफलतापूर्वक लाइव हो गया!' 
              : scheduledPublishAt 
              ? 'ऐप सबमिट हो गया! 5 मिनट बाद यह अपने आप लाइव हो जाएगा।' 
              : 'ऐप सबमिट हो गया! एडमिन अप्रूवल के बाद लाइव होगा।') 
          : (initialStatus === 'approved' 
              ? 'App published live successfully!' 
              : scheduledPublishAt 
              ? 'App submitted! Will auto-publish in 5 minutes.' 
              : 'App submitted successfully! Pending admin approval.')
      );

      navigateTo('my-apps');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload app. Please check network and files.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 pb-24 md:pb-12 space-y-6">
      
      {/* Title */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          {t.uploadTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.uploadSubtitle}
        </p>

        {/* Info banners */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{t.pendingNotice}</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-blue-800 dark:text-blue-200 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <span>{t.dailyLimitNotice}</span>
          </div>
        </div>
      </div>

      {/* Upload Progress Overlay (Smooth 0 -> 100%) */}
      {isUploading && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-emerald-300 dark:border-emerald-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-800 dark:text-gray-200">
            <span>{uploadStage}</span>
            <span className="text-emerald-600 font-bold text-sm">{uploadPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-emerald-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 text-xs sm:text-sm flex items-center gap-2.5 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
        
        {/* App Name & Developer Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.appNameLabel} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mystery Puzzle Quest"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Developer Name *
            </label>
            <input
              type="text"
              required
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              placeholder="e.g. Pro Gaming Studios"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category & YouTube Video Trailer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.categoryLabel} *
            </label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            >
              {APP_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'Puzzle' ? '🧩 Puzzle (पहेली / پزل)' : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              YouTube Video Trailer / Gameplay (Optional)
            </label>
            <input
              type="url"
              value={youtubeTrailerUrl}
              onChange={(e) => setYoutubeTrailerUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden text-xs"
            />
          </div>
        </div>

        {/* Game Tags & Keywords */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Category Tags (Select relevant tags like Puzzle, Adventure, Action)
          </label>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/80 mb-3">
            {GAME_TAGS.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    if (active) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                  }`}
                >
                  {tag} {active ? '✓' : '+'}
                </button>
              );
            })}
          </div>

          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Search Keywords (Comma-separated for top store search, e.g. puzzle, brain, adventure, 3d)
          </label>
          <input
            type="text"
            value={customKeywords}
            onChange={(e) => setCustomKeywords(e.target.value)}
            placeholder="e.g. puzzle, riddle, logic, adventure, top game, offline"
            className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden text-xs"
          />
        </div>

        {/* Package name & Version */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.packageLabel} *
            </label>
            <input
              type="text"
              required
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="e.g. com.studio.puzzlequest"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.versionLabel} *
            </label>
            <input
              type="text"
              required
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.shortDescLabel} *
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Engaging brain puzzle and logic adventure game."
            className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.fullDescLabel} *
          </label>
          <textarea
            required
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed overview of game levels, gameplay mechanisms, puzzle modes, offline support..."
            className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* What's new */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.whatsNewLabel}
          </label>
          <textarea
            rows={2}
            value={whatsNew}
            onChange={(e) => setWhatsNew(e.target.value)}
            placeholder="- Added 50 new puzzle stages&#10;- Improved UI & performance"
            className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* File 1: App Icon */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            {t.appIconLabel} *
          </label>
          <div className="flex items-center gap-4">
            {iconPreview ? (
              <div className="relative">
                <img
                  src={iconPreview}
                  alt="Icon Preview"
                  className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIconFile(null);
                    setIconPreview(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 transition">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Choose Icon (PNG/JPG, max 5MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* File 2: Screenshots (Up to 9 images) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Screenshots (Up to 9 images)
            </label>
            <span className="text-[11px] text-gray-400 font-semibold">
              {screenshotFiles.length} / 9 photos
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2.5 items-center">
            {screenshotPreviews.map((preview, idx) => (
              <div key={idx} className="relative">
                <img
                  src={preview}
                  alt={`Screenshot ${idx + 1}`}
                  className="w-20 h-28 object-cover rounded-xl shadow-xs border border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(idx)}
                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-600 text-white shadow-xs"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] text-white font-bold">
                  #{idx + 1}
                </span>
              </div>
            ))}

            {screenshotFiles.length < MAX_SCREENSHOTS_COUNT && (
              <label className="w-20 h-28 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 cursor-pointer text-gray-400 hover:text-emerald-600 transition">
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-[10px] text-center px-1 font-medium">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotsChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* File 3: APK Source (File upload OR Direct link for multi-GB games) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {t.apkFileLabel} *
            </label>
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setApkMode('file')}
                className={`px-3 py-1 rounded-md transition ${apkMode === 'file' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-xs' : 'text-gray-500'}`}
              >
                Upload File (.apk)
              </button>
              <button
                type="button"
                onClick={() => setApkMode('url')}
                className={`px-3 py-1 rounded-md transition ${apkMode === 'url' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-xs' : 'text-gray-500'}`}
              >
                Direct Link (Large Games / GBs)
              </button>
            </div>
          </div>

          {apkMode === 'file' ? (
            <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 cursor-pointer transition bg-gray-50/50 dark:bg-gray-800/30">
              <FileCode className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {apkFile ? apkFile.name : 'Select or drop .apk file here'}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                {apkFile ? `File Size: ${(apkFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Android Package Archive (.apk, Max 100 MB)'}
              </span>
              <input
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={handleApkChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <span>Direct Game Download Link (Unlimited GB Support)</span>
              </div>
              <input
                type="url"
                value={apkDirectUrl}
                onChange={(e) => setApkDirectUrl(e.target.value)}
                placeholder="https://github.com/user/repo/releases/download/v1.0.0/game.apk or Google Drive direct link"
                className="w-full p-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-gray-400">
                بڑی بڑی گیم جی بی (GBs) کی بھی ڈال سکتے ہیں — GitHub Releases, MediaFire, یا Cloud drive لنک کے ذریعے کوئی خرچ نہیں ہوگا اور لامحدود سائز سپورٹ ہوگا۔
              </p>
            </div>
          )}
        </div>

        {/* Auto-Publish Schedule Option */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
            Publishing Schedule (پبلک کرنے کا طریقہ)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAutoPublishMode('immediate')}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                autoPublishMode === 'immediate'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Instant Public (فوراً لائیو)</span>
            </button>

            <button
              type="button"
              onClick={() => setAutoPublishMode('auto_5min')}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                autoPublishMode === 'auto_5min'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Auto 5 Mins (5 منٹ بعد)</span>
            </button>

            <button
              type="button"
              onClick={() => setAutoPublishMode('pending')}
              className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                autoPublishMode === 'pending'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin Review (ایڈمن منظوری)</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 active:scale-99 transition disabled:opacity-50"
          >
            {isUploading ? 'Uploading & Registering...' : t.uploadButton}
          </button>
        </div>

      </form>

    </div>
  );
};
