import { AppItem, ReviewItem } from '../types';

/**
 * Clean slate by default: NO fake apps are public beforehand.
 * Real uploads go through: Upload -> Pending -> Admin Approve -> Live on Store.
 */
export const INITIAL_MOCK_APPS: AppItem[] = [];

export const INITIAL_MOCK_REVIEWS: Record<string, ReviewItem[]> = {};

/**
 * Optional sample apps that can be loaded on-demand by the admin for testing/preview.
 */
export const SAMPLE_PREVIEW_APPS: AppItem[] = [
  {
    id: "sample-adventure-craft",
    name: "Adventure Craft 3D",
    category: "Games",
    shortDescription: "Endless sandbox exploration, adventure crafting, and survival in vibrant voxel worlds.",
    fullDescription: "Step into an infinite procedurally generated voxel universe! Build castles, craft tools, tame pets, and explore dangerous dungeons. Features 60 FPS graphics, multiplayer servers, and offline play.",
    version: "1.0.0",
    packageName: "com.droidstore.adventurecraft",
    iconUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
    ],
    apkUrl: "https://github.com/octocat/Hello-World/raw/master/app-release.apk",
    apkSize: 45 * 1024 * 1024,
    downloads: 120,
    rating: 4.8,
    reviewCount: 15,
    uploaderId: "admin-seed",
    uploaderName: "Ahmed Studios",
    status: "approved",
    whatsNew: "- Initial store release\n- Full adventure quests and multiplayer",
    minAndroidVersion: "Android 8.0+",
    tags: ["Adventure", "Action", "Offline", "Multiplayer"],
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now(),
    featured: true
  }
];
