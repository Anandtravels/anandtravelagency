import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc, serverTimestamp, orderBy, limit, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type BookingType = 'AC' | 'Sleeper';

export interface DailyWalletEntry {
  id: string;
  agentEmail: string;
  date: string; // YYYY-MM-DD
  bookingType: BookingType;
  receivedAmount: number;
  ticketFare: number;
  charges: number;
  balance: number; // running balance after this entry
  notes?: string;
  createdAt: any;
}

export interface DailyWalletSummary {
  totalReceived: number;
  totalTicketFare: number;
  totalCharges: number;
  currentBalance: number; // latest running balance (not sum)
}

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useAgentDailyWallet = (agentEmail?: string) => {
  const [entries, setEntries] = useState<DailyWalletEntry[]>([]);
  const [summary, setSummary] = useState<DailyWalletSummary>({
    totalReceived: 0,
    totalTicketFare: 0,
    totalCharges: 0,
    currentBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  const email = agentEmail?.toLowerCase() || '';

  // Listen to all entries for this agent, ordered by createdAt ascending
  useEffect(() => {
    if (!email) { setLoading(false); return; }

    const q = query(
      collection(db, 'agent_daily_wallet'),
      where('agentEmail', '==', email),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: DailyWalletEntry[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as DailyWalletEntry));

      setEntries(list);

      // Calculate summary: totals are sums, balance is latest entry's balance
      const totals = list.reduce((acc, entry) => ({
        totalReceived: acc.totalReceived + (entry.receivedAmount || 0),
        totalTicketFare: acc.totalTicketFare + (entry.ticketFare || 0),
        totalCharges: acc.totalCharges + (entry.charges || 0),
      }), { totalReceived: 0, totalTicketFare: 0, totalCharges: 0 });

      const latestBalance = list.length > 0 ? (list[list.length - 1].balance || 0) : 0;

      setSummary({ ...totals, currentBalance: latestBalance });
      setLoading(false);
    }, (error) => {
      console.error('Error fetching daily wallet:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [email]);

  /** Add a new entry (never overwrites). Balance = prev balance + received - fare - charges */
  const saveDailyEntry = useCallback(async (
    receivedAmount: number,
    ticketFare: number,
    charges: number,
    bookingType: BookingType,
    notes?: string
  ) => {
    if (!email) throw new Error('No agent email');

    const today = getTodayKey();
    // Get previous balance from latest entry
    const prevBalance = entries.length > 0 ? (entries[entries.length - 1].balance || 0) : 0;
    const newBalance = prevBalance + receivedAmount - ticketFare - charges;

    const docRef = await addDoc(collection(db, 'agent_daily_wallet'), {
      agentEmail: email,
      date: today,
      bookingType,
      receivedAmount,
      ticketFare,
      charges,
      balance: newBalance,
      notes: notes || '',
      createdAt: serverTimestamp(),
    });

    return { balance: newBalance, docId: docRef.id };
  }, [email, entries]);

  /** Delete an entry and recalculate all subsequent balances */
  const deleteDailyEntry = useCallback(async (entryId: string) => {
    if (!email) throw new Error('No agent email');

    // Fetch fresh entries from Firestore to avoid stale closure issues
    const freshQuery = query(
      collection(db, 'agent_daily_wallet'),
      where('agentEmail', '==', email),
      orderBy('createdAt', 'asc')
    );
    const freshSnapshot = await getDocs(freshQuery);
    const freshEntries = freshSnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as DailyWalletEntry[];

    const entryIndex = freshEntries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) throw new Error('Entry not found');

    const batch = writeBatch(db);

    // Delete the entry
    batch.delete(doc(db, 'agent_daily_wallet', entryId));

    // Recalculate balances for all entries after the deleted one
    const prevBalance = entryIndex > 0 ? (freshEntries[entryIndex - 1].balance || 0) : 0;
    let runningBalance = prevBalance;

    for (let i = entryIndex + 1; i < freshEntries.length; i++) {
      const e = freshEntries[i];
      runningBalance = runningBalance + (e.receivedAmount || 0) - (e.ticketFare || 0) - (e.charges || 0);
      batch.update(doc(db, 'agent_daily_wallet', e.id), { balance: runningBalance });
    }

    await batch.commit();
  }, [email]);

  /** Update aggregate summary in Firestore (called when entries change) */
  useEffect(() => {
    if (!email || loading) return;

    const summaryRef = doc(db, 'agent_wallet_summary', email);
    setDoc(summaryRef, {
      agentEmail: email,
      totalReceived: summary.totalReceived,
      totalTicketFare: summary.totalTicketFare,
      totalCharges: summary.totalCharges,
      currentBalance: summary.currentBalance,
      entryCount: entries.length,
      lastUpdated: serverTimestamp()
    }, { merge: true }).catch(err => {
      console.error('Error updating wallet summary:', err);
    });
  }, [email, summary.totalReceived, summary.totalTicketFare, summary.totalCharges, summary.currentBalance, entries.length, loading]);

  // Today's entries (multiple per day)
  const todayEntries = entries.filter(e => e.date === getTodayKey());

  return {
    entries,
    summary,
    todayEntries,
    loading,
    saveDailyEntry,
    deleteDailyEntry,
    todayKey: getTodayKey(),
  };
};

/** Hook for admin to view all agents' wallet summaries */
export const useAllAgentWalletSummaries = () => {
  const [summaries, setSummaries] = useState<Array<{
    agentEmail: string;
    totalReceived: number;
    totalTicketFare: number;
    totalCharges: number;
    currentBalance: number;
    entryCount: number;
    lastUpdated: any;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'agent_wallet_summary'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        agentEmail: d.id,
        ...d.data()
      })) as any[];
      setSummaries(list);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching wallet summaries:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { summaries, loading };
};

/** Hook for admin to view a specific agent's entries */
export const useAgentDailyEntries = (agentEmail?: string) => {
  const [entries, setEntries] = useState<DailyWalletEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agentEmail) { setLoading(false); return; }

    const email = agentEmail.toLowerCase();
    const q = query(
      collection(db, 'agent_daily_wallet'),
      where('agentEmail', '==', email),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: DailyWalletEntry[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as DailyWalletEntry));
      setEntries(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [agentEmail]);

  return { entries, loading };
};
