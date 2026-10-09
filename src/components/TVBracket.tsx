import React from 'react';
import { Trophy } from 'lucide-react';

export interface BracketMatch {
  id: string;
  round: number;
  roundName: string;
  team1: string;
  team2: string;
  winner?: string;
  score1?: number;
  score2?: number;
}

interface TVBracketProps {
  matches: BracketMatch[];
  title: string;
}

export const TVBracket: React.FC<TVBracketProps> = ({ matches, title }) => {
  if (matches.length === 0) {
    return (
      <div className="rounded-3xl bg-white/[0.04] border border-white/10 p-8 text-center">
        <Trophy className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm">هنوز جدولی ساخته نشده است.</p>
      </div>
    );
  }

  // Group matches by round
  const rounds = new Map<number, BracketMatch[]>();
  matches.forEach((m) => {
    if (!rounds.has(m.round)) rounds.set(m.round, []);
    rounds.get(m.round)!.push(m);
  });
  const sortedRounds = Array.from(rounds.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0d1420] to-[#080d16]">
      {/* TV-style header */}
      <div className="bg-gradient-to-l from-[#ff2d55]/20 via-[#ff2d55]/10 to-transparent border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff2d55] flex items-center justify-center shadow-lg shadow-[#ff2d55]/30">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-100 text-lg">{title}</h3>
            <p className="text-[11px] text-slate-500">جدول مسابقات • پخش زنده</p>
          </div>
          <div className="mr-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* Bracket */}
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {sortedRounds.map(([roundNum, roundMatches]) => (
            <div key={roundNum} className="flex flex-col gap-6 min-w-[220px]">
              <div className="text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-black text-slate-300">
                  {roundMatches[0]?.roundName || `دور ${roundNum}`}
                </span>
              </div>
              <div className="flex flex-col gap-4 justify-around flex-1">
                {roundMatches.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl bg-white/[0.05] border border-white/10 overflow-hidden hover:border-[#ff2d55]/30 transition"
                  >
                    {/* Team 1 */}
                    <div
                      className={`px-4 py-2.5 flex items-center justify-between border-b border-white/[0.07] ${
                        m.winner === m.team1 ? 'bg-emerald-500/[0.08]' : ''
                      }`}
                    >
                      <span className={`text-sm font-bold ${m.winner === m.team1 ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {m.team1}
                      </span>
                      {m.score1 !== undefined && (
                        <span className={`text-sm font-black ${m.winner === m.team1 ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {m.score1}
                        </span>
                      )}
                    </div>
                    {/* Team 2 */}
                    <div
                      className={`px-4 py-2.5 flex items-center justify-between ${
                        m.winner === m.team2 ? 'bg-emerald-500/[0.08]' : ''
                      }`}
                    >
                      <span className={`text-sm font-bold ${m.winner === m.team2 ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {m.team2}
                      </span>
                      {m.score2 !== undefined && (
                        <span className={`text-sm font-black ${m.winner === m.team2 ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {m.score2}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
