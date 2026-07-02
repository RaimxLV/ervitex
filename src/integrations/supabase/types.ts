export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description_en: string | null
          description_lv: string | null
          id: string
          image: string | null
          name_en: string
          name_lv: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_lv?: string | null
          id?: string
          image?: string | null
          name_en: string
          name_lv: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_lv?: string | null
          id?: string
          image?: string | null
          name_en?: string
          name_lv?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      nwg_assortments: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          parent_id: string | null
          raw: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          parent_id?: string | null
          raw?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          parent_id?: string | null
          raw?: Json | null
        }
        Relationships: []
      }
      nwg_images: {
        Row: {
          created_at: string | null
          file_name: string | null
          high_res_url: string | null
          id: number
          image_url: string | null
          item_number: string | null
          large_thumbnail_url: string | null
          picture_angle: string | null
          picture_type: string | null
          product_number: string
          resource_file_id: string | null
          sort_order: number | null
          standard_url: string | null
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          high_res_url?: string | null
          id?: number
          image_url?: string | null
          item_number?: string | null
          large_thumbnail_url?: string | null
          picture_angle?: string | null
          picture_type?: string | null
          product_number: string
          resource_file_id?: string | null
          sort_order?: number | null
          standard_url?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          high_res_url?: string | null
          id?: number
          image_url?: string | null
          item_number?: string | null
          large_thumbnail_url?: string | null
          picture_angle?: string | null
          picture_type?: string | null
          product_number?: string
          resource_file_id?: string | null
          sort_order?: number | null
          standard_url?: string | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      nwg_skus: {
        Row: {
          active: boolean | null
          availability: number | null
          created_at: string | null
          currency: string | null
          discontinued: boolean | null
          ean: string | null
          item_number: string | null
          product_number: string
          retail_price: number | null
          sales_price: number | null
          size: string | null
          size_sequence: string | null
          sku: string
        }
        Insert: {
          active?: boolean | null
          availability?: number | null
          created_at?: string | null
          currency?: string | null
          discontinued?: boolean | null
          ean?: string | null
          item_number?: string | null
          product_number: string
          retail_price?: number | null
          sales_price?: number | null
          size?: string | null
          size_sequence?: string | null
          sku: string
        }
        Update: {
          active?: boolean | null
          availability?: number | null
          created_at?: string | null
          currency?: string | null
          discontinued?: boolean | null
          ean?: string | null
          item_number?: string | null
          product_number?: string
          retail_price?: number | null
          sales_price?: number | null
          size?: string | null
          size_sequence?: string | null
          sku?: string
        }
        Relationships: []
      }
      nwg_styles: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          assortment_ids: string[] | null
          brand: string | null
          catalog_text: string | null
          category: string | null
          commerce_text: string | null
          country_of_origin: string | null
          created_at: string | null
          currency: string | null
          fabrics: string | null
          fit: string | null
          gender: string | null
          last_synced_at: string | null
          main_picture_url: string | null
          name: string | null
          product_number: string
          published: boolean | null
          raw: Json | null
          retail_price: number | null
          updated_at: string | null
          usp: string | null
          weight: string | null
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          assortment_ids?: string[] | null
          brand?: string | null
          catalog_text?: string | null
          category?: string | null
          commerce_text?: string | null
          country_of_origin?: string | null
          created_at?: string | null
          currency?: string | null
          fabrics?: string | null
          fit?: string | null
          gender?: string | null
          last_synced_at?: string | null
          main_picture_url?: string | null
          name?: string | null
          product_number: string
          published?: boolean | null
          raw?: Json | null
          retail_price?: number | null
          updated_at?: string | null
          usp?: string | null
          weight?: string | null
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          assortment_ids?: string[] | null
          brand?: string | null
          catalog_text?: string | null
          category?: string | null
          commerce_text?: string | null
          country_of_origin?: string | null
          created_at?: string | null
          currency?: string | null
          fabrics?: string | null
          fit?: string | null
          gender?: string | null
          last_synced_at?: string | null
          main_picture_url?: string | null
          name?: string | null
          product_number?: string
          published?: boolean | null
          raw?: Json | null
          retail_price?: number | null
          updated_at?: string | null
          usp?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      nwg_variants: {
        Row: {
          color_code: string | null
          color_name: string | null
          created_at: string | null
          filter_color: string | null
          item_number: string
          main_picture_url: string | null
          outlet: boolean | null
          product_number: string
          raw: Json | null
          shade_color: string | null
          web_color: string[] | null
        }
        Insert: {
          color_code?: string | null
          color_name?: string | null
          created_at?: string | null
          filter_color?: string | null
          item_number: string
          main_picture_url?: string | null
          outlet?: boolean | null
          product_number: string
          raw?: Json | null
          shade_color?: string | null
          web_color?: string[] | null
        }
        Update: {
          color_code?: string | null
          color_name?: string | null
          created_at?: string | null
          filter_color?: string | null
          item_number?: string
          main_picture_url?: string | null
          outlet?: boolean | null
          product_number?: string
          raw?: Json | null
          shade_color?: string | null
          web_color?: string[] | null
        }
        Relationships: []
      }
      product_colors: {
        Row: {
          created_at: string
          hex_code: string | null
          id: string
          image_url: string
          name: string
          product_id: string
        }
        Insert: {
          created_at?: string
          hex_code?: string | null
          id?: string
          image_url?: string
          name: string
          product_id: string
        }
        Update: {
          created_at?: string
          hex_code?: string | null
          id?: string
          image_url?: string
          name?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          product_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          created_at: string
          id: string
          product_id: string
          size: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          size: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          size?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          brand: string | null
          bulk_discount_percent: number | null
          bulk_min_qty: number | null
          category_id: string | null
          created_at: string
          description_en: string | null
          description_lv: string | null
          featured: boolean | null
          hidden_manual: boolean
          hide_when_oos: boolean
          id: string
          is_new: boolean | null
          last_synced_at: string | null
          long_description_en: string | null
          long_description_lv: string | null
          material: string | null
          min_order: number | null
          name_en: string
          name_lv: string
          nwg_product_number: string | null
          price_override: number | null
          printing_techs: string[] | null
          retail_price: number | null
          ss_in_stock: boolean | null
          ss_stock_qty: number | null
          ss_style_code: string | null
          ss_wholesale_price: number | null
          updated_at: string
          wholesale_price: number | null
        }
        Insert: {
          active?: boolean | null
          brand?: string | null
          bulk_discount_percent?: number | null
          bulk_min_qty?: number | null
          category_id?: string | null
          created_at?: string
          description_en?: string | null
          description_lv?: string | null
          featured?: boolean | null
          hidden_manual?: boolean
          hide_when_oos?: boolean
          id?: string
          is_new?: boolean | null
          last_synced_at?: string | null
          long_description_en?: string | null
          long_description_lv?: string | null
          material?: string | null
          min_order?: number | null
          name_en: string
          name_lv: string
          nwg_product_number?: string | null
          price_override?: number | null
          printing_techs?: string[] | null
          retail_price?: number | null
          ss_in_stock?: boolean | null
          ss_stock_qty?: number | null
          ss_style_code?: string | null
          ss_wholesale_price?: number | null
          updated_at?: string
          wholesale_price?: number | null
        }
        Update: {
          active?: boolean | null
          brand?: string | null
          bulk_discount_percent?: number | null
          bulk_min_qty?: number | null
          category_id?: string | null
          created_at?: string
          description_en?: string | null
          description_lv?: string | null
          featured?: boolean | null
          hidden_manual?: boolean
          hide_when_oos?: boolean
          id?: string
          is_new?: boolean | null
          last_synced_at?: string | null
          long_description_en?: string | null
          long_description_lv?: string | null
          material?: string | null
          min_order?: number | null
          name_en?: string
          name_lv?: string
          nwg_product_number?: string | null
          price_override?: number | null
          printing_techs?: string[] | null
          retail_price?: number | null
          ss_in_stock?: boolean | null
          ss_stock_qty?: number | null
          ss_style_code?: string | null
          ss_wholesale_price?: number | null
          updated_at?: string
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          product_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      ss_colors: {
        Row: {
          code: string
          hex: string | null
          name: string
          raw: Json | null
          updated_at: string
        }
        Insert: {
          code: string
          hex?: string | null
          name: string
          raw?: Json | null
          updated_at?: string
        }
        Update: {
          code?: string
          hex?: string | null
          name?: string
          raw?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      ss_combos: {
        Row: {
          combo_style_code: string
          combo_type: string | null
          created_at: string
          id: string
          raw: Json | null
          style_code: string
        }
        Insert: {
          combo_style_code: string
          combo_type?: string | null
          created_at?: string
          id?: string
          raw?: Json | null
          style_code: string
        }
        Update: {
          combo_style_code?: string
          combo_type?: string | null
          created_at?: string
          id?: string
          raw?: Json | null
          style_code?: string
        }
        Relationships: []
      }
      ss_images: {
        Row: {
          color_code: string
          created_at: string
          fname: string
          height: number | null
          id: string
          image_type: string
          is_main: boolean | null
          is_over: boolean | null
          photo_shoot_code: string | null
          photo_style: string | null
          public_url: string | null
          sort_order: number | null
          source_url: string
          storage_path: string | null
          style_code: string
          width: number | null
        }
        Insert: {
          color_code?: string
          created_at?: string
          fname?: string
          height?: number | null
          id?: string
          image_type?: string
          is_main?: boolean | null
          is_over?: boolean | null
          photo_shoot_code?: string | null
          photo_style?: string | null
          public_url?: string | null
          sort_order?: number | null
          source_url: string
          storage_path?: string | null
          style_code: string
          width?: number | null
        }
        Update: {
          color_code?: string
          created_at?: string
          fname?: string
          height?: number | null
          id?: string
          image_type?: string
          is_main?: boolean | null
          is_over?: boolean | null
          photo_shoot_code?: string | null
          photo_style?: string | null
          public_url?: string | null
          sort_order?: number | null
          source_url?: string
          storage_path?: string | null
          style_code?: string
          width?: number | null
        }
        Relationships: []
      }
      ss_prices: {
        Row: {
          currency: string | null
          purchase_price: number | null
          sku: string
          style_code: string
          suggested_retail_price: number | null
          updated_at: string
        }
        Insert: {
          currency?: string | null
          purchase_price?: number | null
          sku: string
          style_code: string
          suggested_retail_price?: number | null
          updated_at?: string
        }
        Update: {
          currency?: string | null
          purchase_price?: number | null
          sku?: string
          style_code?: string
          suggested_retail_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ss_sizes: {
        Row: {
          code: string
          name: string
          raw: Json | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code: string
          name: string
          raw?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          name?: string
          raw?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ss_stock: {
        Row: {
          incoming_quantity: number | null
          location_code: string | null
          next_arrival_date: string | null
          quantity: number
          receipt_date: string | null
          sku: string
          style_code: string
          updated_at: string
          variant_code: string | null
        }
        Insert: {
          incoming_quantity?: number | null
          location_code?: string | null
          next_arrival_date?: string | null
          quantity?: number
          receipt_date?: string | null
          sku: string
          style_code: string
          updated_at?: string
          variant_code?: string | null
        }
        Update: {
          incoming_quantity?: number | null
          location_code?: string | null
          next_arrival_date?: string | null
          quantity?: number
          receipt_date?: string | null
          sku?: string
          style_code?: string
          updated_at?: string
          variant_code?: string | null
        }
        Relationships: []
      }
      ss_styles: {
        Row: {
          archived: boolean | null
          archived_at: string | null
          brand: string | null
          category: string | null
          category_code: string | null
          composition: string | null
          created_at: string
          fit: string | null
          gender: string | null
          hidden_by_admin: boolean
          id: string
          last_synced_at: string | null
          long_description: string | null
          main_picture_url: string | null
          name: string
          neckline: string | null
          new_style: boolean | null
          over_picture_url: string | null
          published: boolean
          raw: Json | null
          segment: string | null
          sequence_style: number | null
          short_description: string | null
          sleeve: string | null
          specifications: string | null
          style_code: string
          style_main_segment: string | null
          type: string | null
          type_code: string | null
          updated_at: string
          wash_instructions: string | null
          weight_gsm: number | null
        }
        Insert: {
          archived?: boolean | null
          archived_at?: string | null
          brand?: string | null
          category?: string | null
          category_code?: string | null
          composition?: string | null
          created_at?: string
          fit?: string | null
          gender?: string | null
          hidden_by_admin?: boolean
          id?: string
          last_synced_at?: string | null
          long_description?: string | null
          main_picture_url?: string | null
          name: string
          neckline?: string | null
          new_style?: boolean | null
          over_picture_url?: string | null
          published?: boolean
          raw?: Json | null
          segment?: string | null
          sequence_style?: number | null
          short_description?: string | null
          sleeve?: string | null
          specifications?: string | null
          style_code: string
          style_main_segment?: string | null
          type?: string | null
          type_code?: string | null
          updated_at?: string
          wash_instructions?: string | null
          weight_gsm?: number | null
        }
        Update: {
          archived?: boolean | null
          archived_at?: string | null
          brand?: string | null
          category?: string | null
          category_code?: string | null
          composition?: string | null
          created_at?: string
          fit?: string | null
          gender?: string | null
          hidden_by_admin?: boolean
          id?: string
          last_synced_at?: string | null
          long_description?: string | null
          main_picture_url?: string | null
          name?: string
          neckline?: string | null
          new_style?: boolean | null
          over_picture_url?: string | null
          published?: boolean
          raw?: Json | null
          segment?: string | null
          sequence_style?: number | null
          short_description?: string | null
          sleeve?: string | null
          specifications?: string | null
          style_code?: string
          style_main_segment?: string | null
          type?: string | null
          type_code?: string | null
          updated_at?: string
          wash_instructions?: string | null
          weight_gsm?: number | null
        }
        Relationships: []
      }
      ss_variants: {
        Row: {
          color_code: string | null
          color_group: string | null
          color_name: string | null
          color_sequence: number | null
          created_at: string
          ean: string | null
          hex_color_code: string | null
          hidden_by_admin: boolean
          id: string
          new_color: boolean | null
          new_style: boolean | null
          published: boolean | null
          raw: Json | null
          size_code: string | null
          size_sequence: number | null
          sku: string
          style_code: string
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          color_code?: string | null
          color_group?: string | null
          color_name?: string | null
          color_sequence?: number | null
          created_at?: string
          ean?: string | null
          hex_color_code?: string | null
          hidden_by_admin?: boolean
          id?: string
          new_color?: boolean | null
          new_style?: boolean | null
          published?: boolean | null
          raw?: Json | null
          size_code?: string | null
          size_sequence?: number | null
          sku: string
          style_code: string
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          color_code?: string | null
          color_group?: string | null
          color_name?: string | null
          color_sequence?: number | null
          created_at?: string
          ean?: string | null
          hex_color_code?: string | null
          hidden_by_admin?: boolean
          id?: string
          new_color?: boolean | null
          new_style?: boolean | null
          published?: boolean | null
          raw?: Json | null
          size_code?: string | null
          size_sequence?: number | null
          sku?: string
          style_code?: string
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          details: Json | null
          finished_at: string | null
          id: string
          message: string | null
          products_created: number | null
          products_failed: number | null
          products_updated: number | null
          source: string
          started_at: string
          status: string
        }
        Insert: {
          details?: Json | null
          finished_at?: string | null
          id?: string
          message?: string | null
          products_created?: number | null
          products_failed?: number | null
          products_updated?: number | null
          source: string
          started_at?: string
          status: string
        }
        Update: {
          details?: Json | null
          finished_at?: string | null
          id?: string
          message?: string | null
          products_created?: number | null
          products_failed?: number | null
          products_updated?: number | null
          source?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      nwg_skus_public: {
        Row: {
          active: boolean | null
          availability: number | null
          discontinued: boolean | null
          item_number: string | null
          product_number: string | null
          size: string | null
          size_sequence: string | null
          sku: string | null
        }
        Insert: {
          active?: boolean | null
          availability?: number | null
          discontinued?: boolean | null
          item_number?: string | null
          product_number?: string | null
          size?: string | null
          size_sequence?: string | null
          sku?: string | null
        }
        Update: {
          active?: boolean | null
          availability?: number | null
          discontinued?: boolean | null
          item_number?: string | null
          product_number?: string | null
          size?: string | null
          size_sequence?: string | null
          sku?: string | null
        }
        Relationships: []
      }
      nwg_style_summary: {
        Row: {
          brand: string | null
          catalog_text: string | null
          category: string | null
          color_count: number | null
          commerce_text: string | null
          country_of_origin: string | null
          currency: string | null
          fabrics: string | null
          fit: string | null
          gender: string | null
          hover_picture_url: string | null
          main_picture_url: string | null
          name: string | null
          product_number: string | null
          retail_price: number | null
          size_count: number | null
          total_stock: number | null
          usp: string | null
          weight: string | null
        }
        Insert: {
          brand?: string | null
          catalog_text?: string | null
          category?: string | null
          color_count?: never
          commerce_text?: string | null
          country_of_origin?: string | null
          currency?: string | null
          fabrics?: string | null
          fit?: string | null
          gender?: string | null
          hover_picture_url?: never
          main_picture_url?: never
          name?: string | null
          product_number?: string | null
          retail_price?: number | null
          size_count?: never
          total_stock?: never
          usp?: string | null
          weight?: string | null
        }
        Update: {
          brand?: string | null
          catalog_text?: string | null
          category?: string | null
          color_count?: never
          commerce_text?: string | null
          country_of_origin?: string | null
          currency?: string | null
          fabrics?: string | null
          fit?: string | null
          gender?: string | null
          hover_picture_url?: never
          main_picture_url?: never
          name?: string | null
          product_number?: string | null
          retail_price?: number | null
          size_count?: never
          total_stock?: never
          usp?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      ss_style_summary: {
        Row: {
          archived: boolean | null
          brand: string | null
          category: string | null
          category_code: string | null
          color_count: number | null
          composition: string | null
          cover_source_url: string | null
          cover_storage_path: string | null
          cover_url: string | null
          fit: string | null
          gender: string | null
          has_new_color: boolean | null
          long_description: string | null
          main_picture_url: string | null
          name: string | null
          neckline: string | null
          new_style: boolean | null
          over_picture_url: string | null
          over_source_url: string | null
          over_storage_path: string | null
          over_url: string | null
          published: boolean | null
          raw: Json | null
          segment: string | null
          sequence_style: number | null
          short_description: string | null
          size_count: number | null
          sleeve: string | null
          specifications: string | null
          style_code: string | null
          style_main_segment: string | null
          total_stock: number | null
          type: string | null
          type_code: string | null
          wash_instructions: string | null
          weight_gsm: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_product_wholesale: {
        Args: { _product_id: string }
        Returns: {
          bulk_discount_percent: number
          bulk_min_qty: number
          wholesale_price: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_ss_style_summary: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
