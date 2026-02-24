export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          icon_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          icon_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          icon_url?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          user_id: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          is_public?: boolean;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          list_id: string;
          title: string;
          description: string | null;
          is_completed: boolean;
          completed_at: string | null;
          priority: number | null;
          image_url: string | null;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          title: string;
          description?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          priority?: number | null;
          image_url?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          priority?: number | null;
          image_url?: string | null;
          order?: number;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
