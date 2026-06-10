import { desc, and, eq, isNull, asc } from 'drizzle-orm';
import { db, client } from './drizzle';
import { activityLogs, bibleDaily, teamMembers, teams, users, rosters } from './schema';
import { cookies, headers } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

export async function getBibleDaily(date: string) {
  const result = await db.query.bibleDaily.findFirst({
    where: eq(bibleDaily.date, date)
  });

  return result || null;
}

export async function getRosterByDateAndService(date: string, service: string) {
  const result = await db.query.rosters.findFirst({
    where: and(eq(rosters.date, date), eq(rosters.service, service))
  });

  return result || null;
}

export async function getAllRosterDates() {
  const result = await db
    .selectDistinct({
      date: rosters.date,
    })
    .from(rosters)
    .orderBy(asc(rosters.date));

  return result.map(r => r.date);
}

export async function getMonthlyRosterStats(yearMonth: string) {
  // yearMonth should be in format 'YYYY-MM'
  const result = await client`
    SELECT
      name,
      COUNT(*) AS service_count
    FROM rosters
    WHERE TO_CHAR(date, 'YYYY-MM') = ${yearMonth}
    GROUP BY name
    ORDER BY service_count DESC
  `;

  return result as any as Array<{ name: string; service_count: number }>;
}
