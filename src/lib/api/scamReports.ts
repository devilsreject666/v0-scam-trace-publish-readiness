// Scam Reports Service - Supabase Integration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ScamReport {
  id?: string;
  user_id?: string | null;
  scam_type: string;
  url?: string | null;
  description: string;
  timeline?: string | null;
  loss_amount?: number | null;
  loss_currency?: string;
  wallet_addresses?: string[];
  phone_numbers?: string[];
  emails?: string[];
  usernames?: string[];
  platform?: string | null;
  files?: Array<{ name: string; url: string; type: string }>;
  extracted_entities?: Array<{ type: string; value: string; confidence: number }>;
  status?: 'pending' | 'verified' | 'investigating' | 'resolved' | 'rejected';
  risk_score?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ScamReportStats {
  totalReports: number;
  totalLossAmount: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  recentReports: ScamReport[];
}

// Submit a new scam report
export async function submitScamReport(report: Omit<ScamReport, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: ScamReport | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .insert([{
        ...report,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting scam report:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Error submitting scam report:', err);
    return { data: null, error: err as Error };
  }
}

// Get all scam reports with optional filters
export async function getScamReports(options?: {
  limit?: number;
  offset?: number;
  scamType?: string;
  status?: string;
  searchTerm?: string;
}): Promise<{ data: ScamReport[]; error: Error | null; count: number }> {
  try {
    let query = supabase
      .from('scam_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options?.scamType) {
      query = query.eq('scam_type', options.scamType);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.searchTerm) {
      query = query.or(`description.ilike.%${options.searchTerm}%,url.ilike.%${options.searchTerm}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching scam reports:', error);
      return { data: [], error: new Error(error.message), count: 0 };
    }

    return { data: data || [], error: null, count: count || 0 };
  } catch (err) {
    console.error('Error fetching scam reports:', err);
    return { data: [], error: err as Error, count: 0 };
  }
}

// Get a single scam report by ID
export async function getScamReportById(id: string): Promise<{ data: ScamReport | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Get scam report statistics
export async function getScamReportStats(): Promise<{ data: ScamReportStats | null; error: Error | null }> {
  try {
    // Get total count and recent reports
    const { data: reports, error: reportsError, count } = await supabase
      .from('scam_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10);

    if (reportsError) {
      return { data: null, error: new Error(reportsError.message) };
    }

    // Get all reports for aggregation
    const { data: allReports, error: allError } = await supabase
      .from('scam_reports')
      .select('scam_type, status, loss_amount');

    if (allError) {
      return { data: null, error: new Error(allError.message) };
    }

    // Calculate aggregations
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalLossAmount = 0;

    (allReports || []).forEach(report => {
      // By type
      byType[report.scam_type] = (byType[report.scam_type] || 0) + 1;
      
      // By status
      byStatus[report.status || 'pending'] = (byStatus[report.status || 'pending'] || 0) + 1;
      
      // Total loss
      if (report.loss_amount) {
        totalLossAmount += Number(report.loss_amount);
      }
    });

    return {
      data: {
        totalReports: count || 0,
        totalLossAmount,
        byType,
        byStatus,
        recentReports: reports || []
      },
      error: null
    };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Update a scam report
export async function updateScamReport(
  id: string,
  updates: Partial<ScamReport>
): Promise<{ data: ScamReport | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

// Search for existing reports by wallet address
export async function searchByWalletAddress(address: string): Promise<{ data: ScamReport[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .select('*')
      .contains('wallet_addresses', [address])
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err as Error };
  }
}

// Search for existing reports by URL/domain
export async function searchByDomain(domain: string): Promise<{ data: ScamReport[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .select('*')
      .ilike('url', `%${domain}%`)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err as Error };
  }
}
