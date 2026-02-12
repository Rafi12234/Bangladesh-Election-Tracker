import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { NewsArticle, NewsArticleForm } from '@/types';

const COLLECTION_NAME = 'news';

// ============================================
// Public News Functions
// ============================================

/**
 * Get all published news articles
 */
export async function getPublishedNews(): Promise<NewsArticle[]> {
  try {
    const newsRef = collection(db, COLLECTION_NAME);
    const q = query(
      newsRef,
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsArticle));
  } catch (error) {
    console.error('Error fetching published news:', error);
    throw error;
  }
}

/**
 * Get a single news article by slug (published only)
 */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const newsRef = collection(db, COLLECTION_NAME);
    const q = query(
      newsRef,
      where('slug', '==', slug),
      where('status', '==', 'published'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as NewsArticle;
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    throw error;
  }
}

// ============================================
// Admin News Functions
// ============================================

/**
 * Get all news articles (for admin)
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const newsRef = collection(db, COLLECTION_NAME);
    const q = query(newsRef, orderBy('updatedAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsArticle));
  } catch (error) {
    console.error('Error fetching all news:', error);
    throw error;
  }
}

/**
 * Get a single news article by ID (for admin edit)
 */
export async function getNewsById(id: string): Promise<NewsArticle | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as NewsArticle;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    throw error;
  }
}

/**
 * Generate unique slug from headline
 */
export async function generateUniqueSlug(headline: string, excludeId?: string): Promise<string> {
  const baseSlug = headline
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists
  while (await slugExists(slug, excludeId)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return slug;
}

/**
 * Check if slug already exists
 */
async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  try {
    const newsRef = collection(db, COLLECTION_NAME);
    const q = query(newsRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (excludeId) {
      // Filter out the document we're updating
      return snapshot.docs.some(doc => doc.id !== excludeId);
    }
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking slug existence:', error);
    return false;
  }
}

/**
 * Create a new news article
 */
export async function createNews(data: NewsArticleForm, authorId: string): Promise<string> {
  try {
    const slug = await generateUniqueSlug(data.headline);
    const now = serverTimestamp();
    
    const newsData: Omit<NewsArticle, 'id'> = {
      ...data,
      slug,
      publishedAt: data.status === 'published' ? now as Timestamp : undefined,
      createdAt: now as Timestamp,
      updatedAt: now as Timestamp,
      authorId
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newsData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
}

/**
 * Update an existing news article
 */
export async function updateNews(id: string, data: NewsArticleForm): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const existingDoc = await getDoc(docRef);
    
    if (!existingDoc.exists()) {
      throw new Error('News article not found');
    }
    
    const existingData = existingDoc.data() as NewsArticle;
    const slug = await generateUniqueSlug(data.headline, id);
    
    const updateData: Partial<NewsArticle> = {
      ...data,
      slug,
      updatedAt: serverTimestamp() as Timestamp,
      // Set publishedAt only if status is changing from draft to published
      ...(data.status === 'published' && existingData.status === 'draft' && {
        publishedAt: serverTimestamp() as Timestamp
      })
    };
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
}

/**
 * Delete a news article
 */
export async function deleteNews(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
}

/**
 * Get news articles with optional status filter
 */
export async function getNewsByStatus(status?: 'draft' | 'published'): Promise<NewsArticle[]> {
  try {
    const newsRef = collection(db, COLLECTION_NAME);
    let q;
    
    if (status) {
      q = query(newsRef, where('status', '==', status), orderBy('updatedAt', 'desc'));
    } else {
      q = query(newsRef, orderBy('updatedAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsArticle));
  } catch (error) {
    console.error('Error fetching news by status:', error);
    throw error;
  }
}