export type UserRole = 'pelanggan' | 'admin'
export type PaymentMethod = 'GoPay' | 'Transfer Bank'
export type OrderStatus =
  | 'Menunggu Pembayaran'
  | 'Pembayaran Dikonfirmasi'
  | 'Selesai'
  | 'Dibatalkan'

export interface Profile {
  id: string
  nama: string
  username: string
  email: string
  role: UserRole
  created_at: string
}

export interface Category {
  id: string
  nama: string
  created_at: string
}

export interface Product {
  id: string
  kategori_id: string | null
  nama: string
  harga: number
  deskripsi: string | null
  foto_url: string | null
  created_at: string
  categories?: Category | null
}

export interface Inventory {
  id: string
  product_id: string
  ukuran: string
  stok: number
  batas_minimum: number
  created_at: string
  products?: Product | null
}

export interface CartItem {
  id: string
  user_id: string
  inventory_id: string
  jumlah: number
  created_at: string
  inventory?: Inventory & { products?: Product | null }
}

export interface Order {
  id: string
  user_id: string
  total_harga: number
  alamat_pengiriman: string
  metode_pembayaran: PaymentMethod
  status: OrderStatus
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  inventory_id: string
  jumlah: number
  harga_satuan_saat_dibeli: number
  created_at: string
  inventory?: Inventory & { products?: Product | null }
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      }
      inventory: {
        Row: Inventory
        Insert: Omit<Inventory, 'id' | 'created_at'>
        Update: Partial<Omit<Inventory, 'id' | 'created_at'>>
      }
      cart_items: {
        Row: CartItem
        Insert: Omit<CartItem, 'id' | 'created_at'>
        Update: Partial<Omit<CartItem, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
      }
    }
    Enums: {
      user_role: UserRole
      payment_method: PaymentMethod
      order_status: OrderStatus
    }
  }
}
