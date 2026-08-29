'use client';

import React, { useState, useMemo } from 'react';
import { sampleCustomers, sampleKarte } from '@/lib/demo/fixtures';
import styles from './page.module.css';

interface ExpandedCustomer {
  customerId: string;
}

export default function DemoCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<ExpandedCustomer | null>(null);

  const filteredCustomers = useMemo(() => {
    return sampleCustomers;
  }, []);

  const karteMap = useMemo(() => {
    const map = new Map(sampleKarte.map((k) => [k.customerId, k]));
    return map;
  }, []);

  const getFormattedDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP');
  };

  const getDaysAgo = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const diffMs = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    return `${diffDays}日前`;
  };

  const expandedKarte = expandedCustomer ? karteMap.get(expandedCustomer.customerId) : null;

  return (
    <div className={styles.page}>
      <div className={styles.demoBadge}>
        <span className={styles.demoBadgeIcon}>🔍</span>
        デモモード - これは架空データです
      </div>

      <div className={styles.header}>
        <h2 className={styles.title}>顧客一覧</h2>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="顧客名・電話番号で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            disabled
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      <div className={styles.customerList}>
        {filteredCustomers.map((customer) => {
          const karte = karteMap.get(customer.id);
          const hasAllergy = karte?.allergies && karte.allergies !== 'なし';
          const isExpanded = expandedCustomer?.customerId === customer.id;

          return (
            <div key={customer.id} className={styles.customerCard}>
              <div
                className={styles.customerCardHeader}
                onClick={() =>
                  setExpandedCustomer(isExpanded ? null : { customerId: customer.id })
                }
              >
                <div className={styles.customerInfo}>
                  <div className={styles.customerName}>{customer.name}</div>
                  <div className={styles.customerMeta}>
                    <span className={styles.metaItem}>📞 {customer.phone}</span>
                    <span className={styles.metaItem}>来店: {getDaysAgo(customer.lastVisitDate)}</span>
                    <span className={styles.metaItem}>累計: {customer.visitCount}回</span>
                    <span className={styles.metaItem}>指名: {customer.favoriteStylist}</span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  {hasAllergy && (
                    <div className={styles.allergyBadge}>
                      ⚠️ {karte?.allergies}
                    </div>
                  )}
                  <div className={styles.expandIcon}>
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>
              </div>

              {isExpanded && karte && (
                <div className={styles.karteDetail}>
                  <div className={styles.karteSection}>
                    <h4 className={styles.karteSectionTitle}>施術履歴</h4>
                    <div className={styles.karteContent}>
                      {karte.serviceHistory.join(', ')}
                    </div>
                  </div>

                  {karte.allergies && karte.allergies !== 'なし' && (
                    <div className={styles.karteSection}>
                      <h4 className={styles.karteSectionTitle}>アレルギー・注意</h4>
                      <div className={styles.karteContent}>{karte.allergies}</div>
                    </div>
                  )}

                  <div className={styles.karteSection}>
                    <h4 className={styles.karteSectionTitle}>顧客の好み</h4>
                    <div className={styles.karteContent}>{karte.preferences}</div>
                  </div>

                  <div className={styles.karteSection}>
                    <h4 className={styles.karteSectionTitle}>備考</h4>
                    <div className={styles.karteContent}>{karte.notes}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
