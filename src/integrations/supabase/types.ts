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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      execution_campaigns: {
        Row: {
          action_required: string
          ai_insight: string
          audience_country: string | null
          building_reports_start_date: string | null
          campaign_manager: string | null
          company: string | null
          completed_date: string | null
          cpe: number | null
          cpm: number | null
          created_at: string
          csm: string | null
          currency: string | null
          deal_created_date: string | null
          engagement: number | null
          er_pct: number | null
          executed_amount: number
          executed_take_rate_pct: number
          execution_board_start_date: string | null
          execution_end: string | null
          execution_start: string | null
          id: string
          influencers_budget: number
          list_builder: string | null
          monday_item_id: string | null
          musical_genre: string | null
          name: string
          num_ig_posts: number
          num_ig_reels: number
          num_ig_stories: number
          num_influencers: number
          num_posts: number
          num_published: number
          num_tiktoks: number
          num_ugc: number
          num_youtube: number
          ongoing_start_date: string | null
          progress_pct: number
          risk_score: number
          seller: string | null
          status: string
          sub_campaign_budget: number
          take_rate_pct: number
          total_budget: number
          views: number | null
        }
        Insert: {
          action_required?: string
          ai_insight?: string
          audience_country?: string | null
          building_reports_start_date?: string | null
          campaign_manager?: string | null
          company?: string | null
          completed_date?: string | null
          cpe?: number | null
          cpm?: number | null
          created_at?: string
          csm?: string | null
          currency?: string | null
          deal_created_date?: string | null
          engagement?: number | null
          er_pct?: number | null
          executed_amount?: number
          executed_take_rate_pct?: number
          execution_board_start_date?: string | null
          execution_end?: string | null
          execution_start?: string | null
          id?: string
          influencers_budget?: number
          list_builder?: string | null
          monday_item_id?: string | null
          musical_genre?: string | null
          name: string
          num_ig_posts?: number
          num_ig_reels?: number
          num_ig_stories?: number
          num_influencers?: number
          num_posts?: number
          num_published?: number
          num_tiktoks?: number
          num_ugc?: number
          num_youtube?: number
          ongoing_start_date?: string | null
          progress_pct?: number
          risk_score?: number
          seller?: string | null
          status?: string
          sub_campaign_budget?: number
          take_rate_pct?: number
          total_budget?: number
          views?: number | null
        }
        Update: {
          action_required?: string
          ai_insight?: string
          audience_country?: string | null
          building_reports_start_date?: string | null
          campaign_manager?: string | null
          company?: string | null
          completed_date?: string | null
          cpe?: number | null
          cpm?: number | null
          created_at?: string
          csm?: string | null
          currency?: string | null
          deal_created_date?: string | null
          engagement?: number | null
          er_pct?: number | null
          executed_amount?: number
          executed_take_rate_pct?: number
          execution_board_start_date?: string | null
          execution_end?: string | null
          execution_start?: string | null
          id?: string
          influencers_budget?: number
          list_builder?: string | null
          monday_item_id?: string | null
          musical_genre?: string | null
          name?: string
          num_ig_posts?: number
          num_ig_reels?: number
          num_ig_stories?: number
          num_influencers?: number
          num_posts?: number
          num_published?: number
          num_tiktoks?: number
          num_ugc?: number
          num_youtube?: number
          ongoing_start_date?: string | null
          progress_pct?: number
          risk_score?: number
          seller?: string | null
          status?: string
          sub_campaign_budget?: number
          take_rate_pct?: number
          total_budget?: number
          views?: number | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          audience_country: string | null
          building_proposal_start_date: string | null
          company: string | null
          created_at: string
          creative_builder: string | null
          creators_expected: number
          csm: string | null
          currency: string | null
          days_building_proposal: number | null
          deal_created_date: string | null
          declined_reasons: string | null
          execution_board_start_date: string | null
          id: string
          influencers_budget: number
          list_builder: string | null
          monday_item_id: string | null
          musical_genre: string | null
          name: string
          pending_approval_start_date: string | null
          proposal_adjustments: number
          proposal_board_start_date: string | null
          proposal_delivery_date: string | null
          seller: string | null
          status: string
          sub_campaign_budget: number
          take_rate_pct: number
          timing_of_delivery: string | null
          total_budget: number
        }
        Insert: {
          audience_country?: string | null
          building_proposal_start_date?: string | null
          company?: string | null
          created_at?: string
          creative_builder?: string | null
          creators_expected?: number
          csm?: string | null
          currency?: string | null
          days_building_proposal?: number | null
          deal_created_date?: string | null
          declined_reasons?: string | null
          execution_board_start_date?: string | null
          id?: string
          influencers_budget?: number
          list_builder?: string | null
          monday_item_id?: string | null
          musical_genre?: string | null
          name: string
          pending_approval_start_date?: string | null
          proposal_adjustments?: number
          proposal_board_start_date?: string | null
          proposal_delivery_date?: string | null
          seller?: string | null
          status?: string
          sub_campaign_budget?: number
          take_rate_pct?: number
          timing_of_delivery?: string | null
          total_budget?: number
        }
        Update: {
          audience_country?: string | null
          building_proposal_start_date?: string | null
          company?: string | null
          created_at?: string
          creative_builder?: string | null
          creators_expected?: number
          csm?: string | null
          currency?: string | null
          days_building_proposal?: number | null
          deal_created_date?: string | null
          declined_reasons?: string | null
          execution_board_start_date?: string | null
          id?: string
          influencers_budget?: number
          list_builder?: string | null
          monday_item_id?: string | null
          musical_genre?: string | null
          name?: string
          pending_approval_start_date?: string | null
          proposal_adjustments?: number
          proposal_board_start_date?: string | null
          proposal_delivery_date?: string | null
          seller?: string | null
          status?: string
          sub_campaign_budget?: number
          take_rate_pct?: number
          timing_of_delivery?: string | null
          total_budget?: number
        }
        Relationships: []
      }
      team_kpis: {
        Row: {
          action_required: string
          ai_insight: string
          budget: number
          campaign_manager: string
          campaign_name: string
          client_name: string
          conversions: number
          created_at: string
          execution_days: number
          id: string
          impressions: number
          risk_score: number
          role: string
          spent: number
          status: string
        }
        Insert: {
          action_required?: string
          ai_insight?: string
          budget?: number
          campaign_manager: string
          campaign_name: string
          client_name: string
          conversions?: number
          created_at?: string
          execution_days?: number
          id?: string
          impressions?: number
          risk_score: number
          role: string
          spent?: number
          status?: string
        }
        Update: {
          action_required?: string
          ai_insight?: string
          budget?: number
          campaign_manager?: string
          campaign_name?: string
          client_name?: string
          conversions?: number
          created_at?: string
          execution_days?: number
          id?: string
          impressions?: number
          risk_score?: number
          role?: string
          spent?: number
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
