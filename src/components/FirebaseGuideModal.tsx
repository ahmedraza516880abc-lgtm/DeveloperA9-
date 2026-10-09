import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, Database, HardDrive, Globe, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FirebaseGuideModal: React.FC = () => {
  const { guideModalOpen, setGuideModalOpen, language } = useApp();
  const [copiedRules, setCopiedRules] = useState<'firestore' | 'storage' | null>(null);

  if (!guideModalOpen) return null;

  const handleCopy = (type: 'firestore' | 'storage', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRules(type);
    setTimeout(() => setCopiedRules(null), 2500);
  };

  const firestoreRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == "ahmeda9a99a9@gmail.com" ||
        request.auth.token.email == "proboizgaming122@gmail.com"
      );
    }

    function isNotBanned() {
      return isSignedIn() && (!exists(/databases/$(database)/documents/banned_users/$(request.auth.uid)));
    }

    match /{document=**} {
      allow read, write: if false;
    }

    match /test/connection {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /users/{userId} {
      allow read: if true;
      allow create, update: if isOwner(userId) && isNotBanned();
      allow delete: if isOwner(userId) || isAdmin();
    }

    match /users_private/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if (isOwner(userId) && isNotBanned()) || isAdmin();
    }

    match /apps/{appId} {
      allow read: if resource.data.status == 'approved' ||
                     (isSignedIn() && resource.data.uploaderId == request.auth.uid) ||
                     isAdmin();

      allow create: if isSignedIn() && isNotBanned() &&
                       request.resource.data.uploaderId == request.auth.uid &&
                       request.resource.data.status == 'pending';

      allow update: if isAdmin() ||
                       (isSignedIn() && isNotBanned() && resource.data.uploaderId == request.auth.uid &&
                        request.resource.data.status == 'pending') ||
                       (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['downloads']) &&
                        request.resource.data.downloads >= resource.data.downloads);

      allow delete: if isAdmin() || (isSignedIn() && resource.data.uploaderId == request.auth.uid);

      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if isSignedIn() && isNotBanned() &&
                         reviewId == request.auth.uid &&
                         request.resource.data.userId == request.auth.uid &&
                         request.resource.data.rating >= 1 &&
                         request.resource.data.rating <= 5;
        allow update: if isSignedIn() && isNotBanned() &&
                         resource.data.userId == request.auth.uid &&
                         request.resource.data.userId == request.auth.uid;
        allow delete: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      }
    }

    match /reports/{reportId} {
      allow read: if isAdmin();
      allow create: if isSignedIn() && isNotBanned() &&
                       request.resource.data.reporterId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    match /banned_users/{userId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}`;

  const storageRulesText = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == "ahmeda9a99a9@gmail.com" ||
        request.auth.token.email == "proboizgaming122@gmail.com"
      );
    }

    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if (isSignedIn() && request.auth.uid == userId &&
                      request.resource.size <= 2 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*')) || isAdmin();
      allow delete: if (isSignedIn() && request.auth.uid == userId) || isAdmin();
    }

    match /users/{userId}/apps/{appId}/{subFolder}/{fileName} {
      allow read: if true;
      allow write: if (subFolder == 'images' &&
                      isSignedIn() && request.auth.uid == userId &&
                      request.resource.size <= 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*')) ||
                     (subFolder == 'apk' &&
                      isSignedIn() && request.auth.uid == userId &&
                      request.resource.size <= 100 * 1024 * 1024 &&
                      (request.resource.contentType.matches('application/.*') ||
                       request.resource.contentType.matches('binary/.*') ||
                       request.resource.name.matches('.*\\\\.[aA][pP][kK]'))) || isAdmin();
      allow delete: if (isSignedIn() && request.auth.uid == userId) || isAdmin();
    }

    match /apps/{appId}/images/{allPaths=**} {
      allow read: if true;
      allow write: if (isSignedIn() &&
                      request.resource.size <= 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*')) || isAdmin();
      allow delete: if isSignedIn() || isAdmin();
    }

    match /apps/{appId}/apk/{allPaths=**} {
      allow read: if true;
      allow write: if (isSignedIn() &&
                      request.resource.size <= 100 * 1024 * 1024 &&
                      (request.resource.contentType.matches('application/.*') ||
                       request.resource.contentType.matches('binary/.*') ||
                       request.resource.name.matches('.*\\\\.[aA][pP][kK]'))) || isAdmin();
      allow delete: if isSignedIn() || isAdmin();
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {language === 'hi' ? 'Firebase और GitHub Pages आसान सेटअप गाइड' : 'Firebase & Deployment Setup Guide'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin Email: ahmeda9a99a9@gmail.com
              </p>
            </div>
          </div>
          <button
            onClick={() => setGuideModalOpen(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-5 space-y-6 text-sm text-gray-700 dark:text-gray-300 pr-2">
          
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>1.</span> Firebase प्रोजेक्ट बनाएं (Create Firebase Project)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium inline-flex items-center gap-1">
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a> पर जाएं और <strong>"Add project"</strong> पर क्लिक करें। अपने प्रोजेक्ट का नाम DroidStore रखें और Create Project करें।
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>2.</span> Authentication सक्षम करें (Google + Email/Password)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Left menu में <strong>Build &gt; Authentication</strong> पर जाएं। <strong>Get Started</strong> दबाएं। <strong>Sign-in method</strong> में:
              <br />• <strong>Email/Password</strong> चालू (Enable) करें।
              <br />• <strong>Google</strong> चालू (Enable) करें और Support email में अपना Gmail चुनें।
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>3.</span> Cloud Firestore और Storage (Blaze Plan & Budget Alert)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              • <strong>Firestore Database</strong> पर जाएं &gt; Create Database &gt; Start in production mode &gt; Region चुनें।
              <br />• <strong>Storage</strong> पर जाएं &gt; Get Started &gt; Done करें।
              <br />• <em>Storage Billing Note:</em> Firebase Storage में 5 GB मुफ्त स्टोरेज और 1 GB/दिन मुफ्त डाउनलोड मिलता है। बड़े APK फाइल्स (100MB+) के लिए Blaze (Pay-as-you-go) आवश्यक हो सकता है। 
              <br />• <strong>Budget Alert:</strong> GCP Console &gt; Billing &gt; Budgets & Alerts में जाकर $1 (या ₹100) का अलर्ट सेट कर लें ताकि कोई भी अनपेक्षित खर्च न हो।
              <br />• <strong>Free Alternative (बिना बिलिंग का विकल्प):</strong> डेवलपर ऐप अपलोड करते समय APK फ़ाइल की जगह <em>GitHub Releases</em> या <em>Google Drive Direct Link</em> का URL भी डाल सकते हैं, जो बिल्कुल मुफ्त और असीमित डाउनलोड क्षमता वाला है!
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>4.</span> Authorized Domains में App URL जोड़ें
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Firebase Console &gt; <strong>Authentication &gt; Settings &gt; Authorized domains</strong> में जाएं। <strong>"Add domain"</strong> दबाएं और यह दोनों डोमेन जोड़ें:
              <br />• <code>*.run.app</code>
              <br />• <code>*.ai.studio</code>
              <br />• अपना GitHub Pages डोमेन (उदा. <code>yourusername.github.io</code>)
            </p>
          </div>

          {/* Step 5 Rules */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span>5.</span> Firestore और Storage Rules
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Admin ईमेल <code>ahmeda9a99a9@gmail.com</code> इन रूल्स में सख्त रूप से लागू (enforced) है। नीचे से कॉपी करके अपने Firebase Console में पेस्ट करें:
            </p>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleCopy('firestore', firestoreRulesText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                {copiedRules === 'firestore' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Firestore Rules</span>
              </button>

              <button
                onClick={() => handleCopy('storage', storageRulesText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 text-white dark:bg-gray-700 text-xs font-semibold hover:bg-gray-900 transition"
              >
                {copiedRules === 'storage' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Storage Rules</span>
              </button>
            </div>
          </div>

          {/* Step 6 App Check */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1.5">
              <span>6.</span> Firebase App Check (reCAPTCHA v3) सक्रिय करना
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              1. Google reCAPTCHA v3 कंसोल में जाकर अपनी साइट डोमेन के लिए Site Key बनाएं।
              <br />2. Firebase Console &gt; <strong>App Check &gt; Apps</strong> में जाएं &gt; Web App चुनें &gt; <strong>reCAPTCHA v3</strong> सिलेक्ट करें और अपनी secret key सेव करें।
              <br />3. ऐप में <code>VITE_RECAPTCHA_SITE_KEY</code> में अपनी Site Key प्रदान करें।
            </p>
          </div>

        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={() => setGuideModalOpen(false)}
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            {language === 'hi' ? 'समझ गया (Close)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
