export interface Post {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  publishedAt: string;
  slug: string;
  externalUrl?: string;
}

export interface Credential {
  id?: string;
  title: string;
  organization: string;
  year: string;
  order: number;
  description?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  primaryColor: string;
  fontFamily: string;
}
