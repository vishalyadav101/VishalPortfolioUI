import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BlogPost {
  blogPostId: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  content: string;
  featuredImageUrl: string | null;
  category: string | null;
  tags: string | null;
  publishedDate: string;
  isPublished: boolean;
  displayOrder: number;
  createdDate: string;
  updatedDate: string | null;
}

export interface BlogPostCreateRequest {
  title: string;
  slug: string;
  shortDescription: string | null;
  content: string;
  featuredImageUrl: string | null;
  category: string | null;
  tags: string | null;
  publishedDate: string;
  isPublished: boolean;
  displayOrder: number;
}

export interface BlogPostUpdateRequest {
  title: string;
  slug: string;
  shortDescription: string | null;
  content: string;
  featuredImageUrl: string | null;
  category: string | null;
  tags: string | null;
  publishedDate: string;
  isPublished: boolean;
  displayOrder: number;
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://vishalportfolioapi.onrender.com/api/BlogPost';

  // ==========================================
  // GET ALL
  // ==========================================

  getBlogs(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(this.apiUrl);
  }

  // ==========================================
  // GET BY ID
  // ==========================================

  getBlogById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // GET BY SLUG
  // ==========================================

  getBlogBySlug(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/slug/${encodeURIComponent(slug)}`);
  }

  // ==========================================
  // CREATE
  // ==========================================

  createBlog(data: BlogPostCreateRequest): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.apiUrl, data);
  }

  // ==========================================
  // UPDATE
  // ==========================================

  updateBlog(id: number, data: BlogPostUpdateRequest): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${this.apiUrl}/${id}`, data);
  }

  // ==========================================
  // DELETE
  // ==========================================

  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
