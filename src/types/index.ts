// Basic types cho project
export interface User {
    id: number;
    email: string;
    ho_ten: string;
    vai_tro: 'admin' | 'nguoi_dung';
    ngay_tao: string;
    kich_hoat: boolean;
  }
  
  export interface Podcast {
    id: number;
    tieu_de: string;
    mo_ta: string;
    duong_dan_audio: string;
    thoi_luong_giay: number;
    hinh_anh_dai_dien?: string;
    the_tag?: string;
    luot_xem: number;
    ngay_xuat_ban: string;
    danh_muc?: Category;
  }
  
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