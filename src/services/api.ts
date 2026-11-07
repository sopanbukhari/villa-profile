import {
  Villa,
  AvailabilityCheckResponse,
  OccupiedDatesResponse,
  BookingInquiryPayload,
  BookingInquiryResponse,
  BookingDetail,
  AdminUser,
  BookingStatus,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('villa_admin_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada permintaan ke server.');
  }

  return data;
}

export const api = {
  // Public Endpoints
  async getVilla(idOrSlug: string = 'primary'): Promise<Villa> {
    const res = await request<{ success: boolean; data: Villa }>(`/villas/${idOrSlug}`);
    return res.data;
  },

  async checkAvailability(
    villaId: string,
    checkIn: string,
    checkOut: string,
    guests: number = 2
  ): Promise<AvailabilityCheckResponse> {
    const res = await request<{ success: boolean; data: AvailabilityCheckResponse }>(
      `/villas/${villaId}/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );
    return res.data;
  },

  async getOccupiedDates(villaId: string, from?: string, to?: string): Promise<OccupiedDatesResponse> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await request<{ success: boolean; data: OccupiedDatesResponse }>(
      `/villas/${villaId}/availability${queryString}`
    );
    return res.data;
  },

  async createBookingInquiry(payload: BookingInquiryPayload): Promise<BookingInquiryResponse> {
    const res = await request<{ success: boolean; data: BookingInquiryResponse }>(
      '/bookings/inquiry',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },

  async getBookingByReference(reference: string): Promise<any> {
    const res = await request<{ success: boolean; data: any }>(`/bookings/${reference}`);
    return res.data;
  },

  // Admin Endpoints
  async adminLogin(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
    const res = await request<{ success: boolean; data: { token: string; admin: AdminUser } }>(
      '/admin/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return res.data;
  },

  async adminMe(): Promise<AdminUser> {
    const res = await request<{ success: boolean; data: AdminUser }>('/admin/auth/me');
    return res.data;
  },

  async adminLogout(): Promise<void> {
    await request('/admin/auth/logout', { method: 'POST' });
  },

  async getDashboard(): Promise<{
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    upcomingBookings: number;
    recentBookings: any[];
  }> {
    const res = await request<{ success: boolean; data: any }>('/admin/dashboard');
    return res.data;
  },

  async getAdminBookings(params: {
    status?: BookingStatus | 'ALL';
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: BookingDetail[]; pagination: any }> {
    const q = new URLSearchParams();
    if (params.status && params.status !== 'ALL') q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    if (params.startDate) q.set('startDate', params.startDate);
    if (params.endDate) q.set('endDate', params.endDate);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));

    const res = await request<{ success: boolean; data: BookingDetail[]; pagination: any }>(
      `/admin/bookings?${q.toString()}`
    );
    return { data: res.data, pagination: res.pagination };
  },

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    options?: { notes?: string; holdHours?: number }
  ): Promise<any> {
    const res = await request<{ success: boolean; data: any }>(
      `/admin/bookings/${bookingId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, ...options }),
      }
    );
    return res.data;
  },

  async getBlockedDates(villaId: string = 'primary'): Promise<any[]> {
    const res = await request<{ success: boolean; data: any[] }>(
      `/admin/blocked-dates?villaId=${villaId}`
    );
    return res.data;
  },

  async createBlockedDate(payload: {
    villaId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Promise<any> {
    const res = await request<{ success: boolean; data: any }>('/admin/blocked-dates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteBlockedDate(id: string): Promise<void> {
    await request(`/admin/blocked-dates/${id}`, { method: 'DELETE' });
  },

  async updateVilla(id: string, payload: any): Promise<any> {
    const res = await request<{ success: boolean; data: any }>(`/admin/villas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async addGalleryImage(payload: {
    villaId: string;
    url: string;
    caption?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  }): Promise<any> {
    const res = await request<{ success: boolean; data: any }>('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateGalleryImage(id: string, payload: any): Promise<any> {
    const res = await request<{ success: boolean; data: any }>(`/admin/gallery/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteGalleryImage(id: string): Promise<void> {
    await request(`/admin/gallery/${id}`, { method: 'DELETE' });
  },

  async addFacility(payload: {
    villaId: string;
    name: string;
    category: string;
    icon?: string;
    description?: string;
    isFeatured?: boolean;
  }): Promise<any> {
    const res = await request<{ success: boolean; data: any }>('/admin/facilities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateFacility(id: string, payload: any): Promise<any> {
    const res = await request<{ success: boolean; data: any }>(`/admin/facilities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteFacility(id: string): Promise<void> {
    await request(`/admin/facilities/${id}`, { method: 'DELETE' });
  },

  async addPricingRule(payload: {
    villaId: string;
    name: string;
    startDate: string;
    endDate: string;
    pricePerNightIdr: number;
    minStayNights?: number;
  }): Promise<any> {
    const res = await request<{ success: boolean; data: any }>('/admin/pricing', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deletePricingRule(id: string): Promise<void> {
    await request(`/admin/pricing/${id}`, { method: 'DELETE' });
  },

  async getSettings(): Promise<Record<string, string>> {
    const res = await request<{ success: boolean; data: Record<string, string> }>('/admin/settings');
    return res.data;
  },

  async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
    const res = await request<{ success: boolean; data: Record<string, string> }>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
    return res.data;
  },
};
