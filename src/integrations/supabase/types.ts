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
      bb_images: {
        Row: {
          color_name: string | null
          created_at: string
          id: string
          is_primary: boolean
          sort_order: number
          style_code: string
          url: string
        }
        Insert: {
          color_name?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          sort_order?: number
          style_code: string
          url: string
        }
        Update: {
          color_name?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          sort_order?: number
          style_code?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "bb_images_style_code_fkey"
            columns: ["style_code"]
            isOneToOne: false
            referencedRelation: "bb_styles"
            referencedColumns: ["style_code"]
          },
        ]
      }
      bb_prices: {
        Row: {
          currency: string
          retail_price: number
          sku: string
          updated_at: string
        }
        Insert: {
          currency?: string
          retail_price: number
          sku: string
          updated_at?: string
        }
        Update: {
          currency?: string
          retail_price?: number
          sku?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bb_prices_sku_fkey"
            columns: ["sku"]
            isOneToOne: true
            referencedRelation: "bb_variants"
            referencedColumns: ["sku"]
          },
        ]
      }
      bb_styles: {
        Row: {
          active: boolean
          brand: string
          care: string | null
          category: string | null
          created_at: string
          description: string | null
          features: Json | null
          gender: string | null
          material: string | null
          name: string
          sizes: string[] | null
          style_code: string
          sub_category: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          active?: boolean
          brand: string
          care?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          gender?: string | null
          material?: string | null
          name: string
          sizes?: string[] | null
          style_code: string
          sub_category?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          active?: boolean
          brand?: string
          care?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          gender?: string | null
          material?: string | null
          name?: string
          sizes?: string[] | null
          style_code?: string
          sub_category?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      bb_variants: {
        Row: {
          active: boolean
          color_hex: string | null
          color_name: string | null
          created_at: string
          size: string | null
          sku: string
          style_code: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          color_hex?: string | null
          color_name?: string | null
          created_at?: string
          size?: string | null
          sku: string
          style_code: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          color_hex?: string | null
          color_name?: string | null
          created_at?: string
          size?: string | null
          sku?: string
          style_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bb_variants_style_code_fkey"
            columns: ["style_code"]
            isOneToOne: false
            referencedRelation: "bb_styles"
            referencedColumns: ["style_code"]
          },
        ]
      }
      catalog_price_ranges: {
        Row: {
          currency: string
          max_price: number
          min_price: number
          source: string
          style_code: string
          updated_at: string
        }
        Insert: {
          currency?: string
          max_price: number
          min_price: number
          source: string
          style_code: string
          updated_at?: string
        }
        Update: {
          currency?: string
          max_price?: number
          min_price?: number
          source?: string
          style_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog_variant_prices: {
        Row: {
          color_code: string | null
          currency: string
          retail_price: number
          size: string | null
          sku: string
          source: string
          style_code: string
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          currency?: string
          retail_price: number
          size?: string | null
          sku: string
          source: string
          style_code: string
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          currency?: string
          retail_price?: number
          size?: string | null
          sku?: string
          source?: string
          style_code?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      mega_menu_items: {
        Row: {
          active: boolean
          auto_added: boolean
          categories: string[]
          created_at: string
          id: string
          image_url: string | null
          label_en: string
          label_lv: string
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          auto_added?: boolean
          categories?: string[]
          created_at?: string
          id?: string
          image_url?: string | null
          label_en: string
          label_lv: string
          section: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          auto_added?: boolean
          categories?: string[]
          created_at?: string
          id?: string
          image_url?: string | null
          label_en?: string
          label_lv?: string
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      mf_images: {
        Row: {
          color_code: string | null
          created_at: string
          id: number
          sort_order: number | null
          style_code: string
          url: string
          view_code: string | null
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          id?: number
          sort_order?: number | null
          style_code: string
          url: string
          view_code?: string | null
        }
        Update: {
          color_code?: string | null
          created_at?: string
          id?: number
          sort_order?: number | null
          style_code?: string
          url?: string
          view_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mf_images_style_code_fkey"
            columns: ["style_code"]
            isOneToOne: false
            referencedRelation: "mf_styles"
            referencedColumns: ["style_code"]
          },
        ]
      }
      mf_prices: {
        Row: {
          currency: string | null
          retail_price: number | null
          sku: string
          suggested_retail_price: number | null
          updated_at: string
          wholesale_price: number | null
        }
        Insert: {
          currency?: string | null
          retail_price?: number | null
          sku: string
          suggested_retail_price?: number | null
          updated_at?: string
          wholesale_price?: number | null
        }
        Update: {
          currency?: string | null
          retail_price?: number | null
          sku?: string
          suggested_retail_price?: number | null
          updated_at?: string
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mf_prices_sku_fkey"
            columns: ["sku"]
            isOneToOne: true
            referencedRelation: "mf_variants"
            referencedColumns: ["sku"]
          },
        ]
      }
      mf_public_retail_prices: {
        Row: {
          currency: string
          retail_price: number
          style_code: string
          updated_at: string
        }
        Insert: {
          currency?: string
          retail_price: number
          style_code: string
          updated_at?: string
        }
        Update: {
          currency?: string
          retail_price?: number
          style_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      mf_stock: {
        Row: {
          as_of_date: string | null
          quantity: number
          sku: string
          updated_at: string
        }
        Insert: {
          as_of_date?: string | null
          quantity?: number
          sku: string
          updated_at?: string
        }
        Update: {
          as_of_date?: string | null
          quantity?: number
          sku?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mf_stock_sku_fkey"
            columns: ["sku"]
            isOneToOne: true
            referencedRelation: "mf_variants"
            referencedColumns: ["sku"]
          },
        ]
      }
      mf_styles: {
        Row: {
          alternatives: Json | null
          category_code: string | null
          category_name: string | null
          created_at: string
          description: string | null
          gender: string | null
          gender_code: string | null
          hidden_by_admin: boolean
          name: string | null
          product_card_pdf: string | null
          published: boolean
          raw: Json | null
          size_chart_pdf: string | null
          specification: string | null
          style_code: string
          subtitle: string | null
          trademark: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          alternatives?: Json | null
          category_code?: string | null
          category_name?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          gender_code?: string | null
          hidden_by_admin?: boolean
          name?: string | null
          product_card_pdf?: string | null
          published?: boolean
          raw?: Json | null
          size_chart_pdf?: string | null
          specification?: string | null
          style_code: string
          subtitle?: string | null
          trademark?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          alternatives?: Json | null
          category_code?: string | null
          category_name?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          gender_code?: string | null
          hidden_by_admin?: boolean
          name?: string | null
          product_card_pdf?: string | null
          published?: boolean
          raw?: Json | null
          size_chart_pdf?: string | null
          specification?: string | null
          style_code?: string
          subtitle?: string | null
          trademark?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mf_variants: {
        Row: {
          attributes: Json | null
          color_code: string | null
          color_icon_link: string | null
          color_name: string | null
          created_at: string
          ean: string | null
          size: string | null
          size_code: string | null
          size_name: string | null
          sku: string
          style_code: string
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          color_code?: string | null
          color_icon_link?: string | null
          color_name?: string | null
          created_at?: string
          ean?: string | null
          size?: string | null
          size_code?: string | null
          size_name?: string | null
          sku: string
          style_code: string
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          color_code?: string | null
          color_icon_link?: string | null
          color_name?: string | null
          created_at?: string
          ean?: string | null
          size?: string | null
          size_code?: string | null
          size_name?: string | null
          sku?: string
          style_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mf_variants_style_code_fkey"
            columns: ["style_code"]
            isOneToOne: false
            referencedRelation: "mf_styles"
            referencedColumns: ["style_code"]
          },
        ]
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
      pf_images: {
        Row: {
          filename: string
          id: number
          item_code: string
          kind: string
          model_code: string
          sort_order: number | null
          url_1600: string | null
          url_500: string | null
        }
        Insert: {
          filename: string
          id?: number
          item_code?: string
          kind: string
          model_code: string
          sort_order?: number | null
          url_1600?: string | null
          url_500?: string | null
        }
        Update: {
          filename?: string
          id?: number
          item_code?: string
          kind?: string
          model_code?: string
          sort_order?: number | null
          url_1600?: string | null
          url_500?: string | null
        }
        Relationships: []
      }
      pf_prices: {
        Row: {
          currency: string | null
          item_code: string
          list_price: number | null
          price: number | null
          updated_at: string
        }
        Insert: {
          currency?: string | null
          item_code: string
          list_price?: number | null
          price?: number | null
          updated_at?: string
        }
        Update: {
          currency?: string | null
          item_code?: string
          list_price?: number | null
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pf_public_retail_prices: {
        Row: {
          currency: string
          item_code: string
          model_code: string
          retail_price: number
          updated_at: string
        }
        Insert: {
          currency?: string
          item_code: string
          model_code: string
          retail_price: number
          updated_at?: string
        }
        Update: {
          currency?: string
          item_code?: string
          model_code?: string
          retail_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      pf_styles: {
        Row: {
          attributes: Json | null
          brand: string | null
          category: string | null
          category_group: string | null
          color_count: number | null
          country_of_origin: string | null
          created_at: string | null
          description: string | null
          ext_desc: string | null
          gender: string | null
          item_count: number | null
          keywords: string | null
          last_synced_at: string | null
          main_image: string | null
          material: string | null
          model_code: string
          product_comments: string | null
          raw: Json | null
          simple_material: string | null
        }
        Insert: {
          attributes?: Json | null
          brand?: string | null
          category?: string | null
          category_group?: string | null
          color_count?: number | null
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          ext_desc?: string | null
          gender?: string | null
          item_count?: number | null
          keywords?: string | null
          last_synced_at?: string | null
          main_image?: string | null
          material?: string | null
          model_code: string
          product_comments?: string | null
          raw?: Json | null
          simple_material?: string | null
        }
        Update: {
          attributes?: Json | null
          brand?: string | null
          category?: string | null
          category_group?: string | null
          color_count?: number | null
          country_of_origin?: string | null
          created_at?: string | null
          description?: string | null
          ext_desc?: string | null
          gender?: string | null
          item_count?: number | null
          keywords?: string | null
          last_synced_at?: string | null
          main_image?: string | null
          material?: string | null
          model_code?: string
          product_comments?: string | null
          raw?: Json | null
          simple_material?: string | null
        }
        Relationships: []
      }
      pf_variants: {
        Row: {
          base_color: string | null
          color_code: string | null
          color_desc: string | null
          created_at: string | null
          ean_code: string | null
          gender: string | null
          hex_color: string | null
          item_code: string
          material: string | null
          model_code: string
          pms_color: string | null
          qty_per_carton: number | null
          raw: Json | null
          size: string | null
          size_grid: string | null
          weight_gr: number | null
        }
        Insert: {
          base_color?: string | null
          color_code?: string | null
          color_desc?: string | null
          created_at?: string | null
          ean_code?: string | null
          gender?: string | null
          hex_color?: string | null
          item_code: string
          material?: string | null
          model_code: string
          pms_color?: string | null
          qty_per_carton?: number | null
          raw?: Json | null
          size?: string | null
          size_grid?: string | null
          weight_gr?: number | null
        }
        Update: {
          base_color?: string | null
          color_code?: string | null
          color_desc?: string | null
          created_at?: string | null
          ean_code?: string | null
          gender?: string | null
          hex_color?: string | null
          item_code?: string
          material?: string | null
          model_code?: string
          pms_color?: string | null
          qty_per_carton?: number | null
          raw?: Json | null
          size?: string | null
          size_grid?: string | null
          weight_gr?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_variants_model_code_fkey"
            columns: ["model_code"]
            isOneToOne: false
            referencedRelation: "pf_style_summary"
            referencedColumns: ["model_code"]
          },
          {
            foreignKeyName: "pf_variants_model_code_fkey"
            columns: ["model_code"]
            isOneToOne: false
            referencedRelation: "pf_styles"
            referencedColumns: ["model_code"]
          },
        ]
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
          assigned_pm_email: string | null
          assigned_pm_name: string | null
          company: string | null
          created_at: string
          deadline: string | null
          email: string
          file_urls: string[]
          id: string
          items: Json
          message: string | null
          name: string
          phone: string | null
          print_colors: string | null
          print_method: string | null
          print_placement: string | null
          product_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_pm_email?: string | null
          assigned_pm_name?: string | null
          company?: string | null
          created_at?: string
          deadline?: string | null
          email: string
          file_urls?: string[]
          id?: string
          items?: Json
          message?: string | null
          name: string
          phone?: string | null
          print_colors?: string | null
          print_method?: string | null
          print_placement?: string | null
          product_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_pm_email?: string | null
          assigned_pm_name?: string | null
          company?: string | null
          created_at?: string
          deadline?: string | null
          email?: string
          file_urls?: string[]
          id?: string
          items?: Json
          message?: string | null
          name?: string
          phone?: string | null
          print_colors?: string | null
          print_method?: string | null
          print_placement?: string | null
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
      ru_images: {
        Row: {
          color_name: string | null
          created_at: string
          id: number
          sort_order: number
          style_code: string
          url: string
        }
        Insert: {
          color_name?: string | null
          created_at?: string
          id?: number
          sort_order?: number
          style_code: string
          url: string
        }
        Update: {
          color_name?: string | null
          created_at?: string
          id?: number
          sort_order?: number
          style_code?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ru_images_style_code_fkey"
            columns: ["style_code"]
            isOneToOne: false
            referencedRelation: "ru_styles"
            referencedColumns: ["style_code"]
          },
        ]
      }
      ru_prices: {
        Row: {
          currency: string
          retail_price: number | null
          style_code: string
          updated_at: string
          wholesale_price: number | null
        }
        Insert: {
          currency?: string
          retail_price?: number | null
          style_code: string
          updated_at?: string
          wholesale_price?: number | null
        }
        Update: {
          currency?: string
          retail_price?: number | null
          style_code?: string
          updated_at?: string
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ru_prices_style_code_fkey"
            columns: ["style_code"]
            isOneToOne: true
            referencedRelation: "ru_styles"
            referencedColumns: ["style_code"]
          },
        ]
      }
      ru_styles: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          description: string | null
          fabric: string | null
          features: string | null
          gender: string | null
          hidden_by_admin: boolean
          href: string | null
          is_new: boolean
          last_synced_at: string | null
          main_image_url: string | null
          name: string | null
          published: boolean
          raw: Json | null
          sizes: string[] | null
          style_code: string
          updated_at: string
          weight: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          fabric?: string | null
          features?: string | null
          gender?: string | null
          hidden_by_admin?: boolean
          href?: string | null
          is_new?: boolean
          last_synced_at?: string | null
          main_image_url?: string | null
          name?: string | null
          published?: boolean
          raw?: Json | null
          sizes?: string[] | null
          style_code: string
          updated_at?: string
          weight?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          fabric?: string | null
          features?: string | null
          gender?: string | null
          hidden_by_admin?: boolean
          href?: string | null
          is_new?: boolean
          last_synced_at?: string | null
          main_image_url?: string | null
          name?: string | null
          published?: boolean
          raw?: Json | null
          sizes?: string[] | null
          style_code?: string
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      ru_variants: {
        Row: {
          color_hex: string | null
          color_name: string
          created_at: string
          style_code: string
          swatch_url: string | null
        }
        Insert: {
          color_hex?: string | null
          color_name: string
          created_at?: string
          style_code: string
          swatch_url?: string | null
        }
        Update: {
          color_hex?: string | null
          color_name?: string
          created_at?: string
          style_code?: string
          swatch_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ru_variants_style_code_fkey"
            columns: ["style_code"]
            isOneToOne: false
            referencedRelation: "ru_styles"
            referencedColumns: ["style_code"]
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
      ss_price_list_2026: {
        Row: {
          color_group: string
          created_at: string
          id: string
          is_large_size: boolean
          price: number
          price_vat: number | null
          size_range: string | null
          style_code: string
          updated_at: string
        }
        Insert: {
          color_group: string
          created_at?: string
          id?: string
          is_large_size?: boolean
          price: number
          price_vat?: number | null
          size_range?: string | null
          style_code: string
          updated_at?: string
        }
        Update: {
          color_group?: string
          created_at?: string
          id?: string
          is_large_size?: boolean
          price?: number
          price_vat?: number | null
          size_range?: string | null
          style_code?: string
          updated_at?: string
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
      ss_public_retail_prices: {
        Row: {
          currency: string
          retail_price: number
          style_code: string
          updated_at: string
        }
        Insert: {
          currency?: string
          retail_price: number
          style_code: string
          updated_at?: string
        }
        Update: {
          currency?: string
          retail_price?: number
          style_code?: string
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      bb_public_retail_prices: {
        Row: {
          currency: string | null
          retail_price: number | null
          style_code: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bb_variants_style_code_fkey"
            columns: ["style_code"]
            isOneToOne: false
            referencedRelation: "bb_styles"
            referencedColumns: ["style_code"]
          },
        ]
      }
      catalog_items: {
        Row: {
          brand: string | null
          category: string | null
          color_hexes: string[] | null
          color_names: string[] | null
          colors: Json | null
          description: string | null
          gender: string | null
          group_name: string | null
          hover_image_url: string | null
          id: string | null
          image_url: string | null
          name: string | null
          sort_order: number | null
          source: string | null
        }
        Relationships: []
      }
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
      pf_retail_prices: {
        Row: {
          currency: string | null
          item_code: string | null
          model_code: string | null
          retail_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pf_variants_model_code_fkey"
            columns: ["model_code"]
            isOneToOne: false
            referencedRelation: "pf_style_summary"
            referencedColumns: ["model_code"]
          },
          {
            foreignKeyName: "pf_variants_model_code_fkey"
            columns: ["model_code"]
            isOneToOne: false
            referencedRelation: "pf_styles"
            referencedColumns: ["model_code"]
          },
        ]
      }
      pf_style_summary: {
        Row: {
          brand: string | null
          category: string | null
          category_group: string | null
          color_count: number | null
          description: string | null
          ext_desc: string | null
          gender: string | null
          item_count: number | null
          main_image: string | null
          main_image_url: string | null
          material: string | null
          model_code: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          category_group?: string | null
          color_count?: number | null
          description?: string | null
          ext_desc?: string | null
          gender?: string | null
          item_count?: number | null
          main_image?: string | null
          main_image_url?: never
          material?: string | null
          model_code?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          category_group?: string | null
          color_count?: number | null
          description?: string | null
          ext_desc?: string | null
          gender?: string | null
          item_count?: number | null
          main_image?: string | null
          main_image_url?: never
          material?: string | null
          model_code?: string | null
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
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
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      refresh_catalog_items_mv: { Args: never; Returns: undefined }
      refresh_catalog_prices: { Args: never; Returns: undefined }
      refresh_mf_public_retail_prices: { Args: never; Returns: undefined }
      refresh_ss_public_retail_prices: { Args: never; Returns: undefined }
      refresh_ss_style_summary: { Args: never; Returns: undefined }
      ss_fill_missing_variant_prices: { Args: never; Returns: number }
      ss_sku_retail_prices: {
        Args: never
        Returns: {
          color_code: string
          retail_price: number
          size_code: string
          sku: string
          style_code: string
        }[]
      }
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
