import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session = signal<Session | null>(null);

  readonly session = this._session.asReadonly();

  constructor() {
    this.supabase = createClient(
      'https://yjuybqbfyxonqahfmvkp.supabase.co',
      'sb_publishable_TB2HhLPnBMmNDiuKXmHdQg_3LCJPi0W'
    );

    // Get initial session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session.set(session);
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
    });
  }

  async signInWithEmail(email: string) {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) throw error;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getScores() {
    const user = this.session()?.user;
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching scores:', error);
      return null;
    }

    return data;
  }

  async saveScore(difficulty: string, score: number) {
    const user = this.session()?.user;
    if (!user) return;

    // First, check if we have a record
    const { data: existing } = await this.supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const update: any = {
      user_id: user.id,
      [difficulty]: score,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Only update if current score is better (lower time)
      const currentBest = existing[difficulty];
      if (currentBest === null || score < currentBest) {
        const { error } = await this.supabase
          .from('scores')
          .update(update)
          .eq('user_id', user.id);
        if (error) console.error('Error updating score:', error);
      }
    } else {
      const { error } = await this.supabase
        .from('scores')
        .insert([update]);
      if (error) console.error('Error inserting score:', error);
    }
  }
}
