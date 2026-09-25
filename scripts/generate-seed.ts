// Generates supabase/seed.sql from src/mockData.ts (clubs, courts, coaches, tournaments).
// Run: bun scripts/generate-seed.ts
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';
import { initialClubs, initialCoaches, initialTournaments } from '../src/mockData';

const lit = (v: string | null | undefined): string =>
  v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;

const num = (v: number | null | undefined, dflt = 0): string =>
  v == null || Number.isNaN(v) ? String(dflt) : String(v);

const arr = (xs: string[] | undefined): string =>
  !xs || xs.length === 0 ? "'{}'" : `ARRAY[${xs.map((x) => lit(x)).join(',')}]`;

const json = (v: unknown): string =>
  v == null ? 'NULL' : lit(JSON.stringify(v));

const out: string[] = [];
out.push('-- PadelPro seed data (generated from src/mockData.ts). Idempotent-ish: run once on a fresh DB.');
out.push('-- bun scripts/generate-seed.ts');
out.push('');

const clubIds = new Map<string, string>();
for (const c of initialClubs) {
  const id = randomUUID();
  clubIds.set(c.id, id);
  out.push(`insert into clubs (id, name, province, city, address, phone, cover_image, gallery_images, rating, review_count, amenities, opening_hour, closing_hour, owner_name, owner_phone) values (${lit(id)}, ${lit(c.name)}, ${lit(c.province)}, ${lit(c.city)}, ${lit(c.address)}, ${lit(c.phone)}, ${lit(c.coverImage)}, ${arr(c.galleryImages)}, ${num(c.rating, 5)}, ${num(c.reviewCount)}, ${arr(c.amenities)}, ${lit(c.openingHour)}, ${lit(c.closingHour)}, ${lit(c.ownerName)}, ${lit(c.ownerPhone)});`);
  for (const court of c.courts ?? []) {
    out.push(`insert into courts (id, club_id, name, court_number, type, surface, turf_color, hourly_rate, peak_hourly_rate, is_available, has_lighting, has_cameras) values (${lit(randomUUID())}, ${lit(id)}, ${lit(court.name)}, ${num(court.courtNumber, 1)}, ${lit(court.type)}, ${lit(court.surface)}, ${lit(court.turfColor ?? '')}, ${num(court.hourlyRate)}, ${num(court.peakHourlyRate)}, ${court.isAvailable ? 'true' : 'false'}, ${court.hasLighting ? 'true' : 'false'}, ${court.hasCameras ? 'true' : 'false'});`);
  }
}
out.push('');

for (const coach of initialCoaches) {
  out.push(`insert into coaches (id, name, avatar_url, title, fip_certification, experience_years, rating, reviews_count, province, club_names, hourly_rate, bio, specialties, available_days, available_hours) values (${lit(randomUUID())}, ${lit(coach.name)}, ${lit(coach.avatar)}, ${lit(coach.title)}, ${lit(coach.fipCertification)}, ${num(coach.experienceYears)}, ${num(coach.rating, 5)}, ${num(coach.reviewsCount)}, ${lit(coach.province)}, ${arr(coach.clubs)}, ${num(coach.hourlyRate)}, ${lit(coach.bio)}, ${arr(coach.specialties)}, ${arr(coach.availableDays)}, ${arr(coach.availableHours)});`);
}
out.push('');

for (const t of initialTournaments) {
  const tid = randomUUID();
  const clubId = t.clubId && clubIds.get(t.clubId) ? lit(clubIds.get(t.clubId)) : 'NULL';
  const organizerType = t.organizerType === 'club' ? 'official' : 'friendly';
  out.push(`insert into tournaments (id, title, club_id, club_name, province, category, format, start_date, end_date, registration_deadline, entry_fee, prize_pool, max_teams, level_range, status, banner_image, rules, organizer_type, winner_team, runner_up_team, bracket) values (${lit(tid)}, ${lit(t.title)}, ${clubId}, ${lit(t.clubName)}, ${lit(t.province)}, ${lit(t.category)}, ${lit(t.format)}, ${lit(t.startDate)}, ${lit(t.endDate)}, ${lit(t.registrationDeadline)}, ${num(t.entryFee)}, ${lit(t.prizePool)}, ${num(t.maxTeams, 16)}, ${lit(t.levelRange)}, ${lit(t.status)}, ${lit(t.bannerImage)}, ${arr(t.rules)}, '${organizerType}'::organizer_type, ${lit(t.winnerTeam ?? '')}, ${lit(t.runnerUpTeam ?? '')}, ${json(t.bracket ?? null)});`);
  for (const team of t.registeredTeams ?? []) {
    out.push(`insert into tournament_teams (id, tournament_id, team_name, player1_name, player1_level, player2_name, player2_level, points_won) values (${lit(randomUUID())}, ${lit(tid)}, ${lit(team.teamName)}, ${lit(team.player1Name)}, ${num(team.player1Level, 3)}, ${lit(team.player2Name)}, ${num(team.player2Level, 3)}, ${num(team.pointsWon ?? 0)});`);
  }
}
out.push('');

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), out.join('\n'));
console.log(`seed.sql written: ${initialClubs.length} clubs, ${initialCoaches.length} coaches, ${initialTournaments.length} tournaments`);
