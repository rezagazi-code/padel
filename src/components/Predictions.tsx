import React, { useEffect, useMemo, useState } from 'react';
import { Target, Pencil, Check, Medal, User } from 'lucide-react';
import {
  getPredictions,
  savePrediction,
  scorePredictions,
  getPredictorName,
  setPredictorName,
  officialMatchesOf,
  friendlyMatchesOf,
  type PredictableMatch,
  type LeaderboardEntry,
  type Prediction,
} from '../lib/predictions';
import type { Tournament, FriendlyTournament } from '../types';

interface PredictionsProps {
  tournamentId: string;
  matches: PredictableMatch[];
  /** Suggested name for the predictor (e.g. the signed-in player's name). */
  defaultName?: string;
}

/**
 * «پیش‌بینی قهرمان» — pick the winner of each not-yet-decided match
 * and climb the local predictors leaderboard.
 */
export const Predictions: React.FC<PredictionsProps> = ({
  tournamentId,
  matches,
  defaultName,
}) => {
  const [name, setName] = useState(() => getPredictorName());
  const [nameDraft, setNameDraft] = useState('');
  const [editingName, setEditingName] = useState(() => !getPredictorName());
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const refresh = (ms: PredictableMatch[]) => {
    setLeaderboard(scorePredictions(tournamentId, ms));
    setPredictions(getPredictions(tournamentId));
  };

  useEffect(() => {
    refresh(matches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId, matches]);

  const openMatches = useMemo(() => matches.filter((m) => !m.decided), [matches]);
  const decidedMatches = useMemo(() => matches.filter((m) => m.decided), [matches]);
  const myPredictions = useMemo(
    () => decidedMatches.filter((m) => predictions[m.id]),
    [decidedMatches, predictions]
  );

  if (matches.length === 0) return null;

  const myName = name.trim();

  const commitName = () => {
    const v = (nameDraft || defaultName || '').trim();
    if (!v) return;
    setPredictorName(v);
    setName(v);
    setNameDraft('');
    setEditingName(false);
  };

  const pick = (matchId: string, teamId: string) => {
    if (!myName || predictions[matchId]?.predictedTeamId === teamId) return;
    savePrediction(tournamentId, matchId, teamId, myName);
    refresh(matches);
  };

  const teamNameOf = (m: PredictableMatch, teamId: string) =>
    teamId === m.team1.id ? m.team1.name : teamId === m.team2.id ? m.team2.name : '—';

  return (
    <div className="court-card p-5 space-y-4">
      <div className="court-title">
        <h4 className="text-sm font-black text-slate-100 flex items-center gap-2 whitespace-nowrap">
          <Target className="w-4 h-4 text-[#ff6b81]" />
          پیش‌بینی قهرمان
        </h4>
      </div>
      <p className="text-[11px] text-slate-500 text-center -mt-2">
        برنده هر بازی را حدس بزن؛ امتیازت در جدول پیش‌بینی‌کننده‌ها ثبت می‌شود
      </p>

      {/* Predictor identity — asked once, editable */}
      {editingName || !myName ? (
        <div className="flex gap-2">
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitName()}
            placeholder={defaultName || 'نام شما برای جدول پیش‌بینی'}
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-[#ff2d55]/60 focus:outline-none"
          />
          <button
            onClick={commitName}
            className="btn-fire px-4 py-2 rounded-xl text-xs font-black text-white flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            ثبت نام
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2">
          <span className="text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#ff6b81]" />
            شرکت‌کننده:
            <b className="text-slate-100">{myName}</b>
          </span>
          <button
            onClick={() => {
              setNameDraft(myName);
              setEditingName(true);
            }}
            className="text-slate-500 hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            ویرایش
          </button>
        </div>
      )}

      {/* Open matches — pick a winner */}
      {openMatches.length > 0 && (
        <div className="space-y-2.5">
          {openMatches.map((m) => (
            <div key={m.id} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
              <p className="text-[11px] text-slate-500 font-bold mb-2">{m.roundName}</p>
              <div className="grid grid-cols-2 gap-2">
                {[m.team1, m.team2].map((t) => {
                  const selected = predictions[m.id]?.predictedTeamId === t.id;
                  return (
                    <button
                      key={t.id}
                      disabled={!myName}
                      onClick={() => pick(m.id, t.id)}
                      className={`border rounded-xl px-3 py-2.5 text-xs font-black transition cursor-pointer ${
                        selected
                          ? 'border-[#ff2d55]/60 bg-[#ff2d55]/10 text-white shadow-[0_0_18px_-4px_rgba(255,45,85,0.5)]'
                          : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!myName && (
            <p className="text-[11px] text-amber-300/80 text-center">
              اول نامت را ثبت کن تا پیش‌بینی فعال شود
            </p>
          )}
        </div>
      )}

      {/* My decided predictions — right / wrong */}
      {myPredictions.length > 0 && (
        <div className="space-y-1.5">
          {myPredictions.map((m) => {
            const p = predictions[m.id];
            return (
              <div
                key={m.id}
                className="flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.02]"
              >
                <span className="text-slate-500">
                  {m.roundName}: <b className="text-slate-300">{teamNameOf(m, p.predictedTeamId)}</b>
                </span>
                {p.correct === undefined ? (
                  <span className="text-slate-600">در انتظار نتیجه</span>
                ) : p.correct ? (
                  <span className="text-emerald-300 font-black">درست ✓</span>
                ) : (
                  <span className="text-rose-400 font-black">اشتباه ✗</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="space-y-2.5">
          <div className="court-divider" />
          <div className="court-title">
            <h5 className="text-xs font-black text-slate-200 flex items-center gap-1.5 whitespace-nowrap">
              <Medal className="w-3.5 h-3.5 text-amber-400" />
              جدول پیش‌بینی‌کننده‌ها
            </h5>
          </div>
          <div className="space-y-1.5">
            {leaderboard.map((e, i) => {
              const isMe = myName !== '' && e.name === myName;
              return (
                <div
                  key={e.name}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs ${
                    isMe ? 'bg-[#ff2d55]/10 border border-[#ff2d55]/30' : 'bg-white/[0.02]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${
                      i === 0
                        ? 'bg-amber-400 text-white'
                        : i === 1
                          ? 'bg-slate-300 text-slate-800'
                          : i === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-white/[0.06] text-slate-500'
                    }`}
                  >
                    {(i + 1).toLocaleString('fa-IR')}
                  </span>
                  <span className={`font-bold flex-1 ${isMe ? 'text-white' : 'text-slate-300'}`}>
                    {e.name}
                    {isMe && <span className="text-[#ff6b81] text-[10px]"> (شما)</span>}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    <b className="text-emerald-300">{e.correct.toLocaleString('fa-IR')}</b>
                    {' از '}
                    {e.total.toLocaleString('fa-IR')} درست
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/** Ready-made mount for an official tournament's detail view. */
export const OfficialTournamentPredictions: React.FC<{
  tournament: Tournament;
  defaultName?: string;
}> = ({ tournament, defaultName }) => {
  const matches = useMemo(() => officialMatchesOf(tournament), [tournament]);
  return <Predictions tournamentId={tournament.id} matches={matches} defaultName={defaultName} />;
};

/** Ready-made mount for a friendly tournament's detail view. */
export const FriendlyTournamentPredictions: React.FC<{
  tournament: FriendlyTournament;
  defaultName?: string;
}> = ({ tournament, defaultName }) => {
  const matches = useMemo(() => friendlyMatchesOf(tournament), [tournament]);
  return <Predictions tournamentId={tournament.id} matches={matches} defaultName={defaultName} />;
};
