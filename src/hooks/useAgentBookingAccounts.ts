import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, addDoc, serverTimestamp, increment, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateBookingCharge, getNextBookingType, getChargeTier, AGENT_RULES } from '@/types/agent-tasks';

const MAX_TICKETS_PER_ACCOUNT = 8;

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export interface BookingAccount {
  id: string;
  bookingId: string;
  password: string;
  label?: string;
  bookingCount: number;
  lastResetMonth: string;
  createdAt: any;
  updatedAt: any;
}

export interface BookingRotationState {
  currentAccountIndex: number;
  totalBookingsThisMonth: number;
  lastBookingType: 'ac' | 'sleeper' | null;
  lastUpdated: any;
}

export interface AgentEarnings {
  totalChargesEarned: number;
  referralBonuses: number;
  totalEarnings: number;
  bookingsThisMonth: number;
}

export const useAgentBookingAccounts = (agentEmail?: string) => {
  const [accounts, setAccounts] = useState<BookingAccount[]>([]);
  const [rotationState, setRotationState] = useState<BookingRotationState>({
    currentAccountIndex: 0,
    totalBookingsThisMonth: 0,
    lastBookingType: null,
    lastUpdated: null,
  });
  const [earnings, setEarnings] = useState<AgentEarnings>({
    totalChargesEarned: 0,
    referralBonuses: 0,
    totalEarnings: 0,
    bookingsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  const email = agentEmail?.toLowerCase() || '';

  // Listen to accounts (credentials)
  useEffect(() => {
    if (!email) return;

    const credRef = collection(db, 'agent_booking_credentials');
    const q = query(credRef, where('agentEmail', '==', email), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const currentMonth = getCurrentMonthKey();
      const list = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const account: BookingAccount = {
          id: docSnap.id,
          bookingId: data.bookingId,
          password: data.password,
          label: data.label,
          bookingCount: data.bookingCount || 0,
          lastResetMonth: data.lastResetMonth || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };

        // Auto-reset if month changed
        if (account.lastResetMonth !== currentMonth) {
          updateDoc(doc(db, 'agent_booking_credentials', account.id), {
            bookingCount: 0,
            lastResetMonth: currentMonth,
            updatedAt: serverTimestamp()
          });
          account.bookingCount = 0;
          account.lastResetMonth = currentMonth;
        }

        return account;
      });
      setAccounts(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [email]);

  // Listen to rotation state
  useEffect(() => {
    if (!email) return;

    const rotationRef = doc(db, 'agent_booking_rotation', email);
    const unsubscribe = onSnapshot(rotationRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentMonth = getCurrentMonthKey();

        // Auto-reset rotation if month changed
        if (data.monthKey !== currentMonth) {
          setDoc(rotationRef, {
            agentEmail: email,
            currentAccountIndex: 0,
            totalBookingsThisMonth: 0,
            lastBookingType: null,
            monthKey: currentMonth,
            lastUpdated: serverTimestamp()
          });
          setRotationState({
            currentAccountIndex: 0,
            totalBookingsThisMonth: 0,
            lastBookingType: null,
            lastUpdated: null,
          });
        } else {
          setRotationState({
            currentAccountIndex: data.currentAccountIndex || 0,
            totalBookingsThisMonth: data.totalBookingsThisMonth || 0,
            lastBookingType: data.lastBookingType || null,
            lastUpdated: data.lastUpdated,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [email]);

  // Listen to earnings
  useEffect(() => {
    if (!email) return;

    const earningsRef = doc(db, 'agent_earnings', email);
    const unsubscribe = onSnapshot(earningsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentMonth = getCurrentMonthKey();

        if (data.monthKey !== currentMonth) {
          // Reset monthly earnings but keep totals
          setDoc(earningsRef, {
            agentEmail: email,
            totalChargesEarned: data.totalChargesEarned || 0,
            referralBonuses: data.referralBonuses || 0,
            totalEarnings: data.totalEarnings || 0,
            bookingsThisMonth: 0,
            monthKey: currentMonth,
            lastUpdated: serverTimestamp()
          }, { merge: true });
          setEarnings({
            totalChargesEarned: data.totalChargesEarned || 0,
            referralBonuses: data.referralBonuses || 0,
            totalEarnings: data.totalEarnings || 0,
            bookingsThisMonth: 0,
          });
        } else {
          setEarnings({
            totalChargesEarned: data.totalChargesEarned || 0,
            referralBonuses: data.referralBonuses || 0,
            totalEarnings: data.totalEarnings || 0,
            bookingsThisMonth: data.bookingsThisMonth || 0,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [email]);

  /** Get the next account to use and the booking type (AC/SL) */
  const getNextBookingAccount = useCallback((): { account: BookingAccount | null; bookingType: 'ac' | 'sleeper' } => {
    if (accounts.length === 0) return { account: null, bookingType: 'ac' };

    const bookingType = getNextBookingType(rotationState.totalBookingsThisMonth);
    let idx = rotationState.currentAccountIndex % accounts.length;

    // Find an account that isn't at max capacity
    for (let i = 0; i < accounts.length; i++) {
      const checkIdx = (idx + i) % accounts.length;
      if (accounts[checkIdx].bookingCount < MAX_TICKETS_PER_ACCOUNT) {
        return { account: accounts[checkIdx], bookingType };
      }
    }

    return { account: null, bookingType }; // All accounts full
  }, [accounts, rotationState]);

  /** Complete a booking: update rotation, increment count, calculate charges, credit earnings */
  const completeBooking = useCallback(async (
    bookingId: string,
    accountId: string,
    bookingType: 'ac' | 'sleeper',
    pnr: string,
    agentName: string,
    booking: any,
    isReferral: boolean = false
  ) => {
    if (!email) throw new Error('No agent email');

    const currentMonth = getCurrentMonthKey();
    const accountCount = accounts.length;
    const charge = calculateBookingCharge(accountCount, bookingType);
    const referralBonus = isReferral ? AGENT_RULES.referralBonus : 0;

    // 1. Update booking status
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'agent_done',
      agentPnr: pnr,
      agentBookingAccountId: accountId,
      agentBookingType: bookingType,
      agentCompletedAt: serverTimestamp(),
      agentChargeAmount: charge,
      agentReferralBonus: referralBonus,
      updated_at: serverTimestamp(),
      updated_by: email
    });

    // 2. Increment booking count for the credential
    const credRef = collection(db, 'agent_booking_credentials');
    const credQuery = query(credRef, where('agentEmail', '==', email), where('bookingId', '==', accountId));
    const credSnap = await getDocs(credQuery);
    if (!credSnap.empty) {
      const credDoc = credSnap.docs[0];
      const credData = credDoc.data();
      const count = credData.lastResetMonth === currentMonth ? (credData.bookingCount || 0) : 0;
      await updateDoc(doc(db, 'agent_booking_credentials', credDoc.id), {
        bookingCount: count + 1,
        lastResetMonth: currentMonth,
        updatedAt: serverTimestamp()
      });
    }

    // 3. Update rotation state
    const nextIndex = (rotationState.currentAccountIndex + 1) % Math.max(accounts.length, 1);
    const rotationRef = doc(db, 'agent_booking_rotation', email);
    await setDoc(rotationRef, {
      agentEmail: email,
      currentAccountIndex: nextIndex,
      totalBookingsThisMonth: increment(1),
      lastBookingType: bookingType,
      monthKey: currentMonth,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // 4. Update earnings
    const earningsRef = doc(db, 'agent_earnings', email);
    const earningsSnap = await getDoc(earningsRef);
    if (earningsSnap.exists()) {
      await updateDoc(earningsRef, {
        totalChargesEarned: increment(charge),
        referralBonuses: increment(referralBonus),
        totalEarnings: increment(charge + referralBonus),
        bookingsThisMonth: increment(1),
        monthKey: currentMonth,
        lastUpdated: serverTimestamp()
      });
    } else {
      await setDoc(earningsRef, {
        agentEmail: email,
        totalChargesEarned: charge,
        referralBonuses: referralBonus,
        totalEarnings: charge + referralBonus,
        bookingsThisMonth: 1,
        monthKey: currentMonth,
        lastUpdated: serverTimestamp()
      });
    }

    // 5. Credit ATA points to wallet
    let passengerCount = 0;
    if (Array.isArray(booking.passengers)) {
      passengerCount = booking.passengers.filter((p: any) => p && (p.name || p.age || p.gender)).length;
    } else if (typeof booking.passengers === 'number') {
      passengerCount = booking.passengers;
    } else if (typeof booking.passengers === 'string') {
      passengerCount = parseInt(booking.passengers) || 1;
    }
    if (passengerCount < 1) passengerCount = 1;

    const pointsEarned = passengerCount * 80;
    const walletRef = doc(db, 'agent_wallets', email);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      await updateDoc(walletRef, {
        balance: increment(pointsEarned),
        totalEarned: increment(pointsEarned),
        lastUpdated: serverTimestamp()
      });
    } else {
      await setDoc(walletRef, {
        agentEmail: email,
        agentName: agentName || '',
        balance: pointsEarned,
        totalEarned: pointsEarned,
        totalSpent: 0,
        lastUpdated: serverTimestamp()
      });
    }

    // 6. Record in history
    await addDoc(collection(db, 'task_completion_history'), {
      taskId: bookingId,
      taskTitle: `Booking: ${booking.from} → ${booking.to} (${passengerCount} pax, ${bookingType.toUpperCase()})`,
      agentEmail: email,
      pointsEarned,
      chargeEarned: charge,
      referralBonus,
      bookingType,
      completedAt: serverTimestamp()
    });

    return { charge, referralBonus, pointsEarned, passengerCount };
  }, [email, accounts, rotationState]);

  const tier = getChargeTier(accounts.length);

  return {
    accounts,
    rotationState,
    earnings,
    loading,
    getNextBookingAccount,
    completeBooking,
    tier,
    maxTicketsPerAccount: MAX_TICKETS_PER_ACCOUNT,
    totalAccounts: accounts.length,
    accountsAtCapacity: accounts.filter(a => a.bookingCount >= MAX_TICKETS_PER_ACCOUNT).length,
  };
};
