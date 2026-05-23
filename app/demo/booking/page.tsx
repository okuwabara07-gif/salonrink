'use client';

import React, { useMemo } from 'react';
import { sampleReservations } from '@/lib/demo/fixtures';
import styles from './page.module.css';

interface TimeSlot {
  hour: number;
  minute: number;
  reservations: (typeof sampleReservations)[0][];
}

export default function DemoBookingPage() {
  const today = new Date();

  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];

    // Generate time slots from 9:00 to 21:00
    for (let hour = 9; hour < 21; hour++) {
      slots.push({
        hour,
        minute: 0,
        reservations: [],
      });
    }

    // Filter today's and future reservations
    const relevantReservations = sampleReservations.filter((res) => {
      const resDate = new Date(res.datetime);
      const resHour = resDate.getHours();
      return resDate.toDateString() === today.toDateString() && resHour >= 9 && resHour < 21;
    });

    // Assign reservations to slots
    relevantReservations.forEach((res) => {
      const resDate = new Date(res.datetime);
      const resHour = resDate.getHours();
      const slot = slots.find((s) => s.hour === resHour);
      if (slot) {
        slot.reservations.push(res);
      }
    });

    return slots;
  }, [today]);

  const todayRevenue = useMemo(() => {
    return sampleReservations
      .filter((res) => new Date(res.datetime).toDateString() === today.toDateString())
      .reduce((sum, res) => sum + res.estimatedPrice, 0);
  }, [today]);

  const todayCount = useMemo(() => {
    return sampleReservations.filter(
      (res) => new Date(res.datetime).toDateString() === today.toDateString()
    ).length;
  }, [today]);

  return (
    <div className={styles.page}>
      <div className={styles.demoBadge}>
        <span className={styles.demoBadgeIcon}>🔍</span>
        デモモード - これは架空データです
      </div>

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>本日の予約</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>予約件数</span>
              <span className={styles.statValue}>{todayCount}件</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>予想売上</span>
              <span className={styles.statValue}>¥{todayRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <button
          className={styles.newBookingBtn}
          onClick={() => alert('これはデモです。\n\n実際にご利用いただくには、無料相談をお試しください。')}
        >
          + 新規予約
        </button>
      </div>

      <div className={styles.timeTableContainer}>
        <div className={styles.timeTable}>
          {timeSlots.map((slot) => (
            <div key={slot.hour} className={styles.timeSlot}>
              <div className={styles.timeLabel}>
                {String(slot.hour).padStart(2, '0')}:00
              </div>
              <div className={styles.slotContent}>
                {slot.reservations.length === 0 ? (
                  <div className={styles.emptySlot}>—</div>
                ) : (
                  <div className={styles.reservationsList}>
                    {slot.reservations.map((res) => (
                      <div key={res.id} className={styles.reservationCard}>
                        <div className={styles.resTime}>
                          {String(new Date(res.datetime).getHours()).padStart(2, '0')}:
                          {String(new Date(res.datetime).getMinutes()).padStart(2, '0')}
                        </div>
                        <div className={styles.resCustomer}>
                          <div className={styles.resName}>{res.customerName}</div>
                          <div className={styles.resMenu}>{res.menuName}</div>
                        </div>
                        <div className={styles.resPrice}>
                          ¥{res.estimatedPrice.toLocaleString()}
                        </div>
                        <div className={styles.resSource}>
                          {res.source === 'hpb' ? 'HPB' : 'Manual'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
