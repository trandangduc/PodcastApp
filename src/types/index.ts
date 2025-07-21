// Basic types cho project - Updated để phù hợp với API
export interface User {
  id: string;
  email: string;
  ho_ten: string;
  vai_tro: 'admin' | 'nguoi_dung';
  ngay_tao: string;
  kich_hoat: boolean;
}

export interface TaiLieu {
  id: string;
  ten_file_goc: string;
  duong_dan_file: string;
  loai_file: string;
  kich_thuoc_file: number;
  noi_dung_trich_xuat: string;
  trang_thai: string;
  nguoi_tai_len: string;
  ngay_tai_len: string;
  ngay_xu_ly_xong: string | null;
  nguoi_dung: User;
}

export interface DanhMuc {
  id: string;
  ten_danh_muc: string;
  mo_ta: string;
  slug: string;
  ngay_tao: string;
  kich_hoat: boolean;
}

export interface Podcast {
  id: string;
  tai_lieu_id: string;
  tieu_de: string;
  mo_ta: string;
  duong_dan_audio: string;
  thoi_luong_giay: number;
  hinh_anh_dai_dien: string;
  danh_muc_id: string;
  trang_thai: 'Bật' | 'Tắt';
  nguoi_tao: string;
  ngay_tao_ra: string;
  ngay_xuat_ban: string | null;
  the_tag: string;
  luot_xem: number;
  tailieu: TaiLieu;
  danhmuc: DanhMuc;
}

export interface PodcastDetailResponse {
  data: Podcast;
  suggest: Podcast[];
}

export interface PodcastListResponse {
  data: Podcast[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
}

// Legacy interface for backwards compatibility
export interface Category {
  id: number;
  ten_danh_muc: string;
  mo_ta?: string;
  slug: string;
  kich_hoat: boolean;
}

export interface Document {
  id: number;
  ten_file_goc: string;
  loai_file: string;
  kich_thuoc_file: number;
  trang_thai: 'da_tai_len' | 'dang_kiem_tra' | 'dang_trich_xuat' | 'dang_xu_ly_ai' | 'hoan_thanh' | 'da_xuat_ban' | 'loi';
  ngay_tai_len: string;
  ngay_xu_ly_xong?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}