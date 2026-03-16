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

    try {
      const { data, error } = await this.supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching scores:', error);
        return null;
      }

      // If data is null, it means no row exists for this user yet
      return data;
    } catch (err) {
      console.error('Unexpected error fetching scores:', err);
      return null;
    }
  }

  async saveScore(difficulty: string, score: number) {
    const user = this.session()?.user;
    if (!user) {
      console.warn('Cannot save score: No active session');
      return;
    }

    try {
      // First, check if we have a record
      const { data: existing, error: fetchError } = await this.supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing scores before save:', fetchError);
        return;
      }

      const scoreValue = Number(score);
      const updatePayload: any = {
        user_id: user.id,
        [difficulty]: scoreValue,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        // Only update if current score is better (lower time)
        const currentBest = existing[difficulty];
        if (currentBest === null || scoreValue < currentBest) {
          const { error: updateError } = await this.supabase
            .from('scores')
            .update(updatePayload)
            .eq('user_id', user.id);
          
          if (updateError) {
            console.error('Error updating score record:', updateError);
          } else {
            console.log(`Successfully updated ${difficulty} best score to ${scoreValue} in Supabase`);
          }
        } else {
          console.log(`Existing score for ${difficulty} (${currentBest}) is better than or equal to ${scoreValue}. No update needed.`);
        }
      } else {
        // Insert new record
        console.log(`Creating initial score record for user ${user.id} with ${difficulty}: ${scoreValue}`);
        const { error: insertError } = await this.supabase
          .from('scores')
          .insert([updatePayload]);
        
        if (insertError) {
          console.error('Error creating new score record:', insertError);
          if (insertError.code === '42P01') {
            console.error('CRITICAL: The "scores" table does not exist in the database.');
          } else if (insertError.code === '42501') {
            console.error('CRITICAL: RLS Policy prevents insertion. Check Supabase Row Level Security.');
          }
        } else {
          console.log(`Successfully created initial record with ${difficulty} score: ${scoreValue}`);
        }
      }
    } catch (err) {
      console.error('Fatal error in saveScore process:', err);
    }
  }
}
